import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Car, Edit, Trash2 } from "lucide-react";

export default async function AdminVehicles() {
    const session = await auth();

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PENGELOLA")) {
        redirect("/");
    }

    const vehicles = await prisma.vehicle.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kelola Kendaraan</h1>
                    <p className="text-gray-600">Daftar kendaraan operasional</p>
                </div>
                <Link
                    href="/admin/vehicles/new"
                    style={{ backgroundColor: 'var(--accent)' }}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-opacity hover:opacity-90"
                >
                    <Plus size={20} />
                    Tambah Kendaraan
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Nama Kendaraan</th>
                                <th className="px-6 py-4">Tipe</th>
                                <th className="px-6 py-4">Plat Nomor</th>
                                <th className="px-6 py-4">Kapasitas</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {vehicles.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <Car size={18} className="text-blue-600" />
                                        </div>
                                        {vehicle.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{vehicle.type}</td>
                                    <td className="px-6 py-4 font-mono text-gray-600">{vehicle.licensePlate}</td>
                                    <td className="px-6 py-4 text-gray-600">{vehicle.capacity} orang</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${vehicle.status === 'AVAILABLE' ? 'bg-green-100 text-green-600' :
                                            'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {vehicle.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Edit and Delete buttons could go here */}
                                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {vehicles.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Belum ada data kendaraan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
