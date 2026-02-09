const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Migrating PENGELOLA users to PENGELOLA_ROOM...');

    const updated = await prisma.user.updateMany({
        where: {
            role: 'PENGELOLA'
        },
        data: {
            role: 'PENGELOLA_ROOM'
        }
    });

    console.log(`Updated ${updated.count} users.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
