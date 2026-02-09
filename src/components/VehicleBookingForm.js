"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Clock, Info, User as UserIcon } from "lucide-react";

export default function VehicleBookingForm({ vehicles }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Generate hour and minute options
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
    const minutes = ["00", "15", "30", "45"];

    async function onSubmit(event) {
        event.preventDefault();
        setIsSubmitting(true);
        setError("");

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        // Construct Date objects from separate parts to ensure local time interpretation
        const startDateObj = new Date(data.startDate);
        startDateObj.setHours(parseInt(data.startHour), parseInt(data.startMinute), 0, 0);
        const startDateTime = startDateObj.toISOString();

        const endDateObj = new Date(data.endDate);
        endDateObj.setHours(parseInt(data.endHour), parseInt(data.endMinute), 0, 0);
        const endDateTime = endDateObj.toISOString();

        try {
            const res = await fetch("/api/vehicles/book", {
                method: "POST",
                body: JSON.stringify({
                    vehicleId: data.vehicleId,
                    startTime: startDateTime,
                    endTime: endDateTime,
                    purpose: data.purpose,
                    destination: data.destination,
                    driverRequired: data.driverRequired === "on",
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.message || "Failed to submit booking");
            }

            router.push("/vehicles");
            router.refresh();
        } catch (e) {
            setError(e.message);
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200 flex items-center gap-2">
                    <Info size={16} />
                    {error}
                </div>
            )}

            {/* Vehicle Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Pilih Kendaraan</label>
                <select
                    name="vehicleId"
                    required
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent bg-white"
                >
                    <option value="">-- Pilih Kendaraan --</option>
                    {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.name} ({v.type}) - {v.licensePlate}
                        </option>
                    ))}
                </select>
            </div>

            {/* Date-Time Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                {/* Start Point */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Waktu Mulai
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={14} /> Tanggal
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            required
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent bg-white text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Clock size={14} /> Jam
                        </label>
                        <div className="flex gap-2">
                            <select
                                name="startHour"
                                required
                                className="flex-1 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent bg-white text-sm"
                            >
                                <option value="">Jam</option>
                                {hours.map((h) => (
                                    <option key={`start-h-${h}`} value={h}>{h}</option>
                                ))}
                            </select>
                            <select
                                name="startMinute"
                                required
                                className="flex-1 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent bg-white text-sm"
                            >
                                <option value="">Menit</option>
                                {minutes.map((m) => (
                                    <option key={`start-m-${m}`} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* End Point */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Waktu Selesai
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={14} /> Tanggal
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            required
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent bg-white text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Clock size={14} /> Jam
                        </label>
                        <div className="flex gap-2">
                            <select
                                name="endHour"
                                required
                                className="flex-1 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent bg-white text-sm"
                            >
                                <option value="">Jam</option>
                                {hours.map((h) => (
                                    <option key={`end-h-${h}`} value={h}>{h}</option>
                                ))}
                            </select>
                            <select
                                name="endMinute"
                                required
                                className="flex-1 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent bg-white text-sm"
                            >
                                <option value="">Menit</option>
                                {minutes.map((m) => (
                                    <option key={`end-m-${m}`} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Destination */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin size={16} />
                    Tujuan
                </label>
                <input
                    type="text"
                    name="destination"
                    placeholder="Lokasi tujuan"
                    required
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent bg-white"
                />
            </div>

            {/* Purpose */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Info size={16} />
                    Keperluan
                </label>
                <textarea
                    name="purpose"
                    rows="3"
                    placeholder="Jelaskan keperluan pemakaian kendaraan"
                    required
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent focus:border-accent bg-white"
                />
            </div>

            {/* Driver Option */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    name="driverRequired"
                    id="driverRequired"
                    className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                />
                <label htmlFor="driverRequired" className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer">
                    <UserIcon size={16} />
                    Butuh Supir?
                </label>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                    className="w-full font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <span className="loading-spinner" />
                            Memproses...
                        </>
                    ) : (
                        "Ajukan Pemesanan"
                    )}
                </button>
            </div>
        </form>
    );
}
