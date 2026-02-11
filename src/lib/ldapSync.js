import ldap from "ldapjs";
import prisma from "@/lib/prisma";

function createClient(url) {
    return ldap.createClient({ url });
}

function bind(client, dn, password) {
    return new Promise((resolve, reject) => {
        client.bind(dn, password, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function search(client, base, options) {
    return new Promise((resolve, reject) => {
        console.log(`[LDAP Sync] DEBUG: Search called with base=${base}, options=${JSON.stringify(options)}`);
        client.search(base, options, (err, res) => {
            if (err) {
                console.error(`[LDAP Sync] DEBUG: Client.search error:`, err);
                return reject(err);
            }

            const entries = [];
            res.on("searchEntry", (entry) => {
                console.log(`[LDAP Sync] DEBUG: searchEntry received: ${entry.dn}`);
                if (entry && entry.object) {
                    entries.push(entry.object);
                } else {
                    console.log(`[LDAP Sync] DEBUG: Entry has no object property! Keys: ${Object.keys(entry)}`);
                }
            });
            res.on("searchReference", (referral) => {
                console.log('val: ' + referral.uris.join());
            });
            res.on("error", (err) => {
                console.error('[LDAP Sync] DEBUG: Search stream error: ' + err.message);
                reject(err);
            });
            res.on("end", (result) => {
                console.log('[LDAP Sync] DEBUG: Search stream end status: ' + result.status);
                resolve(entries);
            });
        });
    });
}

function unbind(client) {
    return new Promise((resolve, reject) => {
        client.unbind((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function destroy(client) {
    try {
        client.destroy();
    } catch (e) {
        // ignore
    }
}

export async function syncLdapUsers() {
    let client;
    try {
        console.log("[LDAP Sync] DEBUG: Starting sync process (Version 5 - Raw Dump)...");

        // Fetch LDAP settings
        const settings = await prisma.setting.findMany({
            where: {
                key: {
                    in: [
                        "ldap_url",
                        "ldap_bind_dn",
                        "ldap_bind_password",
                        "ldap_base_dn",
                        "ldap_enabled"
                    ]
                }
            }
        });

        const config = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value ? curr.value.trim() : ""; // Sanitize whitespace
            return acc;
        }, {});

        if (config.ldap_enabled !== "true") {
            console.log("[LDAP Sync] LDAP is disabled. Skipping sync.");
            return { success: false, message: "LDAP is disabled" };
        }

        if (!config.ldap_url || !config.ldap_bind_dn || !config.ldap_bind_password || !config.ldap_base_dn) {
            console.log("[LDAP Sync] Missing LDAP configuration.");
            return { success: false, message: "Missing LDAP configuration" };
        }

        console.log(`[LDAP Sync] Connecting to '${config.ldap_url}' with User '${config.ldap_bind_dn}'`);
        console.log(`[LDAP Sync] Base DN: '${config.ldap_base_dn}'`); // Quote to show whitespace

        client = createClient(config.ldap_url);

        try {
            await bind(client, config.ldap_bind_dn, config.ldap_bind_password);

            // Broader filter to ensure we catch something
            const searchOptions = {
                filter: "(objectClass=inetOrgPerson)", // Match user's successful manual query
                scope: "sub", // 'sub' is correct for ldapjs
                sizeLimit: 0,
                paged: true
            };

            const entries = await search(client, config.ldap_base_dn, searchOptions);
            console.log(`[LDAP Sync] Found ${entries.length} raw entries.`);

            // Log the first entry fully to debug attributes
            if (entries.length > 0) {
                console.log("[LDAP Sync] DEBUG: First entry raw data:", JSON.stringify(entries[0], null, 2));
            }

            let addedCount = 0;
            let updatedCount = 0;
            let errorCount = 0;

            for (const entry of entries) {
                try {
                    if (!entry) continue;

                    // Helper to get first value safely
                    const getAttr = (attr) => {
                        try {
                            if (!entry) return null;
                            const keys = Object.keys(entry);
                            const key = keys.find(k => k && typeof k === 'string' && k.toLowerCase() === attr.toLowerCase());
                            if (!key) return null;
                            const val = entry[key];
                            if (val === undefined || val === null) return null;
                            const result = Array.isArray(val) ? val[0] : val;
                            return result;
                        } catch (e) {
                            console.error(`[LDAP Sync] DEBUG: Error getting attr ${attr}:`, e);
                            return null;
                        }
                    };

                    // Specific check for Person/User object class
                    const objectClass = getAttr("objectClass");

                    // console.log(`[LDAP Sync] DEBUG: Processing entry ${entry.dn}`);

                    let email = getAttr("mail");
                    if (email && typeof email === 'string') {
                        email = email.toLowerCase();
                    } else if (email) {
                        try {
                            email = String(email).toLowerCase();
                        } catch (e) {
                            console.error(`[LDAP Sync] DEBUG: Error converting email to string:`, e);
                            email = null;
                        }
                    }

                    let username = getAttr("uid") || getAttr("sAMAccountName");
                    if (username && typeof username === 'string') {
                        username = username.toLowerCase();
                    } else if (username) {
                        try {
                            username = String(username).toLowerCase();
                        } catch (e) {
                            console.error(`[LDAP Sync] DEBUG: Error converting username to string:`, e);
                            username = null;
                        }
                    }

                    const name = getAttr("displayName") || getAttr("cn");

                    if (!email || !username) {
                        console.log(`[LDAP Sync] Skipping entry ${entry.dn}: Missing email (${email}) or username (${username})`);
                        continue;
                    }

                    console.log(`[LDAP Sync] Syncing user: ${username} (${email}) - ${name}`);

                    // Upsert user
                    const existingUser = await prisma.user.findFirst({
                        where: {
                            OR: [
                                { email: { equals: email, mode: 'insensitive' } },
                                { username: { equals: username, mode: 'insensitive' } }
                            ]
                        }
                    });

                    if (existingUser) {
                        await prisma.user.update({
                            where: { id: existingUser.id },
                            data: {
                                name: name,
                                isLdap: true,
                            }
                        });
                        updatedCount++;
                    } else {
                        await prisma.user.create({
                            data: {
                                name: name,
                                email: email,
                                username: username,
                                isLdap: true,
                                role: "USER",
                                password: null
                            }
                        });
                        addedCount++;
                    }

                } catch (err) {
                    const dn = entry && entry.dn ? entry.dn : 'unknown_dn';
                    console.error(`[LDAP Sync] Error processing entry ${dn}:`, err);
                    errorCount++;
                }
            }

            await unbind(client);

            // Update last sync time
            await prisma.setting.upsert({
                where: { key: "ldap_last_sync" },
                update: { value: new Date().toISOString() },
                create: { key: "ldap_last_sync", value: new Date().toISOString() }
            });

            console.log(`[LDAP Sync] Completed. Added: ${addedCount}, Updated: ${updatedCount}, Errors: ${errorCount}`);
            return {
                success: true,
                stats: { added: addedCount, updated: updatedCount, errors: errorCount }
            };

        } catch (bindError) {
            console.error("[LDAP Sync] Bind failed:", bindError);
            if (client) destroy(client);
            return { success: false, message: `Bind failed: ${bindError.message}` };
        }

    } catch (error) {
        console.error("[LDAP Sync] Critical error:", error);
        return { success: false, message: `Critical error: ${error.message}` };
    }
}
