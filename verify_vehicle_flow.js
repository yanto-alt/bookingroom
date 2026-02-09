const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🧪 Verifying Vehicle Booking Flow...')

    // 1. Create a Test Vehicle
    const vehicle = await prisma.vehicle.create({
        data: {
            name: 'Test Setup Car',
            type: 'SUV',
            licensePlate: 'B 9999 TST',
            capacity: 5,
            status: 'AVAILABLE'
        }
    })
    console.log(`✅ Created Vehicle: ${vehicle.name} (${vehicle.licensePlate})`)

    // 2. Find a User (Admin or Pengelola)
    const user = await prisma.user.findFirst()
    if (!user) throw new Error("No user found")

    // 3. Create a Booking
    const startTime = new Date()
    startTime.setHours(startTime.getHours() + 24) // Tomorrow
    const endTime = new Date(startTime)
    endTime.setHours(endTime.getHours() + 4)

    const booking = await prisma.vehicleBooking.create({
        data: {
            userId: user.id,
            vehicleId: vehicle.id,
            startTime,
            endTime,
            purpose: 'Test Drive',
            destination: 'Jakarta',
            driverRequired: true,
            status: 'PENDING'
        }
    })
    console.log(`✅ Created Booking: ${booking.id} (Status: ${booking.status})`)

    // 4. Approve Booking
    const approvedBooking = await prisma.vehicleBooking.update({
        where: { id: booking.id },
        data: { status: 'APPROVED' }
    })
    console.log(`✅ Approved Booking: ${approvedBooking.id} (Status: ${approvedBooking.status})`)

    // Cleanup
    await prisma.vehicleBooking.delete({ where: { id: booking.id } })
    await prisma.vehicle.delete({ where: { id: vehicle.id } })
    console.log('✨ Cleanup complete. Verification successful!')
}

main()
    .catch((e) => {
        console.error('❌ Verification failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
