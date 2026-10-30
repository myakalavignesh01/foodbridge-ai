export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rankRecipients } from "@/lib/matching-engine";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const donation = await prisma.donation.findUnique({ where: { id } });
    if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Get all verified recipients
    const recipients = await prisma.organization.findMany({
      where: {
        type: { in: ["NGO", "FOOD_BANK", "SHELTER", "COMMUNITY_KITCHEN"] },
        verificationStatus: { not: "UNVERIFIED" },
      },
    });

    const donationInput = {
      id: donation.id,
      foodName: donation.foodName,
      category: donation.category,
      quantity: donation.quantity,
      unit: donation.unit,
      servings: donation.servings,
      dietaryType: donation.dietaryType,
      allergens: donation.allergens,
      preparedAt: donation.preparedAt,
      availableFrom: donation.availableFrom,
      consumeBefore: donation.consumeBefore,
      storageCondition: donation.storageCondition,
      pickupLat: donation.pickupLat,
      pickupLng: donation.pickupLng,
      packagingCondition: donation.packagingCondition,
      currentTemperature: donation.currentTemperature,
    };

    const ranked = rankRecipients(donationInput, recipients.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      latitude: r.latitude,
      longitude: r.longitude,
      capacity: r.capacity,
      verificationStatus: r.verificationStatus,
      beneficiaries: r.beneficiaries,
      dailyMealRequirement: r.dailyMealRequirement,
      currentFoodStock: r.currentFoodStock,
      preferredCategories: r.preferredCategories,
    })));

    // Delete old matches and create new ones
    await prisma.match.deleteMany({ where: { donationId: id, status: "PENDING" } });

    const top3 = ranked.slice(0, 3);
    if (top3.length > 0) {
      await prisma.match.createMany({
        data: top3.map(m => ({
          donationId: id,
          recipientId: m.recipientId,
          matchScore: m.totalScore,
          distanceScore: m.distanceScore,
          urgencyScore: m.urgencyScore,
          needScore: m.needScore,
          compatibilityScore: m.compatibilityScore,
          reliabilityScore: m.reliabilityScore,
          distance: m.distanceKm,
          explanation: JSON.stringify(m.explanation),
          status: "PENDING",
        })),
      });

      await prisma.donation.update({
        where: { id },
        data: { status: "MATCHED" },
      });
    }

    return NextResponse.json({ matches: top3, count: top3.length });
  } catch (error) {
    console.error("Matching error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
