"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    Download,
    Filter,
    Table as TableIcon,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function VehicleReportView() {
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reports/vehicles?month=${month}&year=${year}`);
            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const handleExportExcel = () => {
        if (!data || data.bookings.length === 0) return;

        const reportData = data.bookings.map((b) => ({
            "Tanggal": format(new Date(b.startTime), "d MMM yyyy", { locale: id }),
            "Waktu": `${format(new Date(b.startTime), "HH:mm")} - ${format(new Date(b.endTime), "HH:mm")}`,
            "Kendaraan": `${b.vehicle.name} (${b.vehicle.licensePlate})`,
            "Pemohon": b.user.name,
            "Tujuan": b.destination,
            "Keperluan": b.purpose,
            "Supir": b.driverRequired ? "Ya" : "Tidak",
            "Status": b.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Kendaraan");
        XLSX.writeFile(workbook, `Laporan_Kendaraan_${months[month]}_${year}.xlsx`);
    };

    const handleExportPDF = () => {
        if (!data || data.bookings.length === 0) return;

        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Laporan Penggunaan Kendaraan Operasional", 14, 20);
        doc.setFontSize(11);
        doc.text(`Periode: ${months[month]} ${year}`, 14, 30);
        doc.text(`BP TAPERA`, 14, 37);

        const tableColumn = ["Tanggal", "Kendaraan", "Pemohon", "Tujuan", "Status"];
        const tableRows = data.bookings.map(b => [
            format(new Date(b.startTime), "d MMM yyyy", { locale: id }),
            `${b.vehicle.name} (${b.vehicle.licensePlate})`,
            b.user.name,
            b.destination,
            b.status
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] } // emerald-500
        });

        doc.save(`Laporan_Kendaraan_${months[month]}_${year}.pdf`);
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-text-light" />
                        <span className="text-sm font-medium text-text-dark">Filter:</span>
                    </div>

                    <select
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
                    >
                        {months.map((m, i) => (
                            <option key={m} value={i}>{m}</option>
                        ))}
                    </select>

                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportExcel}
                        disabled={!data || data.bookings.length === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={18} /> Excel
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={!data || data.bookings.length === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileText size={18} /> PDF
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-text-light font-medium">Memuat data laporan...</p>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-text-light text-sm uppercase tracking-wider font-semibold">Total Agenda</p>
                                    <p className="text-3xl font-bold text-primary mt-1">{data?.stats.total}</p>
                                </div>
                                <Calendar className="text-primary opacity-20" size={48} />
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-text-light text-sm uppercase tracking-wider font-semibold">Disetujui</p>
                                    <p className="text-3xl font-bold text-green-500 mt-1">{data?.stats.approved}</p>
                                </div>
                                <CheckCircle className="text-green-500 opacity-20" size={48} />
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-text-light text-sm uppercase tracking-wider font-semibold">Ditolak</p>
                                    <p className="text-3xl font-bold text-red-500 mt-1">{data?.stats.rejected}</p>
                                </div>
                                <XCircle className="text-red-500 opacity-20" size={48} />
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-text-light text-sm uppercase tracking-wider font-semibold">Menunggu</p>
                                    <p className="text-3xl font-bold text-yellow-500 mt-1">{data?.stats.pending}</p>
                                </div>
                                <Clock className="text-yellow-500 opacity-20" size={48} />
                            </div>
                        </div>
                    </div>

                    {/* Report Table */}
                    <div className="glass-card p-6 overflow-hidden">
                        <div className="flex items-center gap-2 mb-6">
                            <TableIcon className="text-primary" size={24} />
                            <h2 className="text-xl font-bold">Rincian Penggunaan</h2>
                        </div>

                        {data?.bookings.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-text-light mt-2">Tidak ada data penggunaan kendaraan pada periode ini.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-sm">Tanggal</th>
                                            <th className="px-4 py-3 text-sm">Kendaraan</th>
                                            <th className="px-4 py-3 text-sm">Pemohon</th>
                                            <th className="px-4 py-3 text-sm">Tujuan</th>
                                            <th className="px-4 py-3 text-sm">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data?.bookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 text-sm font-medium">
                                                    {format(new Date(booking.startTime), "d MMM yyyy", { locale: id })}
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    <div className="font-semibold text-text-dark">{booking.vehicle.name}</div>
                                                    <div className="text-xs text-text-light">{booking.vehicle.licensePlate}</div>
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    {booking.user.name}
                                                </td>
                                                <td className="px-4 py-4 text-sm max-w-[200px] truncate" title={booking.destination}>
                                                    {booking.destination}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                                                            booking.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                                                                'bg-yellow-100 text-yellow-600'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
