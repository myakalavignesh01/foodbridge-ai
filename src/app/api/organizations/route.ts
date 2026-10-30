export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const verified = searchParams.get("verified");

    const where: any = {};
    if (type) where.type = type;
    if (verified) where.verificationStatus = { not: "UNVERIFIED" };

    const orgs = await prisma.organization.findMany({
      where,
      include: {
        users: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orgs);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const body = await req.json();
    const { id, verificationStatus } = body;

    const org = await prisma.organization.update({
      where: { id },
      data: { verificationStatus },
    });

    // Update all users in this org
    await prisma.user.updateMany({
      where: { organizationId: id },
      data: { verificationStatus },
    });

    return NextResponse.json(org);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

