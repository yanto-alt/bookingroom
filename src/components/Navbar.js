"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Calendar, Home, Settings, PieChart, Users, CheckCircle, ClipboardList, Menu, X, Car, Briefcase } from "lucide-react";

export default function Navbar({ user, signOutAction }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const [context, setContext] = useState("HOME"); // HOME, ROOMS, VEHICLES

    useEffect(() => {
        if (pathname.startsWith("/rooms") || pathname.startsWith("/admin/rooms") || pathname === "/admin/bookings" || pathname.startsWith("/admin/bookings")) {
            setContext("ROOMS");
        } else if (pathname.startsWith("/vehicles") || pathname.startsWith("/admin/vehicles") || pathname.startsWith("/admin/approvals/vehicles")) {
            setContext("VEHICLES");
        } else if (pathname === "/") {
            setContext("HOME");
        }
        // Default to HOME or keep previous context if navigating to generic pages like /profile
    }, [pathname]);

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const isAdmin = user.role === 'ADMIN';
    const isRoomAdmin = isAdmin || user.role === 'PENGELOLA_ROOM';
    const isVehicleAdmin = isAdmin || user.role === 'PENGELOLA_VEHICLE';

    return (
        <nav className="glass-card sticky top-4 mx-4 my-2 z-50 px-6 py-3">
            <div className="flex items-center justify-between">
                {/* Logo and Brand */}
                <div className="flex items-center gap-8">
                    <Link href="/" onClick={closeMenu} className="flex items-center gap-3">
                        <img
                            src="/logo-bptapera.svg"
                            alt="BP TAPERA Logo"
                            className="w-10 h-10"
                        />
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-primary">BP TAPERA</span>
                            <span className="text-xs text-text-light">
                                {context === "VEHICLES" ? "Vehicle Booking" : context === "ROOMS" ? "Meeting Room Booking" : "Booking System"}
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                        {/* Always show Home */}
                        <Link href="/" className={`flex items-center gap-2 transition-colors ${pathname === "/" ? "text-primary font-bold" : "text-text-dark hover:text-primary"}`}>
                            <Home size={18} /> Home
                        </Link>

                        {/* ROOM CONTEXT LINKS */}
                        {context === "ROOMS" && (
                            <>
                                <Link href="/rooms" className={`flex items-center gap-2 transition-colors ${pathname === "/rooms" ? "text-primary font-bold" : "text-text-dark hover:text-primary"}`}>
                                    <Briefcase size={18} /> Dashboard
                                </Link>
                                <Link href="/calendar" className={`flex items-center gap-2 transition-colors ${pathname === "/calendar" ? "text-primary font-bold" : "text-text-dark hover:text-primary"}`}>
                                    <Calendar size={18} /> Kalendar
                                </Link>

                                {/* Room Admin Links */}
                                {isRoomAdmin && (
                                    <>
                                        <Link href="/admin" className="flex items-center gap-2 text-text-dark hover:text-primary transition-colors">
                                            <CheckCircle size={18} /> Konfirmasi
                                        </Link>
                                        <Link href="/admin/bookings" className="flex items-center gap-2 text-text-dark hover:text-primary transition-colors">
                                            <ClipboardList size={18} /> Pemesanan
                                        </Link>
                                        <Link href="/admin/rooms" className="flex items-center gap-2 text-text-dark hover:text-primary transition-colors">
                                            <Users size={18} /> Ruangan
                                        </Link>
                                        <Link href="/admin/reports" className="flex items-center gap-2 text-text-dark hover:text-primary transition-colors">
                                            <PieChart size={18} /> Laporan
                                        </Link>
                                    </>
                                )}
                            </>
                        )}

                        {/* VEHICLE CONTEXT LINKS */}
                        {context === "VEHICLES" && (
                            <>
                                <Link href="/vehicles" className={`flex items-center gap-2 transition-colors ${pathname === "/vehicles" ? "text-primary font-bold" : "text-text-dark hover:text-primary"}`}>
                                    <Car size={18} /> Dashboard
                                </Link>
                                <Link href="/vehicles/calendar" className={`flex items-center gap-2 transition-colors ${pathname === "/vehicles/calendar" ? "text-primary font-bold" : "text-text-dark hover:text-primary"}`}>
                                    <Calendar size={18} /> Jadwal
                                </Link>

                                {/* Vehicle Admin Links */}
                                {isVehicleAdmin && (
                                    <>
                                        <Link href="/admin/approvals/vehicles" className="flex items-center gap-2 text-text-dark hover:text-primary transition-colors">
                                            <CheckCircle size={18} /> Konfirmasi
                                        </Link>
                                        <Link href="/admin/vehicles" className="flex items-center gap-2 text-text-dark hover:text-primary transition-colors">
                                            <Car size={18} /> Kelola Kendaraan
                                        </Link>
                                        <Link href="/admin/reports/vehicles" className="flex items-center gap-2 text-text-dark hover:text-primary transition-colors">
                                            <PieChart size={18} /> Laporan
                                        </Link>
                                    </>
                                )}
                            </>
                        )}

                        {/* Global Admin Links (Settings, Users) - Show in both contexts if Admin */}
                        {isAdmin && (context === "ROOMS" || context === "VEHICLES") && (
                            <>
                                <Link href="/admin/users" className="flex items-center gap-2 text-text-dark hover:text-primary transition-colors">
                                    <Users size={18} /> Users
                                </Link>
                                <Link href="/admin/settings" className="flex items-center gap-2 text-text-dark hover:text-primary transition-colors">
                                    <Settings size={18} /> Settings
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* User Info & Actions (Desktop) */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-text-light">{user.role}</p>
                    </div>
                    <form action={signOutAction}>
                        <button className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors" title="Sign Out">
                            <LogOut size={20} />
                        </button>
                    </form>
                </div>

                {/* Mobile Hamburger Button */}
                <div className="md:hidden flex items-center">
                    <button onClick={toggleMenu} className="p-2 text-text-dark hover:text-primary transition-colors">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden mt-4 pt-4 border-t border-gray-100 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">{user.name}</span>
                            <span className="text-xs text-text-light">{user.role}</span>
                        </div>
                        <form action={signOutAction}>
                            <button className="flex items-center gap-2 text-xs font-medium text-red-500 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors">
                                Sign Out <LogOut size={14} />
                            </button>
                        </form>
                    </div>

                    <nav className="flex flex-col gap-3">
                        <Link href="/" onClick={closeMenu} className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 text-text-dark hover:text-primary transition-colors">
                            <Home size={20} /> Home
                        </Link>

                        {context === "ROOMS" && (
                            <>
                                <Link href="/rooms" onClick={closeMenu} className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 text-text-dark hover:text-primary transition-colors">
                                    <Briefcase size={20} /> Dashboard Ruangan
                                </Link>
                                <Link href="/calendar" onClick={closeMenu} className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 text-text-dark hover:text-primary transition-colors">
                                    <Calendar size={20} /> Kalendar
                                </Link>
                                {isRoomAdmin && (
                                    <>
                                        <div className="text-xs font-semibold text-gray-400 mt-2 pl-2">ADMIN RUANGAN</div>
                                        <Link href="/admin" onClick={closeMenu} className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 text-text-dark hover:text-primary transition-colors">
                                            <CheckCircle size={20} /> Konfirmasi
                                        </Link>
                                        <Link href="/admin/bookings" onClick={closeMenu} className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 text-text-dark hover:text-primary transition-colors">
                                            <ClipboardList size={20} /> Pemesanan
                                        </Link>
                                    </>
                                )}
                            </>
                        )}

                        {context === "VEHICLES" && (
                            <>
                                <Link href="/vehicles/calendar" onClick={closeMenu} className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 text-text-dark hover:text-primary transition-colors">
                                    <Calendar size={20} /> Jadwal
                                </Link>
                                {isVehicleAdmin && (
                                    <>
                                        <div className="text-xs font-semibold text-gray-400 mt-2 pl-2">ADMIN KENDARAAN</div>
                                        <Link href="/admin/approvals/vehicles" onClick={closeMenu} className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 text-text-dark hover:text-primary transition-colors">
                                            <CheckCircle size={20} /> Konfirmasi
                                        </Link>
                                        <Link href="/admin/vehicles" onClick={closeMenu} className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 text-text-dark hover:text-primary transition-colors">
                                            <Car size={20} /> Kelola Kendaraan
                                        </Link>
                                        <Link href="/admin/reports/vehicles" onClick={closeMenu} className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 text-text-dark hover:text-primary transition-colors">
                                            <PieChart size={20} /> Laporan
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </nav>
                </div>
            )}
        </nav>
    );
}
