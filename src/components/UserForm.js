"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, User as UserIcon, Lock, Shield, AlertCircle } from "lucide-react";

export default function UserForm({ user = null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.target);
        const data = {
            name: formData.get("name"),
            username: formData.get("username"),
            email: formData.get("email"),
            role: formData.get("role"),
            isLdap: formData.get("isLdap") === "on",
        };

        // Only include password if it's provided
        const password = formData.get("password");
        if (password) {
            data.password = password;
        }

        try {
            const url = user ? `/api/users/${user.id}` : "/api/users";
            const method = user ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Gagal menyimpan user");
            }

            router.push("/admin/users");
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-text-dark mb-2 flex items-center gap-2">
                    <UserIcon size={18} />
                    Nama Lengkap
                </label>
                <input
                    type="text"
                    name="name"
                    required
                    defaultValue={user?.name}
                    placeholder="Contoh: John Doe"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-dark mb-2 flex items-center gap-2">
                    <UserIcon size={18} />
                    Username
                </label>
                <input
                    type="text"
                    name="username"
                    required
                    defaultValue={user?.username}
                    placeholder="Contoh: johndoe"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-dark mb-2 flex items-center gap-2">
                    <Mail size={18} />
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    required
                    defaultValue={user?.email}
                    placeholder="user@bptapera.go.id"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-dark mb-2 flex items-center gap-2">
                    <Lock size={18} />
                    Password {user && "(Kosongkan jika tidak ingin mengubah)"}
                </label>
                <input
                    type="password"
                    name="password"
                    required={!user}
                    placeholder={user ? "••••••••" : "Minimal 6 karakter"}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-dark mb-2 flex items-center gap-2">
                    <Shield size={18} />
                    Role
                </label>
                <select
                    name="role"
                    required
                    defaultValue={user?.role || "USER"}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                    <option value="USER">User</option>
                    <option value="PENGELOLA_ROOM">Pengelola Ruang Meeting</option>
                    <option value="PENGELOLA_VEHICLE">Pengelola Kendaraan</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        name="isLdap"
                        defaultChecked={user?.isLdap}
                        className="mt-1 w-5 h-5 text-primary focus:ring-primary rounded"
                    />
                    <div>
                        <span className="font-medium text-text-dark">User LDAP</span>
                        <p className="text-sm text-text-light mt-1">
                            Centang jika user ini menggunakan autentikasi LDAP. Username harus sesuai dengan sAMAccountName.
                        </p>
                    </div>
                </label>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition-colors"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Menyimpan..." : user ? "Update User" : "Tambah User"}
                </button>
            </div>
        </form>
    );
}
