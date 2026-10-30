export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assessFoodSafety } from "@/lib/food-safety";
import { calculateUrgency } from "@/lib/matching-engine";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const donorId = searchParams.get("donorId");

    const user = session.user as any;
    const where: any = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (donorId) where.donorId = donorId;
    if (user.role === "DONOR") where.donorId = user.id;

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: {
          donor: { select: { id: true, name: true, email: true } },
          matches: {
            include: { recipient: { select: { id: true, name: true, type: true } } },
            orderBy: { matchScore: "desc" },
            take: 3,
          },
          delivery: { include: { volunteer: { select: { id: true, name: true } } } },
          impact: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.donation.count({ where }),
    ]);

    return NextResponse.json({ donations, total, page, limit });
  } catch (error) {
    console.error("Get donations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    if (user.role !== "DONOR" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only donors can create donations" }, { status: 403 });
    }

    const body = await req.json();
    const {
      foodName, category, quantity, unit, servings, dietaryType, allergens,
      preparedAt, availableFrom, consumeBefore, storageCondition,
      pickupAddress, pickupLat, pickupLng, contactPerson, contactPhone,
      accessInstructions, packagingCondition, currentTemperature, notes,
    } = body;

    if (!foodName || !category || !quantity || !unit || !servings || !consumeBefore || !pickupAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const consumeDate = new Date(consumeBefore);
    const availableDate = availableFrom ? new Date(availableFrom) : new Date();

    // AI safety assessment
    const safety = assessFoodSafety({
      foodName,
      category,
      preparedAt: preparedAt ? new Date(preparedAt) : null,
      consumeBefore: consumeDate,
      storageCondition,
      packagingCondition,
      currentTemperature,
      allergens,
    });

    // Calculate urgency
    const urgency = calculateUrgency(consumeDate);

    const donation = await prisma.donation.create({
      data: {
        donorId: user.id,
        foodName,
        category,
        quantity: parseFloat(quantity),
        unit,
        servings: parseInt(servings),
        dietaryType: dietaryType || "VEGETARIAN",
        allergens: allergens ? JSON.stringify(allergens) : null,
        preparedAt: preparedAt ? new Date(preparedAt) : null,
        availableFrom: availableDate,
        consumeBefore: consumeDate,
        storageCondition,
        pickupAddress,
        pickupLat: pickupLat ? parseFloat(pickupLat) : null,
        pickupLng: pickupLng ? parseFloat(pickupLng) : null,
        contactPerson,
        contactPhone,
        accessInstructions,
        packagingCondition,
        currentTemperature,
        status: safety.status === "DO_NOT_REDISTRIBUTE" ? "DRAFT" : "AVAILABLE",
        urgency: urgency.level === "EXPIRED" ? "CRITICAL" : urgency.level,
        safetyStatus: safety.status,
        notes,
        aiSummary: `${quantity} ${unit} of ${foodName}. ${urgency.level === "CRITICAL" ? "CRITICAL - requires immediate pickup." : `${Math.round(urgency.hoursLeft)}h until expiry.`} Safety: ${safety.status.replace(/_/g, " ")}.`,
      },
    });

    // Notify donor
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "DONATION_CREATED",
        title: "Donation Created",
        message: `Your donation of ${quantity} ${unit} of ${foodName} has been posted. AI is finding the best recipient.`,
        link: `/dashboard/donations/${donation.id}`,
      },
    });

    return NextResponse.json({ donation, safety, urgency }, { status: 201 });
  } catch (error: any) {
    console.error("Create donation error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

