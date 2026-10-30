export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rankRecipients } from "@/lib/matching-engine";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        donor: { select: { id: true, name: true, email: true, phone: true } },
        matches: {
          include: { recipient: true },
          orderBy: { matchScore: "desc" },
        },
        delivery: { include: { volunteer: { select: { id: true, name: true, phone: true } } } },
        impact: true,
      },
    });
    if (!donation) return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    return NextResponse.json(donation);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const user = session.user as any;

    const donation = await prisma.donation.findUnique({ where: { id } });
    if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (donation.donorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.donation.update({ where: { id }, data: body });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = session.user as any;
    const donation = await prisma.donation.findUnique({ where: { id } });
    if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (donation.donorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.donation.update({ where: { id }, data: { status: "CANCELLED" } });
    return NextResponse.json({ message: "Donation cancelled" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
