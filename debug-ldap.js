import ldap from "ldapjs";
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
        client.search(base, options, (err, res) => {
            if (err) return reject(err);

            const entries = [];
            res.on("searchEntry", (entry) => {
                if (entry && entry.object) {
                    entries.push(entry.object);
                }
            });
            res.on("error", (err) => {
                reject(err);
            });
            res.on("end", (result) => {
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

async function debugLdap() {
    let client;
    try {
        console.log("Checking existing users in DB...");
        const users = await prisma.user.findMany();
        console.log(`Found ${users.length} users in DB:`);
        users.forEach(u => console.log(`- ${u.username} (${u.email}) [LDAP: ${u.isLdap}]`));

        console.log("\nFetching LDAP settings from database...");
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
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        console.log("Configuration:", { ...config, ldap_bind_password: "***" });

        if (config.ldap_enabled !== "true") {
            console.log("LDAP is disabled in settings.");
            return;
        }

        if (!config.ldap_url || !config.ldap_bind_dn || !config.ldap_bind_password || !config.ldap_base_dn) {
            console.log("Missing LDAP configuration.");
            return;
        }

        console.log(`Connecting to ${config.ldap_url}...`);
        client = createClient(config.ldap_url);

        console.log(`Binding with ${config.ldap_bind_dn}...`);
        await bind(client, config.ldap_bind_dn, config.ldap_bind_password);
        console.log("Bind successful.");

        const searchOptions = {
            filter: "(objectClass=*)",
            scope: "sub",
            attributes: ["cn", "mail", "uid", "sAMAccountName", "displayName", "objectClass", "sn", "givenName"] // Added common attributes
        };

        console.log(`Searching in ${config.ldap_base_dn} with filter ${searchOptions.filter}...`);
        const entries = await search(client, config.ldap_base_dn, searchOptions);

        console.log(`Found ${entries.length} entries.`);

        if (entries.length === 0) {
            console.log("No entries found. Check base DN or permissions.");
        } else {
            console.log(`Processing ${entries.length} entries with ldapSync.js logic...`);

            for (const entry of entries) {
                try {
                    if (!entry) continue;

                    // Helper to get first value
                    const getAttr = (attr) => {
                        try {
                            const keys = Object.keys(entry);
                            const key = keys.find(k => k && typeof k === 'string' && k.toLowerCase() === attr.toLowerCase());
                            if (!key) return null;
                            const val = entry[key];
                            if (!val) return null;
                            return Array.isArray(val) ? val[0] : val;
                        } catch (e) {
                            return null;
                        }
                    };

                    let email = getAttr("mail");
                    if (email && typeof email === 'string') {
                        email = email.toLowerCase();
                    } else if (email) {
                        email = String(email).toLowerCase();
                    }

                    let username = getAttr("uid") || getAttr("sAMAccountName");
                    if (username && typeof username === 'string') {
                        username = username.toLowerCase();
                    } else if (username) {
                        username = String(username).toLowerCase();
                    }

                    const name = getAttr("displayName") || getAttr("cn");

                    console.log(`Entry: ${entry.dn}`);
                    console.log(`  - Extracted Name: ${name}`);
                    console.log(`  - Extracted Email: ${email}`);
                    console.log(`  - Extracted Username: ${username}`);

                    if (!email || !username) {
                        console.log(`  -> SKIPPED: Missing email or username`);
                        continue;
                    }

                    console.log(`  -> WOULD SYNC: create/update user ${username} (${email})`);

                } catch (err) {
                    console.error(`ERROR processing entry ${entry.dn}:`, err);
                }
            }
        }

        await unbind(client);
        console.log("Done.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
        if (client) {
            try { client.destroy(); } catch (e) { }
        }
    }
}

debugLdap();
