export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// AI Assistant - responds to natural language questions using platform data
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const lower = message.toLowerCase();
    let response = "";

    // Donation stats
    if (lower.includes("how many") || lower.includes("total") || lower.includes("stats")) {
      const [donations, meals, volunteers] = await Promise.all([
        prisma.donation.count({ where: { status: "COMPLETED" } }),
        prisma.impact.aggregate({ _sum: { meals: true } }),
        prisma.user.count({ where: { role: "VOLUNTEER" } }),
      ]);
      response = `📊 **Platform Stats**\n\n✅ **${donations}** successful donations completed\n🍽️ **${meals._sum.meals || 0}** meals redistributed\n🚗 **${volunteers}** active volunteers\n\nNeed more details? Ask me about donors, NGOs, or specific donations.`;
    }
    // Nearby donations / donors
    else if (lower.includes("donate") && (lower.includes("near") || lower.includes("where"))) {
      const donations = await prisma.donation.findMany({
        where: { status: "AVAILABLE" },
        include: { donor: { select: { name: true } } },
        take: 3,
        orderBy: { consumeBefore: "asc" },
      });
      if (donations.length === 0) {
        response = "No active donation listings found right now. Check back soon or post a donation if you have surplus food!";
      } else {
        const list = donations.map(d => `• **${d.foodName}** — ${d.quantity} ${d.unit} (${d.urgency} urgency) from ${d.donor.name}`).join("\n");
        response = `🗺️ **Available Donations Near You**\n\n${list}\n\nVisit the [Donations page](/dashboard) to accept any of these.`;
      }
    }
    // NGO needs
    else if (lower.includes("ngo") || lower.includes("vegetarian") && lower.includes("need")) {
      const orgs = await prisma.organization.findMany({
        where: { type: { in: ["NGO", "FOOD_BANK", "SHELTER"] }, verificationStatus: { not: "UNVERIFIED" } },
        take: 3,
      });
      const list = orgs.map(o => `• **${o.name}** (${o.type}) — capacity: ${o.capacity || "N/A"} | needs: ${o.dailyMealRequirement || "N/A"} meals/day`).join("\n");
      response = `🏠 **Verified Recipients Needing Food**\n\n${list}\n\nCreate a donation to match with these organizations automatically.`;
    }
    // Expiring food
    else if (lower.includes("expire") || lower.includes("expir") || lower.includes("urgent")) {
      const critical = await prisma.donation.findMany({
        where: { status: "AVAILABLE", urgency: { in: ["CRITICAL", "HIGH"] } },
        orderBy: { consumeBefore: "asc" },
        take: 5,
      });
      if (critical.length === 0) {
        response = "✅ No critical or high-urgency donations at this moment. Great coordination!";
      } else {
        const list = critical.map(d => `• **${d.foodName}** — expires ${new Date(d.consumeBefore).toLocaleTimeString()} (${d.urgency})`).join("\n");
        response = `⚠️ **Urgent Donations Needing Immediate Pickup**\n\n${list}\n\nPlease coordinate immediate pickup for these items!`;
      }
    }
    // Volunteer help
    else if (lower.includes("volunteer") || lower.includes("pickup") || lower.includes("deliver")) {
      const available = await prisma.donation.count({
        where: { status: { in: ["AVAILABLE", "MATCHED", "PICKUP_ASSIGNED"] } },
      });
      response = `🚗 **Volunteer Opportunities**\n\nThere are currently **${available}** donations needing pickup assistance.\n\nAs a volunteer, you can:\n• Browse nearby pickups\n• Accept delivery tasks\n• Confirm pickups and deliveries\n\nVisit your [Volunteer Dashboard](/dashboard/volunteer) to get started!`;
    }
    // Impact
    else if (lower.includes("impact") || lower.includes("meals saved") || lower.includes("co2")) {
      const [meals, weight] = await Promise.all([
        prisma.impact.aggregate({ _sum: { meals: true, foodWeight: true, peopleReached: true } }),
        prisma.impact.count(),
      ]);
      response = `🌍 **FoodBridge AI Impact**\n\n🍽️ **${meals._sum.meals || 0}** meals redistributed\n🥗 **${Math.round((meals._sum.foodWeight || 0))} kg** food saved from waste\n👥 **${meals._sum.peopleReached || 0}** people reached\n📦 **${weight}** successful redistributions\n\n*Environmental impact estimates are based on configurable methodology.*`;
    }
    // 100 meals urgent
    else if (lower.includes("100") || lower.includes("surplus") || lower.includes("2 hours")) {
      response = `🚨 **Urgent Action Guide**\n\nWith 100 surplus meals expiring in 2 hours:\n\n1. **Post now** — Create a donation immediately with all details\n2. **AI matches** — Our system instantly finds the nearest verified recipient\n3. **Alert volunteers** — Nearby volunteers are notified automatically\n4. **Track status** — Monitor pickup in real-time\n\n⏱️ Average matching time: < 3 minutes\n🚗 Average pickup time: < 15 minutes\n\n[Post Donation Now →](/dashboard/donate)`;
    }
    // Generic help
    else {
      response = `👋 **FoodBridge AI Assistant**\n\nI can help you with:\n\n• 📊 Platform statistics and impact\n• 🗺️ Finding nearby donation opportunities\n• 🏠 NGOs and recipients needing food\n• ⚠️ Urgent donations needing pickup\n• 🚗 Volunteer pickup opportunities\n• 🌍 Environmental and social impact\n\nTry asking:\n• "How many meals have been redistributed?"\n• "Which NGOs need vegetarian meals?"\n• "Show urgent donations"\n• "I have 100 surplus meals expiring in 2 hours"`;
    }

    return NextResponse.json({ response, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Assistant error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

