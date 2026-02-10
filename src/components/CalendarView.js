"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, User, MapPin } from "lucide-react";

export default function CalendarView({ bookings, rooms }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedRoom, setSelectedRoom] = useState("all");

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const filteredBookings = bookings.filter(
        (b) => selectedRoom === "all" || b.roomId === selectedRoom
    );

    const getBookingsForDay = (day) => {
        return filteredBookings.filter((booking) => {
            const start = new Date(booking.startTime);
            const end = new Date(booking.endTime);
            // Check if 'day' is within the start-end range (inclusive of days)
            return isWithinInterval(day, {
                start: startOfDay(start),
                end: endOfDay(end)
            });
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
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="all">Semua Ruangan</option>
                    {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                            {room.name}
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
                                    ? "border-primary bg-blue-50"
                                    : "border-gray-200 bg-white hover:border-primary hover:shadow-md"
                                    }`}
                            >
                                <div className={`text-sm font-semibold mb-1 ${isCurrentDay ? "text-primary" : "text-text-dark"}`}>
                                    {format(day, "d")}
                                </div>
                                <div className="space-y-1">
                                    {dayBookings.slice(0, 3).map((booking) => {
                                        const start = new Date(booking.startTime);
                                        const end = new Date(booking.endTime);
                                        const isMultiDay = !isSameDay(start, end);

                                        return (
                                            <div
                                                key={booking.id}
                                                className={`text-xs p-1.5 rounded ${booking.status === "APPROVED"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                                title={`${booking.title} - ${booking.room.name} (${booking.user.name})`}
                                            >
                                                <div className="font-semibold truncate">{booking.title}</div>
                                                <div className="text-[10px] truncate font-medium text-gray-700 flex items-center gap-1">
                                                    <User size={10} className="inline" />
                                                    {booking.user?.name || "User"}
                                                </div>
                                                <div className="text-[10px] truncate">{booking.room.name}</div>
                                                <div className="text-[10px] flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {start.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })} - {isMultiDay ? end.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : end.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        )
                                    })}
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
                    <span className="text-sm">Menunggu</span>
                </div>
            </div>
        </div>
    );
}
