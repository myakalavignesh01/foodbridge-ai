export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = session.user as any;
    const body = await req.json();
    const { action, proof, notes } = body; // action: ACCEPT_PICKUP | CONFIRM_PICKUP | CONFIRM_DELIVERY

    if (user.role !== "VOLUNTEER" && user.role !== "ADMIN" && user.role !== "RECIPIENT") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const delivery = await prisma.delivery.findUnique({ where: { donationId: id } });
    if (!delivery) return NextResponse.json({ error: "No delivery record found" }, { status: 404 });

    const donation = await prisma.donation.findUnique({ where: { id } });
    if (!donation) return NextResponse.json({ error: "Donation not found" }, { status: 404 });

    if (action === "ACCEPT_PICKUP") {
      await prisma.delivery.update({
        where: { donationId: id },
        data: { volunteerId: user.id, status: "ASSIGNED" },
      });
      await prisma.donation.update({ where: { id }, data: { status: "PICKUP_ASSIGNED" } });

      // Notify donor
      await prisma.notification.create({
        data: {
          userId: donation.donorId,
          type: "VOLUNTEER_ASSIGNED",
          title: "Volunteer Assigned",
          message: `A volunteer has accepted the pickup for your donation of ${donation.foodName}.`,
          link: `/dashboard/donations/${id}`,
        },
      });
    } else if (action === "CONFIRM_PICKUP") {
      await prisma.delivery.update({
        where: { donationId: id },
        data: { status: "PICKED_UP", pickupTime: new Date(), pickupProof: proof || null },
      });
      await prisma.donation.update({ where: { id }, data: { status: "IN_TRANSIT" } });
    } else if (action === "CONFIRM_DELIVERY") {
      await prisma.delivery.update({
        where: { donationId: id },
        data: { status: "DELIVERED", deliveryTime: new Date(), deliveryProof: proof || null },
      });
      await prisma.donation.update({ where: { id }, data: { status: "DELIVERED" } });

      // Create impact record
      await prisma.impact.upsert({
        where: { donationId: id },
        update: {},
        create: {
          donationId: id,
          meals: donation.servings,
          foodWeight: donation.quantity,
          peopleReached: Math.round(donation.servings * 0.8),
          co2Saved: donation.quantity * 2.5,
        },
      });

      await prisma.donation.update({ where: { id }, data: { status: "COMPLETED" } });

      // Notify donor
      await prisma.notification.create({
        data: {
          userId: donation.donorId,
          type: "DELIVERY_COMPLETED",
          title: "Donation Delivered!",
          message: `Your donation of ${donation.foodName} has been successfully delivered. Impact recorded!`,
          link: `/dashboard/donations/${id}`,
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ message: "Delivery updated" });
  } catch (error) {
    console.error("Delivery update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
