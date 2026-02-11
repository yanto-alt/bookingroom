import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { syncLdapUsers } from "@/lib/ldapSync";

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const result = await syncLdapUsers();

        if (result.success) {
            return NextResponse.json({
                message: "Sinkronisasi berhasil!",
                stats: result.stats
            });
        } else {
            return NextResponse.json(
                { message: result.message || "Sinkronisasi gagal" },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Manual Sync Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
