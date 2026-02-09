import Link from "next/link";
import { Building2, Car } from "lucide-react";
import { auth } from "@/auth";
import LoginForm from "@/components/LoginForm";

export default async function LandingPage() {
  const session = await auth();

  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass-card p-8 w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img
                src="/logo-bptapera-full.png"
                alt="BP TAPERA Logo"
                className="w-40 h-40 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-primary">Aplikasi Pemesanan</h1>
            <p className="text-text-light mt-2 text-sm">BP TAPERA</p>
          </div>

          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Aplikasi Pemesanan BP TAPERA
        </h1>
        <p className="text-xl text-text-light">
          Sistem Pemesanan Ruang Meeting & Kendaraan Operasional
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        {/* Room Booking Card */}
        <Link
          href="/rooms"
          className="group relative bg-white/50 backdrop-blur-sm p-8 rounded-2xl border-2 border-transparent hover:border-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
              <Building2 size={48} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">
              Booking Ruang Meeting
            </h2>
            <p className="text-text-light">
              Reservasi ruang rapat untuk keperluan meeting internal dan eksternal
            </p>
            <span className="inline-block mt-4 text-primary font-semibold group-hover:translate-x-1 transition-transform">
              Masuk ke Dashboard &rarr;
            </span>
          </div>
        </Link>

        {/* Vehicle Booking Card */}
        <Link
          href="/vehicles"
          className="group relative bg-white/50 backdrop-blur-sm p-8 rounded-2xl border-2 border-transparent hover:border-accent/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-accent/10 rounded-full group-hover:bg-accent/20 transition-colors">
              <Car size={48} className="text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary">
              Booking Kendaraan
            </h2>
            <p className="text-text-light">
              Pemesanan kendaraan operasional untuk kegiatan dinas
            </p>
            <span className="inline-block mt-4 text-accent font-semibold group-hover:translate-x-1 transition-transform">
              Masuk ke Dashboard &rarr;
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
