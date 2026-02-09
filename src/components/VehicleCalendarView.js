"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, User } from "lucide-react";

export default function VehicleCalendarView({ bookings, vehicles }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedVehicle, setSelectedVehicle] = useState("all");

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const filteredBookings = bookings.filter(
        (b) => selectedVehicle === "all" || b.vehicleId === selectedVehicle
    );

    const getBookingsForDay = (day) => {
        return filteredBookings.filter((booking) => {
            const start = new Date(booking.startTime);
            const end = new Date(booking.endTime);
            // Normalize dates to start of day for comparison
            const checkDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());
            const bookingStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const bookingEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

            return checkDay >= bookingStart && checkDay <= bookingEnd;
        });
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="glass-card p-4 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={previousMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold min-w-[200px] text-center">
                        {format(currentDate, "MMMM yyyy", { locale: id })}
                    </h2>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                    <option value="all">Semua Kendaraan</option>
                    {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.name} ({vehicle.licensePlate})
                        </option>
                    ))}
                </select>
            </div>

            {/* Calendar Grid */}
            <div className="glass-card p-4">
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                        <div key={day} className="text-center font-semibold text-sm text-text-light py-2">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {daysInMonth.map((day) => {
                        const dayBookings = getBookingsForDay(day);
                        const isCurrentDay = isToday(day);

                        return (
                            <div
                                key={day.toString()}
                                className={`min-h-[120px] p-2 rounded-lg border transition-all ${isCurrentDay
                                    ? "border-accent bg-blue-50"
                                    : "border-gray-200 bg-white hover:border-accent hover:shadow-md"
                                    }`}
                            >
                                <div className={`text-sm font-semibold mb-1 ${isCurrentDay ? "text-accent" : "text-text-dark"}`}>
                                    {format(day, "d")}
                                </div>
                                <div className="space-y-1">
                                    {dayBookings.slice(0, 3).map((booking) => (
                                        <div
                                            key={booking.id}
                                            className={`text-xs p-1 rounded ${booking.status === "APPROVED"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            title={`${booking.purpose} - ${booking.vehicle.name} (${booking.vehicle.licensePlate})`}
                                        >
                                            <div className="font-semibold truncate">{booking.purpose}</div>
                                            <div className="text-[10px] truncate font-medium text-gray-700 flex items-center gap-1">
                                                <User size={10} className="inline" />
                                                {booking.user?.name || "User"}
                                            </div>
                                            <div className="text-[10px] truncate">{booking.vehicle.name} ({booking.vehicle.licensePlate})</div>
                                            <div className="text-[10px]">
                                                {format(new Date(booking.startTime), "HH:mm")} - {format(new Date(booking.endTime), "HH:mm")}
                                            </div>
                                        </div>
                                    ))}
                                    {dayBookings.length > 3 && (
                                        <div className="text-xs text-text-light text-center">
                                            +{dayBookings.length - 3} lainnya
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="glass-card p-4 flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-sm">Disetujui</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                    <span className="text-sm">Menunggu Konfirmasi</span>
                </div>
            </div>
        </div>
    );
}
