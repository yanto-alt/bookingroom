import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch user's bookings
  const userBookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { room: true },
    orderBy: { startTime: 'desc' },
    take: 5,
  });

  // Fetch all rooms
  const rooms = await prisma.room.findMany({
    include: {
      bookings: {
        where: {
          startTime: { lte: new Date() },
          endTime: { gte: new Date() },
          status: 'APPROVED',
        },
      },
    },
  });

  // Stats for admin
  let stats = null;
  if (session.user.role === 'ADMIN') {
    const [totalBookings, pendingBookings, totalRooms] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.room.count(),
    ]);
    stats = { totalBookings, pendingBookings, totalRooms };
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="text-green-500" size={20} />;
      case 'REJECTED': return <XCircle className="text-red-500" size={20} />;
      case 'PENDING': return <AlertCircle className="text-yellow-500" size={20} />;
      default: return <Clock className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-text-light mt-1">Selamat datang, {session.user.name}</p>
        </div>
        <Link
          href="/bookings/new"
          className="btn-primary px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          <Calendar size={20} />
          Pesan Ruang Meeting
        </Link>
      </div>

      {/* Admin Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Total Pemesanan</p>
                <p className="text-3xl font-bold text-primary mt-1">{stats.totalBookings}</p>
              </div>
              <Calendar className="text-primary opacity-20" size={48} />
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Menunggu Konfirmasi</p>
                <p className="text-3xl font-bold text-yellow-500 mt-1">{stats.pendingBookings}</p>
              </div>
              <AlertCircle className="text-yellow-500 opacity-20" size={48} />
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Total Ruang Meeting</p>
                <p className="text-3xl font-bold text-accent mt-1">{stats.totalRooms}</p>
              </div>
              <Users className="text-accent opacity-20" size={48} />
            </div>
          </div>
        </div>
      )}

      {/* Available Rooms */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users size={24} className="text-primary" />
          Ruang Meeting Tersedia
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const isOccupied = room.bookings.length > 0;
            return (
              <div key={room.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{room.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isOccupied ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {isOccupied ? 'Terpakai' : 'Tersedia'}
                  </span>
                </div>
                <p className="text-sm text-text-light mb-3">{room.description}</p>
                <div className="flex items-center gap-2 text-sm text-text-light">
                  <Users size={16} />
                  <span>Kapasitas: {room.capacity} orang</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {room.facilities.slice(0, 3).map((facility, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock size={24} className="text-primary" />
          Pemesanan Terakhir Anda
        </h2>
        {userBookings.length === 0 ? (
          <p className="text-text-light text-center py-8">Belum ada pemesanan</p>
        ) : (
          <div className="space-y-3">
            {userBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(booking.status)}
                    <h3 className="font-semibold">{booking.title}</h3>
                  </div>
                  <p className="text-sm text-text-light">{booking.room.name}</p>
                  <p className="text-xs text-text-light mt-1">
                    {new Date(booking.startTime).toLocaleString('id-ID')} - {new Date(booking.endTime).toLocaleTimeString('id-ID')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${booking.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                  booking.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                  }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
