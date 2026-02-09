import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import VehicleApprovalList from "@/components/VehicleApprovalList";

export default async function AdminVehicleApprovals() {
    const session = await auth();

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PENGELOLA_VEHICLE")) {
        redirect("/");
    }

    // Fetch pending and approved vehicle bookings
    const bookings = await prisma.vehicleBooking.findMany({
        where: {
            status: { in: ["PENDING", "APPROVED"] },
        },
        include: {
            user: {
                select: { name: true, email: true },
            },
            vehicle: {
                select: { name: true, licensePlate: true, driverName: true },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 border-b-4 border-primary inline-block pb-1">Konfirmasi Peminjaman Kendaraan</h1>
                <p className="text-gray-600 mt-2">Daftar permintaan peminjaman kendaraan yang menunggu konfirmasi</p>
            </div>

            <VehicleApprovalList bookings={bookings} />
        </div>
    );
}
