import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(request) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_ROOM')) {
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

        const [total, approved, rejected, pending, rooms, bookings] = await Promise.all([
            prisma.booking.count({
                where: {
                    startTime: { gte: startDate, lte: endDate }
                }
            }),
            prisma.booking.count({
                where: {
                    startTime: { gte: startDate, lte: endDate },
                    status: 'APPROVED'
                }
            }),
            prisma.booking.count({
                where: {
                    startTime: { gte: startDate, lte: endDate },
                    status: 'REJECTED'
                }
            }),
            prisma.booking.count({
                where: {
                    startTime: { gte: startDate, lte: endDate },
                    status: 'PENDING'
                }
            }),
            prisma.room.findMany({
                include: {
                    _count: {
                        select: {
                            bookings: {
                                where: {
                                    startTime: { gte: startDate, lte: endDate }
                                }
                            }
                        }
                    }
                }
            }),
            prisma.booking.findMany({
                where: {
                    startTime: { gte: startDate, lte: endDate }
                },
                include: {
                    user: true,
                    room: true,
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
            rooms,
            bookings
        });
    } catch (error) {
        console.error("Room Report API error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
