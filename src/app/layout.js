import "./globals.css";
import { auth, signOut } from "@/auth";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Aplikasi Booking BP TAPERA",
  description: "Internal Booking System",
};

import DevToolsBlocker from "@/components/DevToolsBlocker";

// Imports moved to top: import Navbar from "@/components/Navbar";

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <DevToolsBlocker />
        {session && (
          <Navbar
            user={session.user}
            signOutAction={async () => {
              "use server"
              await signOut()
            }}
          />
        )}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full fade-in">
          {children}
        </main>
      </body>
    </html>
  );
}
