import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, role, organizationName, organizationType, address } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    let orgId: string | undefined;

    if (organizationName && organizationType) {
      const org = await prisma.organization.create({
        data: {
          name: organizationName,
          type: organizationType,
          address: address || "",
          verificationStatus: "UNVERIFIED",
        },
      });
      orgId = org.id;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        phone: phone || null,
        role,
        organizationId: orgId || null,
        verificationStatus: "UNVERIFIED",
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "WELCOME",
        title: "Welcome to FoodBridge AI!",
        message: `Welcome ${user.name}! Your account has been created. Start making an impact today.`,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
