import { NextResponse } from "next/server";
import { auth } from "@/auth";
import ldap from "ldapjs";

export const dynamic = 'force-dynamic';

function createClient(url) {
    return ldap.createClient({ url });
}

function bind(client, dn, password) {
    return new Promise((resolve, reject) => {
        client.bind(dn, password, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function unbind(client) {
    return new Promise((resolve, reject) => {
        client.unbind((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function destroy(client) {
    try {
        client.destroy();
    } catch (e) {
        // ignore
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { ldap_url, ldap_bind_dn, ldap_bind_password } = body;

        if (!ldap_url || !ldap_bind_dn || !ldap_bind_password) {
            return NextResponse.json({ message: "Mohon lengkapi URL, Bind DN, dan Password." }, { status: 400 });
        }

        const client = createClient(ldap_url);

        try {
            await bind(client, ldap_bind_dn, ldap_bind_password);
            await unbind(client);
            return NextResponse.json({ message: "Koneksi LDAP Berhasil!" }, { status: 200 });
        } catch (error) {
            destroy(client);
            console.error("LDAP Test Bind Error:", error);
            return NextResponse.json(
                { message: `Gagal terhubung ke LDAP: ${error.message}` },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("LDAP Test Error:", error);
        return NextResponse.json(
            { message: "Internal server error during LDAP test" },
            { status: 500 }
        );
    }
}
