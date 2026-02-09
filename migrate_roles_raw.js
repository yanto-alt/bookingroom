const { Pool } = require('pg');

async function main() {
    console.log('Migrating PENGELOLA users to PENGELOLA_ROOM (Raw SQL)...');

    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is missing');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        // We use a raw query to bypass Prisma's enum validation
        // This assumes the column 'role' is either text or an enum that still allowed 'PENGELOLA' at DB level
        // OR we are casting. 
        // If Role is an enum type in Postgres, we might need to handle it carefully.
        // However, if the migration hasn't run yet, 'PENGELOLA' might be valid.
        // If migration has run and removed 'PENGELOLA' from enum, data might already be in inconsistent state or migration failed.

        // Let's attempt to update. safely.
        const res = await pool.query(`
            UPDATE "User" 
            SET "role" = 'PENGELOLA_ROOM' 
            WHERE "role"::text = 'PENGELOLA'
        `);

        console.log(`Updated ${res.rowCount} users.`);
    } catch (err) {
        console.error('Error executing raw query:', err);
    } finally {
        await pool.end();
    }
}

main();
