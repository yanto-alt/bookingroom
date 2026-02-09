import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";

export default async function SignInPage() {
    const session = await auth();

    if (session) {
        redirect("/");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100">
            <div className="glass-card p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <img
                            src="/logo-bptapera-full.png"
                            alt="BP TAPERA Logo"
                            className="w-40 h-40 object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-primary">Aplikasi Pemesanan</h1>
                    <p className="text-text-light mt-2">BP TAPERA</p>
                </div>

                <LoginForm />

            </div>
        </div>
    );
}
