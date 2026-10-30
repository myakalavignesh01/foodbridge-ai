export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/donations/[id]/accept - recipient accepts a match
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = session.user as any;

    if (user.role !== "RECIPIENT" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only recipients can accept donations" }, { status: 403 });
    }

    const donation = await prisma.donation.findUnique({ where: { id } });
    if (!donation) return NextResponse.json({ error: "Donation not found" }, { status: 404 });

    const match = await prisma.match.findFirst({
      where: { donationId: id, recipientId: user.organizationId, status: "PENDING" },
    });

    if (!match) return NextResponse.json({ error: "No pending match found for your organization" }, { status: 404 });

    await prisma.match.update({ where: { id: match.id }, data: { status: "ACCEPTED" } });
    await prisma.donation.update({ where: { id }, data: { status: "PICKUP_ASSIGNED" } });

    // Create delivery record
    await prisma.delivery.upsert({
      where: { donationId: id },
      update: {},
      create: { donationId: id, status: "PENDING" },
    });

    // Notify donor
    await prisma.notification.create({
      data: {
        userId: donation.donorId,
        type: "MATCH_ACCEPTED",
        title: "Donation Accepted!",
        message: `Your donation of ${donation.foodName} has been accepted. A volunteer will be assigned shortly.`,
        link: `/dashboard/donations/${id}`,
      },
    });

    return NextResponse.json({ message: "Donation accepted" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
