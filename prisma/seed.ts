import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding FoodBridge AI demo data...");

  // Clear existing data
  await prisma.impact.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.match.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const password = await bcrypt.hash("demo1234", 12);

  // Create organizations
  const greenBowl = await prisma.organization.create({
    data: {
      name: "Green Bowl Restaurant",
      type: "RESTAURANT",
      address: "MG Road, Bengaluru, Karnataka 560001",
      latitude: 12.9716,
      longitude: 77.5946,
      verificationStatus: "VERIFIED",
      contact: "+91 98765 43210",
      description: "Award-winning vegetarian restaurant committed to zero waste.",
    },
  });

  const grandHotel = await prisma.organization.create({
    data: {
      name: "Hotel Grand Palace",
      type: "HOTEL",
      address: "Koramangala, Bengaluru, Karnataka 560034",
      latitude: 12.9352,
      longitude: 77.6245,
      verificationStatus: "TRUSTED",
      contact: "+91 98765 11111",
    },
  });

  const techCorp = await prisma.organization.create({
    data: {
      name: "TechCorp Cafeteria",
      type: "CORPORATE",
      address: "Electronic City, Bengaluru 560100",
      latitude: 12.8392,
      longitude: 77.6774,
      verificationStatus: "VERIFIED",
      contact: "+91 98765 55555",
    },
  });

  const hopeKitchen = await prisma.organization.create({
    data: {
      name: "Hope Community Kitchen",
      type: "COMMUNITY_KITCHEN",
      address: "Indiranagar, Bengaluru, Karnataka 560038",
      latitude: 12.9784,
      longitude: 77.6408,
      verificationStatus: "VERIFIED",
      capacity: 200,
      beneficiaries: 180,
      dailyMealRequirement: 200,
      currentFoodStock: 40,
      preferredCategories: JSON.stringify(["COOKED_MEALS", "PRODUCE"]),
      contact: "+91 99887 22222",
      description: "Serving nutritious meals to underprivileged communities since 2015.",
    },
  });

  const cityFoodBank = await prisma.organization.create({
    data: {
      name: "City Food Bank",
      type: "FOOD_BANK",
      address: "Jayanagar, Bengaluru, Karnataka 560011",
      latitude: 12.9256,
      longitude: 77.5829,
      verificationStatus: "TRUSTED",
      capacity: 500,
      beneficiaries: 400,
      dailyMealRequirement: 350,
      currentFoodStock: 80,
      preferredCategories: JSON.stringify(["PACKAGED", "PRODUCE", "COOKED_MEALS"]),
      contact: "+91 99887 33333",
    },
  });

  const sunriseShelter = await prisma.organization.create({
    data: {
      name: "Sunrise Shelter",
      type: "SHELTER",
      address: "Rajajinagar, Bengaluru, Karnataka 560010",
      latitude: 12.9905,
      longitude: 77.5556,
      verificationStatus: "VERIFIED",
      capacity: 120,
      beneficiaries: 100,
      dailyMealRequirement: 100,
      currentFoodStock: 20,
      contact: "+91 99887 44444",
    },
  });

  // USERS
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@demo.com",
      password,
      role: "ADMIN",
      verificationStatus: "VERIFIED",
      phone: "+91 99999 00000",
    },
  });

  const donorUser = await prisma.user.create({
    data: {
      name: "Rahul Verma",
      email: "donor@demo.com",
      password,
      role: "DONOR",
      verificationStatus: "VERIFIED",
      organizationId: greenBowl.id,
      phone: "+91 98765 43210",
    },
  });

  const donorUser2 = await prisma.user.create({
    data: {
      name: "Kavya Singh",
      email: "donor2@demo.com",
      password,
      role: "DONOR",
      verificationStatus: "VERIFIED",
      organizationId: grandHotel.id,
      phone: "+91 98765 11111",
    },
  });

  const ngoUser = await prisma.user.create({
    data: {
      name: "Meera Sharma",
      email: "ngo@demo.com",
      password,
      role: "RECIPIENT",
      verificationStatus: "VERIFIED",
      organizationId: hopeKitchen.id,
      phone: "+91 99887 22222",
    },
  });

  const volunteerUser = await prisma.user.create({
    data: {
      name: "Arjun Patel",
      email: "volunteer@demo.com",
      password,
      role: "VOLUNTEER",
      verificationStatus: "VERIFIED",
      phone: "+91 99887 55555",
    },
  });

  const volunteerUser2 = await prisma.user.create({
    data: {
      name: "Priya Nair",
      email: "volunteer2@demo.com",
      password,
      role: "VOLUNTEER",
      verificationStatus: "VERIFIED",
      phone: "+91 99887 66666",
    },
  });

  // DONATIONS
  const now = new Date();

  // 1. Completed donation with full impact chain
  const d1 = await prisma.donation.create({
    data: {
      donorId: donorUser.id,
      foodName: "Vegetable Biryani",
      category: "COOKED_MEALS",
      quantity: 15,
      unit: "kg",
      servings: 120,
      dietaryType: "VEGETARIAN",
      allergens: JSON.stringify([]),
      preparedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      availableFrom: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      consumeBefore: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      storageCondition: "Hot holding",
      pickupAddress: "Green Bowl Restaurant, MG Road, Bengaluru",
      pickupLat: 12.9716,
      pickupLng: 77.5946,
      contactPerson: "Rahul Verma",
      contactPhone: "+91 98765 43210",
      packagingCondition: "INTACT",
      status: "COMPLETED",
      urgency: "MEDIUM",
      safetyStatus: "LOW_RISK",
      aiSummary: "15 kg of Vegetable Biryani providing 120 servings. Needs pickup within 2 hours. Safety: LOW RISK.",
    },
  });

  const match1 = await prisma.match.create({
    data: {
      donationId: d1.id,
      recipientId: hopeKitchen.id,
      matchScore: 94,
      distanceScore: 85,
      urgencyScore: 80,
      needScore: 90,
      compatibilityScore: 100,
      reliabilityScore: 80,
      distance: 2.4,
      explanation: JSON.stringify(["2.4 km distance", "Needs 150 meals", "Vegetarian compatible", "Pickup available", "Verified organization"]),
      status: "ACCEPTED",
    },
  });

  const delivery1 = await prisma.delivery.create({
    data: {
      donationId: d1.id,
      volunteerId: volunteerUser.id,
      pickupTime: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
      deliveryTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      status: "DELIVERED",
    },
  });

  await prisma.impact.create({
    data: {
      donationId: d1.id,
      meals: 120,
      foodWeight: 15,
      peopleReached: 96,
      co2Saved: 37.5,
    },
  });

  // 2. Available donation (active)
  const d2 = await prisma.donation.create({
    data: {
      donorId: donorUser2.id,
      foodName: "Assorted Dinner Rolls & Bread",
      category: "BAKERY",
      quantity: 8,
      unit: "kg",
      servings: 80,
      dietaryType: "VEGETARIAN",
      allergens: JSON.stringify(["Gluten", "Dairy"]),
      preparedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      availableFrom: now,
      consumeBefore: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      storageCondition: "Room temperature",
      pickupAddress: "Hotel Grand Palace, Koramangala, Bengaluru",
      pickupLat: 12.9352,
      pickupLng: 77.6245,
      contactPerson: "Chef Rajan",
      contactPhone: "+91 98765 11111",
      packagingCondition: "INTACT",
      status: "AVAILABLE",
      urgency: "MEDIUM",
      safetyStatus: "LOW_RISK",
      aiSummary: "8 kg of Assorted Bakery. 80 servings. Needs pickup within 4 hours.",
    },
  });

  // 3. HIGH urgency donation
  const d3 = await prisma.donation.create({
    data: {
      donorId: donorUser.id,
      foodName: "Paneer Butter Masala + Naan",
      category: "COOKED_MEALS",
      quantity: 12,
      unit: "portions",
      servings: 50,
      dietaryType: "VEGETARIAN",
      allergens: JSON.stringify(["Dairy", "Gluten"]),
      preparedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      availableFrom: now,
      consumeBefore: new Date(now.getTime() + 1.5 * 60 * 60 * 1000),
      storageCondition: "Hot holding",
      pickupAddress: "Green Bowl Restaurant, MG Road, Bengaluru",
      pickupLat: 12.9716,
      pickupLng: 77.5946,
      contactPerson: "Rahul Verma",
      contactPhone: "+91 98765 43210",
      packagingCondition: "INTACT",
      status: "AVAILABLE",
      urgency: "HIGH",
      safetyStatus: "REVIEW_REQUIRED",
      aiSummary: "50 servings of Paneer Butter Masala. HIGH urgency — 1.5h remaining.",
    },
  });

  // 4. Matched donation
  const d4 = await prisma.donation.create({
    data: {
      donorId: donorUser2.id,
      foodName: "Mixed Fruit Baskets",
      category: "PRODUCE",
      quantity: 25,
      unit: "kg",
      servings: 100,
      dietaryType: "VEGAN",
      allergens: JSON.stringify([]),
      availableFrom: now,
      consumeBefore: new Date(now.getTime() + 18 * 60 * 60 * 1000),
      storageCondition: "Room temperature",
      pickupAddress: "Hotel Grand Palace, Koramangala, Bengaluru",
      pickupLat: 12.9352,
      pickupLng: 77.6245,
      contactPerson: "Manager",
      contactPhone: "+91 98765 11111",
      packagingCondition: "INTACT",
      status: "MATCHED",
      urgency: "LOW",
      safetyStatus: "LOW_RISK",
      aiSummary: "25 kg fresh fruit. 100 servings. Low urgency, 18h available.",
    },
  });

  await prisma.match.create({
    data: {
      donationId: d4.id,
      recipientId: cityFoodBank.id,
      matchScore: 88,
      distance: 3.1,
      distanceScore: 80,
      urgencyScore: 20,
      needScore: 85,
      compatibilityScore: 90,
      reliabilityScore: 100,
      explanation: JSON.stringify(["3.1 km distance", "High capacity available", "Low risk produce", "Trusted partner"]),
      status: "ACCEPTED",
    },
  });

  // 5. Another completed
  const d5 = await prisma.donation.create({
    data: {
      donorId: donorUser.id,
      foodName: "Dal Makhani + Rice",
      category: "COOKED_MEALS",
      quantity: 20,
      unit: "kg",
      servings: 160,
      dietaryType: "VEGETARIAN",
      allergens: JSON.stringify([]),
      preparedAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
      availableFrom: new Date(now.getTime() - 28 * 60 * 60 * 1000),
      consumeBefore: new Date(now.getTime() - 22 * 60 * 60 * 1000),
      storageCondition: "Hot holding",
      pickupAddress: "Green Bowl Restaurant, MG Road, Bengaluru",
      pickupLat: 12.9716,
      pickupLng: 77.5946,
      contactPerson: "Rahul Verma",
      contactPhone: "+91 98765 43210",
      packagingCondition: "INTACT",
      status: "COMPLETED",
      urgency: "HIGH",
      safetyStatus: "LOW_RISK",
    },
  });

  await prisma.match.create({
    data: {
      donationId: d5.id,
      recipientId: sunriseShelter.id,
      matchScore: 91,
      distance: 4.2,
      distanceScore: 75,
      urgencyScore: 80,
      needScore: 95,
      compatibilityScore: 100,
      reliabilityScore: 80,
      explanation: JSON.stringify(["4.2 km distance", "High need", "Verified shelter"]),
      status: "ACCEPTED",
    },
  });

  await prisma.delivery.create({
    data: {
      donationId: d5.id,
      volunteerId: volunteerUser2.id,
      pickupTime: new Date(now.getTime() - 27 * 60 * 60 * 1000),
      deliveryTime: new Date(now.getTime() - 26 * 60 * 60 * 1000),
      status: "DELIVERED",
    },
  });

  await prisma.impact.create({
    data: {
      donationId: d5.id,
      meals: 160,
      foodWeight: 20,
      peopleReached: 128,
      co2Saved: 50,
    },
  });

  // 6. Third completed donation  
  const d6 = await prisma.donation.create({
    data: {
      donorId: donorUser2.id,
      foodName: "Continental Breakfast Buffet",
      category: "COOKED_MEALS",
      quantity: 10,
      unit: "kg",
      servings: 80,
      dietaryType: "VEGETARIAN",
      allergens: JSON.stringify(["Gluten", "Dairy", "Eggs"]),
      preparedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      availableFrom: new Date(now.getTime() - 47 * 60 * 60 * 1000),
      consumeBefore: new Date(now.getTime() - 43 * 60 * 60 * 1000),
      storageCondition: "Hot holding",
      pickupAddress: "Hotel Grand Palace, Koramangala, Bengaluru",
      pickupLat: 12.9352,
      pickupLng: 77.6245,
      contactPerson: "Chef Rajan",
      contactPhone: "+91 98765 11111",
      packagingCondition: "INTACT",
      status: "COMPLETED",
      urgency: "MEDIUM",
      safetyStatus: "LOW_RISK",
    },
  });

  await prisma.impact.create({
    data: {
      donationId: d6.id,
      meals: 80,
      foodWeight: 10,
      peopleReached: 64,
      co2Saved: 25,
    },
  });

  // NOTIFICATIONS
  await prisma.notification.createMany({
    data: [
      { userId: donorUser.id, type: "WELCOME", title: "Welcome to FoodBridge AI!", message: "Welcome Rahul! Your account is ready. Start donating surplus food today.", readStatus: true },
      { userId: donorUser.id, type: "DONATION_CREATED", title: "Donation Posted", message: "Your donation of 15 kg Vegetable Biryani has been posted.", readStatus: true, link: `/dashboard/donations/${d1.id}` },
      { userId: donorUser.id, type: "MATCH_ACCEPTED", title: "Donation Accepted!", message: "Hope Community Kitchen accepted your Vegetable Biryani donation.", readStatus: true },
      { userId: donorUser.id, type: "DELIVERY_COMPLETED", title: "Delivery Completed!", message: "120 meals from your donation have reached Hope Community Kitchen!", readStatus: false, link: `/dashboard/donations/${d1.id}` },
      { userId: ngoUser.id, type: "WELCOME", title: "Welcome to FoodBridge AI!", message: "Welcome Meera! As a verified recipient, you'll receive AI-matched donations.", readStatus: true },
      { userId: ngoUser.id, type: "MATCH_FOUND", title: "New Donation Match!", message: "FoodBridge AI found a 94% match — 120 meals of Vegetable Biryani available 2.4 km away.", readStatus: false },
      { userId: volunteerUser.id, type: "WELCOME", title: "Welcome, Arjun!", message: "Thanks for joining as a volunteer! Browse nearby pickups on your dashboard.", readStatus: true },
      { userId: volunteerUser.id, type: "PICKUP_NEARBY", title: "New Pickup Near You", message: "A donation of 50 meals is available 1.8 km away. Pickup within 2 hours.", readStatus: false },
      { userId: adminUser.id, type: "SYSTEM", title: "Daily Summary", message: "Today: 3 donations posted, 2 completed, 280 meals redistributed.", readStatus: false },
    ],
  });

  console.log("✅ Demo data seeded successfully!");
  console.log("\n📋 Demo Accounts:");
  console.log("  Admin:     admin@demo.com / demo1234");
  console.log("  Donor:     donor@demo.com / demo1234");
  console.log("  Donor 2:   donor2@demo.com / demo1234");
  console.log("  NGO:       ngo@demo.com / demo1234");
  console.log("  Volunteer: volunteer@demo.com / demo1234");
  console.log("\n🏢 Organizations created:");
  console.log("  - Green Bowl Restaurant (Verified Donor)");
  console.log("  - Hotel Grand Palace (Trusted Donor)");
  console.log("  - Hope Community Kitchen (Verified NGO)");
  console.log("  - City Food Bank (Trusted)");
  console.log("  - Sunrise Shelter (Verified)");
  console.log("\n🍽️  Impact: 360 meals redistributed across 3 completed donations");
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
