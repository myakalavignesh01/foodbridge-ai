export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// One-time seed endpoint — protected by a secret token
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (token !== (process.env.SEED_TOKEN || "foodbridge-seed-2024")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if already seeded
    const existing = await prisma.user.findFirst({ where: { email: "admin@demo.com" } });
    if (existing) {
      return NextResponse.json({ message: "Already seeded", users: 5 });
    }

    const password = await bcrypt.hash("demo1234", 12);

    // Organizations
    const greenBowl = await prisma.organization.create({ data: { name: "Green Bowl Restaurant", type: "RESTAURANT", address: "MG Road, Bengaluru, Karnataka 560001", latitude: 12.9716, longitude: 77.5946, verificationStatus: "VERIFIED", contact: "+91 98765 43210" } });
    const grandHotel = await prisma.organization.create({ data: { name: "Hotel Grand Palace", type: "HOTEL", address: "Koramangala, Bengaluru, Karnataka 560034", latitude: 12.9352, longitude: 77.6245, verificationStatus: "TRUSTED" } });
    const hopeKitchen = await prisma.organization.create({ data: { name: "Hope Community Kitchen", type: "COMMUNITY_KITCHEN", address: "Indiranagar, Bengaluru, Karnataka 560038", latitude: 12.9784, longitude: 77.6408, verificationStatus: "VERIFIED", capacity: 200, beneficiaries: 180, dailyMealRequirement: 200, currentFoodStock: 40, preferredCategories: JSON.stringify(["COOKED_MEALS", "PRODUCE"]) } });
    const cityFoodBank = await prisma.organization.create({ data: { name: "City Food Bank", type: "FOOD_BANK", address: "Jayanagar, Bengaluru, Karnataka 560011", latitude: 12.9256, longitude: 77.5829, verificationStatus: "TRUSTED", capacity: 500, beneficiaries: 400, dailyMealRequirement: 350, currentFoodStock: 80 } });
    const sunriseShelter = await prisma.organization.create({ data: { name: "Sunrise Shelter", type: "SHELTER", address: "Rajajinagar, Bengaluru, Karnataka 560010", latitude: 12.9905, longitude: 77.5556, verificationStatus: "VERIFIED", capacity: 120, beneficiaries: 100, dailyMealRequirement: 100, currentFoodStock: 20 } });

    // Users
    const adminUser = await prisma.user.create({ data: { name: "Admin User", email: "admin@demo.com", password, role: "ADMIN", verificationStatus: "VERIFIED" } });
    const donorUser = await prisma.user.create({ data: { name: "Rahul Verma", email: "donor@demo.com", password, role: "DONOR", verificationStatus: "VERIFIED", organizationId: greenBowl.id, phone: "+91 98765 43210" } });
    const donorUser2 = await prisma.user.create({ data: { name: "Kavya Singh", email: "donor2@demo.com", password, role: "DONOR", verificationStatus: "VERIFIED", organizationId: grandHotel.id } });
    const ngoUser = await prisma.user.create({ data: { name: "Meera Sharma", email: "ngo@demo.com", password, role: "RECIPIENT", verificationStatus: "VERIFIED", organizationId: hopeKitchen.id } });
    const volunteerUser = await prisma.user.create({ data: { name: "Arjun Patel", email: "volunteer@demo.com", password, role: "VOLUNTEER", verificationStatus: "VERIFIED" } });

    const now = new Date();

    // Completed donation with impact
    const d1 = await prisma.donation.create({ data: { donorId: donorUser.id, foodName: "Vegetable Biryani", category: "COOKED_MEALS", quantity: 15, unit: "kg", servings: 120, dietaryType: "VEGETARIAN", allergens: "[]", preparedAt: new Date(now.getTime() - 3*3600000), availableFrom: new Date(now.getTime() - 2*3600000), consumeBefore: new Date(now.getTime() + 2*3600000), storageCondition: "Hot holding", pickupAddress: "Green Bowl Restaurant, MG Road, Bengaluru", pickupLat: 12.9716, pickupLng: 77.5946, contactPerson: "Rahul Verma", contactPhone: "+91 98765 43210", packagingCondition: "INTACT", status: "COMPLETED", urgency: "MEDIUM", safetyStatus: "LOW_RISK", aiSummary: "15 kg Vegetable Biryani, 120 servings. Safety: LOW RISK." } });
    await prisma.match.create({ data: { donationId: d1.id, recipientId: hopeKitchen.id, matchScore: 94, distanceScore: 85, urgencyScore: 80, needScore: 90, compatibilityScore: 100, reliabilityScore: 80, distance: 2.4, explanation: JSON.stringify(["2.4 km distance", "Needs 150 meals", "Vegetarian compatible", "Verified organization"]), status: "ACCEPTED" } });
    await prisma.delivery.create({ data: { donationId: d1.id, volunteerId: volunteerUser.id, pickupTime: new Date(now.getTime() - 90*60000), deliveryTime: new Date(now.getTime() - 60*60000), status: "DELIVERED" } });
    await prisma.impact.create({ data: { donationId: d1.id, meals: 120, foodWeight: 15, peopleReached: 96, co2Saved: 37.5 } });

    // Available donation
    await prisma.donation.create({ data: { donorId: donorUser2.id, foodName: "Assorted Dinner Rolls", category: "BAKERY", quantity: 8, unit: "kg", servings: 80, dietaryType: "VEGETARIAN", allergens: JSON.stringify(["Gluten"]), availableFrom: now, consumeBefore: new Date(now.getTime() + 4*3600000), storageCondition: "Room temperature", pickupAddress: "Hotel Grand Palace, Koramangala, Bengaluru", pickupLat: 12.9352, pickupLng: 77.6245, contactPerson: "Chef Rajan", contactPhone: "+91 98765 11111", packagingCondition: "INTACT", status: "AVAILABLE", urgency: "MEDIUM", safetyStatus: "LOW_RISK" } });

    // High urgency donation
    await prisma.donation.create({ data: { donorId: donorUser.id, foodName: "Paneer Butter Masala + Naan", category: "COOKED_MEALS", quantity: 12, unit: "portions", servings: 50, dietaryType: "VEGETARIAN", allergens: JSON.stringify(["Dairy", "Gluten"]), availableFrom: now, consumeBefore: new Date(now.getTime() + 1.5*3600000), storageCondition: "Hot holding", pickupAddress: "Green Bowl Restaurant, MG Road, Bengaluru", pickupLat: 12.9716, pickupLng: 77.5946, contactPerson: "Rahul Verma", contactPhone: "+91 98765 43210", packagingCondition: "INTACT", status: "AVAILABLE", urgency: "HIGH", safetyStatus: "REVIEW_REQUIRED" } });

    // Notifications
    await prisma.notification.createMany({ data: [
      { userId: donorUser.id, type: "WELCOME", title: "Welcome to FoodBridge AI!", message: "Welcome Rahul! Start donating surplus food today.", readStatus: true },
      { userId: donorUser.id, type: "DELIVERY_COMPLETED", title: "Delivery Completed!", message: "120 meals from your Vegetable Biryani donation reached Hope Community Kitchen!", readStatus: false, link: `/dashboard/donations/${d1.id}` },
      { userId: ngoUser.id, type: "WELCOME", title: "Welcome to FoodBridge AI!", message: "Welcome Meera! You'll receive AI-matched donations.", readStatus: true },
      { userId: ngoUser.id, type: "MATCH_FOUND", title: "New Donation Match!", message: "FoodBridge AI found a 94% match — 120 meals of Vegetable Biryani 2.4 km away.", readStatus: false },
      { userId: volunteerUser.id, type: "WELCOME", title: "Welcome, Arjun!", message: "Browse nearby pickups on your dashboard.", readStatus: true },
      { userId: adminUser.id, type: "SYSTEM", title: "Platform Ready", message: "FoodBridge AI is live. 3 donations, 360 meals redistributed.", readStatus: false },
    ]});

    return NextResponse.json({ message: "Seeded successfully!", accounts: { admin: "admin@demo.com", donor: "donor@demo.com", ngo: "ngo@demo.com", volunteer: "volunteer@demo.com", password: "demo1234" } });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
