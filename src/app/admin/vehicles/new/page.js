"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car, Info, Hash, Users, Activity } from "lucide-react";
import Link from "next/link";

export default function NewVehiclePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function onSubmit(event) {
        event.preventDefault();
        setIsSubmitting(true);
        setError("");

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/admin/vehicles", {
                method: "POST",
                body: JSON.stringify({
                    name: data.name,
                    type: data.type,
                    licensePlate: data.licensePlate,
                    capacity: parseInt(data.capacity),
                    description: data.description,
                    status: data.status,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.message || "Failed to create vehicle");
            }

            router.push("/admin/vehicles");
            router.refresh();
        } catch (e) {
            setError(e.message);
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 fade-in">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/vehicles"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tambah Kendaraan</h1>
                    <p className="text-gray-600">Masukkan data kendaraan baru</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200 flex items-center gap-2">
                            <Info size={16} />
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Car size={16} /> Nama Kendaraan
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="Contoh: Toyota Innova Hitam"
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Car size={16} /> Tipe
                            </label>
                            <select
                                name="type"
                                required
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                            >
                                <option value="Minibus">Minibus</option>
                                <option value="SUV">SUV</option>
                                <option value="Sedan">Sedan</option>
                                <option value="Van">Van</option>
                                <option value="Bus">Bus</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>

                        {/* License Plate */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Hash size={16} /> Plat Nomor
                            </label>
                            <input
                                type="text"
                                name="licensePlate"
                                required
                                placeholder="B 1234 CD"
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Capacity */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Users size={16} /> Kapasitas (Orang)
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                required
                                min="1"
                                placeholder="7"
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Activity size={16} /> Status Awal
                            </label>
                            <select
                                name="status"
                                required
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                            >
                                <option value="AVAILABLE">Available</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="IN_USE">In Use</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Deskripsi / Catatan</label>
                        <textarea
                            name="description"
                            rows="3"
                            placeholder="Informasi tambahan mengenai kendaraan..."
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Link
                            href="/admin/vehicles"
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{ backgroundColor: 'var(--accent)' }}
                            className="text-white px-6 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan Kendaraan"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
