import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import VehicleForm from "@/components/VehicleForm";

export default async function EditVehiclePage({ params }) {
    const session = await auth();

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PENGELOLA_VEHICLE")) {
        redirect("/");
    }

    const awaitedParams = await params;
    const { id } = awaitedParams;

    const vehicle = await prisma.vehicle.findUnique({
        where: { id },
    });

    if (!vehicle) {
        notFound();
    }

    return <VehicleForm vehicle={vehicle} />;
}
