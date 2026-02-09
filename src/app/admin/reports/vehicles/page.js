import { auth } from "@/auth";
import { redirect } from "next/navigation";
import VehicleReportView from "@/components/VehicleReportView";

export default async function VehicleReportsPage() {
    const session = await auth();

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_VEHICLE')) {
        redirect("/");
    }

    return (
        <div className="fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-primary">Laporan Penggunaan Kendaraan</h1>
                <p className="text-text-light mt-1">Statistik dan analisis pemesanan kendaraan operasional</p>
            </div>

            <VehicleReportView />
        </div>
    );
}
