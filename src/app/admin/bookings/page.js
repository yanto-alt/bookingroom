import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import ApprovedBookingsList from "@/components/ApprovedBookingsList";

export default async function AdminBookingsPage() {
    const session = await auth();

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_ROOM')) {
        redirect("/");
    }

    const approvedBookings = await prisma.booking.findMany({
        where: { status: 'APPROVED' },
        include: {
            user: true,
            room: true,
        },
        orderBy: { startTime: 'desc' },
    });

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-primary">Pemesanan Disetujui</h1>
                <p className="text-text-light mt-1">Kelola pemesanan yang sudah disetujui</p>
            </div>

            <ApprovedBookingsList bookings={approvedBookings} />
        </div>
    );
}
