"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Server, Lock, User, AlertCircle } from "lucide-react";

export default function SettingsForm({ settings }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [testMessage, setTestMessage] = useState(null); // { type: 'success' | 'error', text: string }

    // Sync state
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncMessage, setSyncMessage] = useState(null);

    // Controlled inputs state
    const [formData, setFormData] = useState({
        ldap_enabled: settings.ldap_enabled === "true",
        ldap_url: settings.ldap_url || "",
        ldap_bind_dn: settings.ldap_bind_dn || "",
        ldap_bind_password: settings.ldap_bind_password || "",
        ldap_base_dn: settings.ldap_base_dn || "",
        ldap_sync_enabled: settings.ldap_sync_enabled === "true",
        ldap_sync_interval: settings.ldap_sync_interval || "60",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTestConnection = async () => {
        setTestLoading(true);
        setTestMessage(null);

        const data = {
            ldap_url: formData.ldap_url,
            ldap_bind_dn: formData.ldap_bind_dn,
            ldap_bind_password: formData.ldap_bind_password,
        };

        try {
            const res = await fetch("/api/admin/settings/ldap/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Gagal tes koneksi");
            }

            setTestMessage({ type: 'success', text: result.message });
        } catch (error) {
            setTestMessage({ type: 'error', text: error.message });
        } finally {
            setTestLoading(false);
        }
    };

    const handleSyncNow = async () => {
        setSyncLoading(true);
        setSyncMessage(null);

        try {
            const res = await fetch("/api/admin/settings/ldap/sync", {
                method: "POST",
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Gagal sinkronisasi");
            }

            setSyncMessage({
                type: 'success',
                text: `${result.message} (+${result.stats.added}, Upd: ${result.stats.updated}, Err: ${result.stats.errors})`
            });
            router.refresh();
        } catch (error) {
            setSyncMessage({ type: 'error', text: error.message });
        } finally {
            setSyncLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("Gagal menyimpan pengaturan");
            }

            setSuccess(true);
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Server size={24} className="text-primary" />
                    Integrasi LDAP
                </h2>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4">
                        Pengaturan berhasil disimpan!
                    </div>
                )}

                <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="ldap_enabled"
                            checked={formData.ldap_enabled}
                            onChange={handleChange}
                            className="w-5 h-5 text-primary focus:ring-primary rounded"
                        />
                        <span className="font-medium">Aktifkan LDAP</span>
                    </label>
                    <p className="text-sm text-text-light mt-1 ml-7">
                        Izinkan pengguna untuk login menggunakan kredensial LDAP
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-dark mb-2 flex items-center gap-2">
                            <Server size={16} />
                            LDAP URL
                        </label>
                        <input
                            type="text"
                            name="ldap_url"
                            value={formData.ldap_url}
                            onChange={handleChange}
                            placeholder="ldap://localhost:389"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-dark mb-2 flex items-center gap-2">
                            <User size={16} />
                            Bind DN
                        </label>
                        <input
                            type="text"
                            name="ldap_bind_dn"
                            value={formData.ldap_bind_dn}
                            onChange={handleChange}
                            placeholder="cn=admin,dc=example,dc=org"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-dark mb-2 flex items-center gap-2">
                            <Lock size={16} />
                            Bind Password
                        </label>
                        <input
                            type="password"
                            name="ldap_bind_password"
                            value={formData.ldap_bind_password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Test Connection Button & Message */}
                    <div className="pt-2">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleTestConnection}
                                disabled={testLoading}
                                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {testLoading ? "Menguji..." : "Tes Koneksi LDAP"}
                            </button>

                            {testMessage && (
                                <span className={`text-sm flex items-center gap-1 ${testMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {testMessage.type === 'success' ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    ) : (
                                        <AlertCircle size={16} />
                                    )}
                                    {testMessage.text}
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                            Base DN
                        </label>
                        <input
                            type="text"
                            name="ldap_base_dn"
                            value={formData.ldap_base_dn}
                            onChange={handleChange}
                            placeholder="dc=example,dc=org"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Sinkronisasi User
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="ldap_sync_enabled"
                                        checked={formData.ldap_sync_enabled}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-primary focus:ring-primary rounded"
                                    />
                                    <span className="font-medium text-gray-700">Otomatis Sync User</span>
                                </label>
                                <p className="text-sm text-gray-500 mt-1 ml-7">
                                    Sinkronisasi user dari LDAP secara berkala
                                </p>
                            </div>

                            {formData.ldap_sync_enabled && (
                                <select
                                    name="ldap_sync_interval"
                                    value={formData.ldap_sync_interval}
                                    onChange={handleChange}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value="5">Setiap 5 Menit</option>
                                    <option value="15">Setiap 15 Menit</option>
                                    <option value="30">Setiap 30 Menit</option>
                                    <option value="60">Setiap 60 Menit</option>
                                </select>
                            )}
                        </div>

                        <div className="flex items-center gap-4 ml-7">
                            <button
                                type="button"
                                onClick={handleSyncNow}
                                disabled={syncLoading || !formData.ldap_enabled}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {syncLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menyinkronkan...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                        Sync Sekarang
                                    </>
                                )}
                            </button>
                            {syncMessage && (
                                <span className={`text-sm ${syncMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {syncMessage.text}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                    <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Catatan Penting:</p>
                        <p>Pastikan server LDAP dapat diakses dari aplikasi ini. Konfigurasi yang salah dapat menyebabkan kegagalan autentikasi.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
            </div>
        </form>
    );
}
