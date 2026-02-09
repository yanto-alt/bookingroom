import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import BookingApprovalList from "@/components/BookingApprovalList";

export default async function AdminVehicleApprovals() {
    const session = await auth();

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PENGELOLA")) {
        redirect("/");
    }

    // Fetch pending vehicle bookings
    const pendingBookings = await prisma.vehicleBooking.findMany({
        where: {
            status: "PENDING",
        },
        include: {
            user: {
                select: { name: true, email: true },
            },
            vehicle: {
                select: { name: true, licensePlate: true },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Konfirmasi Peminjaman Kendaraan</h1>
                <p className="text-gray-600">Daftar permintaan peminjaman kendaraan yang menunggu konfirmasi</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {pendingBookings.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="text-green-500" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Semua Beres!</h3>
                        <p className="text-gray-500 mt-1">Tidak ada permintaan peminjaman yang menunggu konfirmasi.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {pendingBookings.map((booking) => (
                            <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            {booking.user.name} <span className="text-gray-400 font-normal">•</span> {booking.vehicle.name}
                                        </h3>
                                        <div className="text-sm text-gray-600 space-y-0.5">
                                            <p className="flex items-center gap-2">
                                                <Clock size={16} className="text-gray-400" />
                                                {new Date(booking.startTime).toLocaleString('id-ID')} - {new Date(booking.endTime).toLocaleString('id-ID')}
                                            </p>
                                            <p>Tujuan: <span className="font-medium">{booking.destination}</span></p>
                                            <p>Keperluan: {booking.purpose}</p>
                                            {booking.driverRequired && (
                                                <p className="text-blue-600 font-medium">Butuh Supir</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <form action={`/api/admin/approvals/vehicles/${booking.id}/reject`} method="POST">
                                            <button
                                                type="submit"
                                                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors flex items-center gap-2"
                                            >
                                                <XCircle size={18} /> Tolak
                                            </button>
                                        </form>
                                        <form action={`/api/admin/approvals/vehicles/${booking.id}/approve`} method="POST">
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2 shadow-sm"
                                            >
                                                <CheckCircle size={18} /> Setujui
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
