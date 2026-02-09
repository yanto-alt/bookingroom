"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Users, FileText } from "lucide-react";
import Swal from "sweetalert2";

export default function BookingForm({ rooms, userId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.target);
        const data = {
            userId,
            roomId: formData.get("roomId"),
            title: formData.get("title"),
            description: formData.get("description"),
            startTime: new Date(formData.get("startTime")).toISOString(),
            endTime: new Date(formData.get("endTime")).toISOString(),
        };

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Gagal membuat pemesanan");
            }

            // Show success popup
            await Swal.fire({
                title: "Permintaan Berhasil!",
                text: "Permintaan pemesanan ruang meeting Anda telah berhasil dikirim.",
                icon: "success",
                confirmButtonColor: "#325CA8", // primary color
                confirmButtonText: "OK",
            });

            // Redirect to Meeting Room Dashboard
            router.push("/rooms");
            router.refresh();
        } catch (err) {
            setError(err.message);
            Swal.fire({
                title: "Gagal!",
                text: err.message,
                icon: "error",
                confirmButtonColor: "#EF4444",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-text-dark mb-2 flex items-center gap-2">
                    <Users size={18} />
                    Ruang Meeting
                </label>
                <select
                    name="roomId"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                    <option value="">Pilih Ruang Meeting</option>
                    {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                            {room.name} (Kapasitas: {room.capacity} orang)
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-dark mb-2 flex items-center gap-2">
                    <FileText size={18} />
                    Judul Meeting
                </label>
                <input
                    type="text"
                    name="title"
                    required
                    placeholder="Contoh: Rapat Koordinasi Tim"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-dark mb-2 flex items-center gap-2">
                        <Calendar size={18} />
                        Waktu Mulai
                    </label>
                    <input
                        type="datetime-local"
                        name="startTime"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-dark mb-2 flex items-center gap-2">
                        <Clock size={18} />
                        Waktu Selesai
                    </label>
                    <input
                        type="datetime-local"
                        name="endTime"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                    Deskripsi (Opsional)
                </label>
                <textarea
                    name="description"
                    rows={4}
                    placeholder="Agenda meeting, jumlah peserta, dll."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition-colors"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Memproses..." : "Kirim Permintaan"}
                </button>
            </div>
        </form>
    );
}
