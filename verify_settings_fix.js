const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🧪 Verifying Setting primary key fix...')

    const settings = [
        { key: 'site_name', value: 'Booking Room' },
        { key: 'max_booking_days', value: '30' }
    ]

    for (const setting of settings) {
        const result = await prisma.setting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: { key: setting.key, value: setting.value },
        })
        console.log(`✅ Saved setting: ${result.key} with ID: ${result.id}`)
    }

    console.log('✨ Verification complete!')
}

main()
    .catch((e) => {
        console.error('❌ Verification failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
