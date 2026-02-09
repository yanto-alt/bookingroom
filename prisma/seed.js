const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const adminPassword = await bcrypt.hash('admin123', 10)

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@bptapera.go.id' },
        update: {
            username: 'admin',
        },
        create: {
            email: 'admin@bptapera.go.id',
            username: 'admin',
            name: 'Administrator',
            password: adminPassword,
            role: 'ADMIN',
        },
    })

    // Create Pengelola
    const pengelolaPassword = await bcrypt.hash('pengelola123', 10)
    await prisma.user.upsert({
        where: { email: 'pengelola@bptapera.go.id' },
        update: {
            username: 'pengelola',
        },
        create: {
            email: 'pengelola@bptapera.go.id',
            username: 'pengelola',
            name: 'Pengelola User',
            password: pengelolaPassword,
        },
    })

    // Create some Rooms
    const rooms = [
        {
            name: 'Ruang Rapat Utama',
            capacity: 20,
            facilities: ['Projector', 'VC System', 'Whiteboard'],
            description: 'Lantai 2, Sayap Timur',
        },
        {
            name: 'Ruang Rapat Kecil 1',
            capacity: 6,
            facilities: ['LED TV', 'Whiteboard'],
            description: 'Lantai 1, Dekat Lobby',
        },
        {
            name: 'Executive Lounge',
            capacity: 10,
            facilities: ['Premium VC', 'Coffee Maker', 'Sofa'],
            description: 'Lantai 5',
        },
    ]

    for (const room of rooms) {
        const roomId = room.name.replace(/\s+/g, '-').toLowerCase()
        await prisma.room.upsert({
            where: { id: roomId },
            update: room,
            create: {
                id: roomId,
                ...room,
            },
        })
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
