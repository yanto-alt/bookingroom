"use client";

import { Clock, Users, User, FileText, Car } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function VehicleHistoryList({ bookings }) {
    if (bookings.length === 0) {
        return <p className="text-text-light text-center py-8">Belum ada pemesanan kendaraan</p>;
    }

    return (
        <div className="space-y-3">
            {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-800">{booking.vehicle.name}</h4>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200 font-mono">
                                {booking.vehicle.licensePlate}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                            {format(new Date(booking.startTime), "EEEE, d MMMM yyyy HH:mm", { locale: id })} - {format(new Date(booking.endTime), "HH:mm", { locale: id })}
                        </p>
                        <p className="text-xs text-text-light flex items-center gap-1 mt-1 mb-2">
                            <User size={12} />
                            <span className="font-semibold text-gray-700">Pemohon:</span> {booking.user?.name}
                        </p>
                        <div className="flex flex-col gap-1 mt-1 bg-gray-50 p-2 rounded border border-gray-100">
                            <p className="text-xs text-text-light flex items-center gap-1">
                                <span className="font-semibold text-gray-700">Driver:</span> {booking.vehicle.driverName || "Tidak ditentukan"}
                            </p>
                            <p className="text-xs text-text-light flex items-center gap-1">
                                <span className="font-semibold text-gray-700">Tujuan:</span> {booking.destination}
                            </p>
                            <p className="text-xs text-text-light flex items-center gap-1">
                                <span className="font-semibold text-gray-700">Keperluan:</span> {booking.purpose}
                            </p>
                            {booking.adminNotes && (
                                <p className="text-xs text-orange-600 bg-orange-50 p-1.5 rounded mt-1 border border-orange-100 italic">
                                    <span className="font-bold uppercase tracking-wider text-[10px]">Catatan Admin:</span> {booking.adminNotes}
                                </p>
                            )}
                            <div className="mt-1 pt-1 border-t border-gray-200">
                                <p className="text-[10px] text-gray-400 italic">
                                    Status: {booking.status} • Butuh Supir: {booking.driverRequired ? "Ya" : "Tidak"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'APPROVED' ? 'bg-green-100 text-green-600 border border-green-200' :
                            booking.status === 'REJECTED' ? 'bg-red-100 text-red-600 border border-red-200' :
                                'bg-yellow-100 text-yellow-600 border border-yellow-200'
                            }`}>
                            {booking.status}
                        </span>
                        {booking.driverRequired && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-medium">
                                Butuh Supir
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
