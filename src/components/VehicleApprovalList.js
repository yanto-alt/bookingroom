"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Calendar, User, MapPin, AlertTriangle, Car, Loader2 } from "lucide-react";

export default function VehicleApprovalList({ bookings }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Modal states
    const [activeModal, setActiveModal] = useState(null); // 'approve' | 'reject' | 'cancel'
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [adminNotes, setAdminNotes] = useState("");

    // Vehicle swap states
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState("");
    const [loadingVehicles, setLoadingVehicles] = useState(false);

    const handleAction = async () => {
        if (!selectedBooking) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/approvals/vehicles/${selectedBooking.id}/${activeModal}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    adminNotes,
                    vehicleId: activeModal === 'approve' ? selectedVehicleId : undefined
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || `Gagal ${activeModal === 'approve' ? 'menyetujui' : activeModal === 'reject' ? 'menolak' : 'membatalkan'} peminjaman`);
            }

            closeModal();
            router.refresh();
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (booking, type) => {
        setSelectedBooking(booking);
        setActiveModal(type);
        setAdminNotes("");
        if (type === 'approve') {
            setSelectedVehicleId(booking.vehicleId);
            fetchAvailableVehicles(booking);
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedBooking(null);
        setAdminNotes("");
        setAvailableVehicles([]);
        setSelectedVehicleId("");
    };

    const fetchAvailableVehicles = async (booking) => {
        setLoadingVehicles(true);
        try {
            const res = await fetch(`/api/admin/vehicles/available?startTime=${booking.startTime}&endTime=${booking.endTime}&excludeBookingId=${booking.id}`);
            if (res.ok) {
                const data = await res.json();
                setAvailableVehicles(data);

                // If original vehicle is not in "available" (maybe it's maintenance or whatever), 
                // but usually it should be because this booking is the one using it (hence excludeBookingId).
                // If we want to allow keeping the same vehicle even if it's "unavailable" due to this booking, 
                // the API should handle that.
            }
        } catch (error) {
            console.error("Failed to fetch vehicles", error);
        } finally {
            setLoadingVehicles(false);
        }
    };

    if (bookings.length === 0) {
        return (
            <div className="p-12 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="text-green-500" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Semua Beres!</h3>
                <p className="text-gray-500 mt-1">Tidak ada permintaan peminjaman yang perlu dikelola.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
                {bookings.map((booking) => (
                    <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1.5 mt-2">
                                    <p className="flex items-center gap-2">
                                        <Clock size={16} className="text-gray-400" />
                                        {new Date(booking.startTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} - {new Date(booking.endTime).toLocaleString('id-ID', { timeStyle: 'short' })}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <MapPin size={16} className="text-gray-400" />
                                        Tujuan: <span className="font-medium text-text-dark">{booking.destination}</span>
                                    </p>
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mt-2">
                                        <p className="text-xs text-text-light uppercase font-bold tracking-wider mb-1">Keperluan</p>
                                        <p className="text-sm text-text-dark">{booking.purpose}</p>
                                    </div>
                                    {booking.adminNotes && (
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2 italic">
                                            <p className="text-xs text-text-light font-bold mb-1 uppercase tracking-wider">Catatan Admin</p>
                                            <p className="text-sm text-gray-700">{booking.adminNotes}</p>
                                        </div>
                                    )}
                                    {booking.driverRequired && (
                                        <p className="text-blue-600 font-semibold flex items-center gap-1 mt-2">
                                            <User size={14} /> Butuh Supir {booking.vehicle.driverName && `(Driver: ${booking.vehicle.driverName})`}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {booking.status === "PENDING" ? (
                                    <>
                                        <button
                                            onClick={() => openModal(booking, "reject")}
                                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors flex items-center gap-2"
                                        >
                                            <XCircle size={18} /> Tolak
                                        </button>
                                        <button
                                            onClick={() => openModal(booking, "approve")}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <CheckCircle size={18} /> Setujui
                                        </button>
                                    </>
                                ) : booking.status === "APPROVED" && (
                                    <button
                                        onClick={() => openModal(booking, "cancel")}
                                        className="px-4 py-2 border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 font-medium transition-colors flex items-center gap-2"
                                    >
                                        <AlertTriangle size={18} /> Batalkan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {activeModal && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className={`p-4 text-white flex items-center justify-between ${activeModal === 'approve' ? 'bg-green-600' :
                            activeModal === 'reject' ? 'bg-red-600' : 'bg-orange-600'
                            }`}>
                            <h3 className="font-bold flex items-center gap-2">
                                {activeModal === 'approve' ? <CheckCircle size={20} /> :
                                    activeModal === 'reject' ? <XCircle size={20} /> : <AlertTriangle size={20} />}
                                {activeModal === 'approve' ? 'Setujui Peminjaman' :
                                    activeModal === 'reject' ? 'Tolak Peminjaman' : 'Batalkan Peminjaman'}
                            </h3>
                            <button onClick={closeModal} className="hover:bg-black/10 rounded-full p-1 transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-xs text-text-light uppercase font-bold tracking-wider mb-1">Peminjam</p>
                                <p className="font-semibold text-gray-900">{selectedBooking.user.name}</p>
                            </div>

                            {activeModal === 'approve' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Car size={16} /> Pilih Kendaraan
                                    </label>
                                    {loadingVehicles ? (
                                        <div className="flex items-center gap-2 text-xs text-text-light p-2 italic">
                                            <Loader2 size={14} className="animate-spin" /> Mencari kendaraan tersedia...
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedVehicleId}
                                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white"
                                        >
                                            <option value={selectedBooking.vehicleId}>{selectedBooking.vehicle.name} (Bawaan)</option>
                                            {availableVehicles
                                                .filter(v => v.id !== selectedBooking.vehicleId)
                                                .map(vehicle => (
                                                    <option key={vehicle.id} value={vehicle.id}>
                                                        {vehicle.name} ({vehicle.licensePlate})
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    )}
                                    <p className="text-[10px] text-text-light italic">
                                        * Anda dapat mengganti kendaraan jika kendaraan yang diminta tidak tersedia atau ada pilihan lain.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">
                                    Catatan/Pesan {activeModal === 'approve' ? '(Opsional)' : '(Wajib)'}
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder={activeModal === 'reject' ? "Alasan penolakan..." : "Pesan untuk pemesan..."}
                                    rows={3}
                                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                    required={activeModal !== 'approve'}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleAction}
                                    disabled={loading || (activeModal !== 'approve' && !adminNotes.trim())}
                                    className={`flex-1 py-2.5 text-white rounded-lg text-sm font-semibold transition-opacity flex items-center justify-center gap-2 shadow-sm ${activeModal === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                                        activeModal === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
                                        } disabled:opacity-50`}
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                                    Konfirmasi {activeModal === 'approve' ? 'Setuju' : activeModal === 'reject' ? 'Tolak' : 'Batal'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
