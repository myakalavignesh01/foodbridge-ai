export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const [
      totalUsers, totalDonations, completedDonations, activeDonations,
      totalMeals, totalOrgs, pendingDeliveries, volunteers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.donation.count(),
      prisma.donation.count({ where: { status: "COMPLETED" } }),
      prisma.donation.count({ where: { status: { in: ["AVAILABLE", "MATCHED", "PICKUP_ASSIGNED", "IN_TRANSIT"] } } }),
      prisma.impact.aggregate({ _sum: { meals: true } }),
      prisma.organization.count(),
      prisma.delivery.count({ where: { status: { in: ["PENDING", "ASSIGNED"] } } }),
      prisma.user.count({ where: { role: "VOLUNTEER" } }),
    ]);

    // Donations by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentDonations = await prisma.donation.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, status: true, category: true },
    });

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    recentDonations.forEach(d => {
      categoryMap[d.category] = (categoryMap[d.category] || 0) + 1;
    });

    return NextResponse.json({
      totalUsers,
      totalDonations,
      completedDonations,
      activeDonations,
      totalMeals: totalMeals._sum.meals || 0,
      totalOrgs,
      pendingDeliveries,
      volunteers,
      successRate: totalDonations > 0 ? Math.round((completedDonations / totalDonations) * 100) : 0,
      categoryBreakdown: categoryMap,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

