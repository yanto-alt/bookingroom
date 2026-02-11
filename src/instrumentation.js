export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const cron = await import('node-cron');
        const { syncLdapUsers } = await import('@/lib/ldapSync');
        const prisma = (await import('@/lib/prisma')).default;

        console.log('[Scheduler] Initializing LDAP sync scheduler...');

        // Run every minute (or 5 minutes) to check if we need to sync
        // This is a robust pattern: 
        // 1. Cron runs frequently (e.g. every minute)
        // 2. Checks DB for "last_synced_at" and "sync_interval"
        // 3. If (now - last_synced) > interval, run sync

        cron.schedule('* * * * *', async () => {
            try {
                // Fetch settings
                const settings = await prisma.setting.findMany({
                    where: {
                        key: { in: ['ldap_enabled', 'ldap_sync_interval', 'ldap_last_sync'] }
                    }
                });

                const config = settings.reduce((acc, curr) => {
                    acc[curr.key] = curr.value;
                    return acc;
                }, {});

                if (config.ldap_enabled !== 'true') return;

                const intervalMinutes = parseInt(config.ldap_sync_interval || '60', 10);
                const lastSync = config.ldap_last_sync ? new Date(config.ldap_last_sync) : new Date(0);
                const now = new Date();
                const nextSync = new Date(lastSync.getTime() + intervalMinutes * 60000);

                if (now >= nextSync) {
                    console.log(`[Scheduler] Triggering auto-sync (Last: ${lastSync.toISOString()}, Interval: ${intervalMinutes}m)`);
                    await syncLdapUsers();
                }
            } catch (error) {
                console.error('[Scheduler] Error checking sync status:', error);
            }
        });
    }
}
