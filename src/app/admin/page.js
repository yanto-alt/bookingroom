import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import BookingApprovalList from "@/components/BookingApprovalList";

export default async function AdminPage() {
    const session = await auth();

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_ROOM' && session.user.role !== 'PENGELOLA_VEHICLE')) {
        redirect("/");
    }

    const pendingBookings = await prisma.booking.findMany({
        where: { status: 'PENDING' },
        include: {
            user: true,
            room: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-primary">Konfirmasi Pemesanan</h1>
                <p className="text-text-light mt-1">Setujui atau tolak permintaan pemesanan ruang meeting</p>
            </div>

            <BookingApprovalList bookings={pendingBookings} />
        </div>
    );
}
