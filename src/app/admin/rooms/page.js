import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import DeleteRoomButton from "@/components/DeleteRoomButton";

export default async function AdminRoomsPage() {
    const session = await auth();

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_ROOM')) {
        redirect("/");
    }

    const rooms = await prisma.room.findMany({
        include: {
            _count: {
                select: { bookings: true },
            },
        },
        orderBy: { name: 'asc' },
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Manajemen Ruang Meeting</h1>
                    <p className="text-text-light mt-1">Kelola ruang meeting yang tersedia</p>
                </div>
                <Link
                    href="/admin/rooms/new"
                    className="btn-primary px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                    <Plus size={20} />
                    Tambah Ruang
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                    <div key={room.id} className="glass-card p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-bold">{room.name}</h3>
                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/rooms/${room.id}/edit`}
                                    className="p-2 hover:bg-blue-50 text-primary rounded-lg transition-colors"
                                >
                                    <Edit size={18} />
                                </Link>
                                <DeleteRoomButton roomId={room.id} />
                            </div>
                        </div>

                        <p className="text-sm text-text-light mb-4">{room.description}</p>

                        <div className="flex items-center gap-2 text-sm text-text-light mb-3">
                            <Users size={16} />
                            <span>Kapasitas: {room.capacity} orang</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                            {room.facilities.map((facility, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                                    {facility}
                                </span>
                            ))}
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                            <p className="text-xs text-text-light">
                                Total Pemesanan: <span className="font-semibold">{room._count.bookings}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {rooms.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <p className="text-text-light">Belum ada ruang meeting. Tambahkan ruang pertama Anda!</p>
                </div>
            )}
        </div>
    );
}
