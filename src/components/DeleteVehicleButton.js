"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteVehicleButton({ vehicleId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus kendaraan ini?")) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Gagal menghapus kendaraan");
            }

            router.refresh();
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Hapus Kendaraan"
        >
            <Trash2 size={16} />
        </button>
    );
}
