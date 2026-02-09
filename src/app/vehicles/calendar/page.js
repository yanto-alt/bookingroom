import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import VehicleCalendarView from "@/components/VehicleCalendarView";

export default async function VehicleCalendarPage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    const bookings = await prisma.vehicleBooking.findMany({
        where: {
            status: { in: ['APPROVED', 'PENDING'] },
        },
        include: {
            vehicle: true,
            user: true,
        },
        orderBy: { startTime: 'asc' },
    });

    const vehicles = await prisma.vehicle.findMany({
        orderBy: { name: 'asc' },
    });

    return (
        <div className="fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-accent">Jadwal Kendaraan</h1>
                <p className="text-text-light mt-1">Lihat ketersediaan dan jadwal pemakaian kendaraan</p>
            </div>

            <VehicleCalendarView bookings={bookings} vehicles={vehicles} />
        </div>
    );
}
