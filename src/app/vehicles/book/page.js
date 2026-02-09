import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import VehicleBookingForm from "@/components/VehicleBookingForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewVehicleBooking() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    // Fetch available vehicles
    const vehicles = await prisma.vehicle.findMany({
        where: {
            status: 'AVAILABLE'
        },
        orderBy: { name: 'asc' },
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6 fade-in">
            <div className="flex items-center gap-4">
                <Link
                    href="/vehicles"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-accent">Pesan Kendaraan</h1>
                    <p className="text-text-light">Isi form untuk mengajukan peminjaman kendaraan</p>
                </div>
            </div>

            <div className="glass-card p-6 md:p-8">
                <VehicleBookingForm vehicles={vehicles} />
            </div>
        </div>
    );
}
