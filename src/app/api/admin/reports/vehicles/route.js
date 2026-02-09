import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { endOfMonth } from "date-fns";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_VEHICLE')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get("month"));
        const year = parseInt(searchParams.get("year"));

        if (isNaN(month) || isNaN(year)) {
            return NextResponse.json({ message: "Invalid month or year" }, { status: 400 });
        }

        const startDate = new Date(year, month, 1);
        const endDate = endOfMonth(startDate);

        const [total, approved, rejected, pending, bookings] = await Promise.all([
            prisma.vehicleBooking.count({
                where: {
                    startTime: { gte: startDate, lte: endDate }
                }
            }),
            prisma.vehicleBooking.count({
                where: {
                    startTime: { gte: startDate, lte: endDate },
                    status: 'APPROVED'
                }
            }),
            prisma.vehicleBooking.count({
                where: {
                    startTime: { gte: startDate, lte: endDate },
                    status: 'REJECTED'
                }
            }),
            prisma.vehicleBooking.count({
                where: {
                    startTime: { gte: startDate, lte: endDate },
                    status: 'PENDING'
                }
            }),
            prisma.vehicleBooking.findMany({
                where: {
                    startTime: { gte: startDate, lte: endDate }
                },
                include: {
                    user: true,
                    vehicle: true,
                },
                orderBy: { startTime: 'desc' }
            })
        ]);

        return NextResponse.json({
            stats: {
                total,
                approved,
                rejected,
                pending
            },
            bookings
        });
    } catch (error) {
        console.error("Vehicle Report API error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
