import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ReportView from "@/components/ReportView";

export default async function AdminReportsPage() {
    const session = await auth();

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_ROOM')) {
        redirect("/");
    }

    return (
        <div className="fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-primary">Laporan Penggunaan Ruangan</h1>
                <p className="text-text-light mt-1">Statistik dan analisis pemesanan ruang meeting</p>
            </div>

            <ReportView />
        </div>
    );
}
