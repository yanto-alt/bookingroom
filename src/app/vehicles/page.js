import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Plus, Car, Clock } from "lucide-react";

export default async function VehicleDashboard() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    // Fetch vehicles
    const vehicles = await prisma.vehicle.findMany({
        orderBy: { name: 'asc' },
    });

    // Fetch user's vehicle bookings
    const userBookings = await prisma.vehicleBooking.findMany({
        where: { userId: session.user.id },
        include: { vehicle: true },
        orderBy: { startTime: 'desc' },
        take: 5,
    });

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-accent">Booking Kendaraan</h1>
                    <p className="text-text-light mt-1">Kelola pemesanan kendaraan operasional</p>
                </div>
                <Link
                    href="/vehicles/book"
                    style={{ backgroundColor: 'var(--accent)' }}
                    className="text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-opacity hover:opacity-90"
                >
                    <Plus size={20} />
                    Pesan Kendaraan
                </Link>
            </div>

            {/* Vehicles List */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Car size={24} className="text-accent" />
                    Daftar Kendaraan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${vehicle.status === 'AVAILABLE' ? 'bg-green-100 text-green-600' :
                                    'bg-yellow-100 text-yellow-600'
                                    }`}>
                                    {vehicle.status}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-600">{vehicle.type} • {vehicle.licensePlate}</p>
                            <p className="text-sm text-text-light mt-1 mb-3">{vehicle.description}</p>
                            <div className="flex items-center gap-2 text-sm text-text-light">
                                <Users size={16} />
                                <span>Kapasitas: {vehicle.capacity} orang</span>
                            </div>
                        </div>
                    ))}
                    {vehicles.length === 0 && (
                        <p className="col-span-full text-center text-text-light py-4">
                            Belum ada data kendaraan. Hubungi admin.
                        </p>
                    )}
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock size={24} className="text-accent" />
                    Riwayat Pemesanan
                </h2>
                {userBookings.length === 0 ? (
                    <p className="text-text-light text-center py-8">Belum ada pemesanan kendaraan</p>
                ) : (
                    <div className="space-y-3">
                        {userBookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">{booking.vehicle.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {new Date(booking.startTime).toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-xs text-text-light mt-1">Tujuan: {booking.destination}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${booking.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                                    booking.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                                        'bg-yellow-100 text-yellow-600'
                                    }`}>
                                    {booking.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function Users({ size, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
