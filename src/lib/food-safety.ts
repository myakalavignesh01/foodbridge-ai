// Food Safety Engine - deterministic assessment only

export interface SafetyInput {
  foodName: string;
  category: string;
  preparedAt?: Date | null;
  consumeBefore: Date;
  storageCondition?: string | null;
  packagingCondition?: string | null;
  currentTemperature?: string | null;
  allergens?: string | null;
}

export type SafetyStatus =
  | "LOW_RISK"
  | "REVIEW_REQUIRED"
  | "HIGH_RISK"
  | "DO_NOT_REDISTRIBUTE";

export interface SafetyAssessment {
  status: SafetyStatus;
  riskScore: number; // 0-100 (higher = more risky)
  flags: string[];
  recommendations: string[];
  checklist: { item: string; passed: boolean }[];
}

export function assessFoodSafety(input: SafetyInput): SafetyAssessment {
  const now = new Date();
  const flags: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;

  // Time checks
  const hoursUntilExpiry =
    (input.consumeBefore.getTime() - now.getTime()) / (1000 * 60 * 60);
  const hoursOld = input.preparedAt
    ? (now.getTime() - input.preparedAt.getTime()) / (1000 * 60 * 60)
    : null;

  if (hoursUntilExpiry < 0) {
    flags.push("Food has expired");
    riskScore += 100;
  } else if (hoursUntilExpiry < 1) {
    flags.push("Less than 1 hour until expiry");
    riskScore += 40;
  } else if (hoursUntilExpiry < 2) {
    flags.push("Less than 2 hours until expiry");
    riskScore += 20;
  }

  if (hoursOld !== null) {
    if (hoursOld > 12) {
      flags.push("Food was prepared more than 12 hours ago");
      riskScore += 30;
    } else if (hoursOld > 6) {
      flags.push("Food was prepared more than 6 hours ago");
      riskScore += 15;
    }
  }

  // Category risk
  const highRiskCategories = ["DAIRY", "COOKED_MEALS"];
  if (highRiskCategories.includes(input.category)) {
    riskScore += 10;
    recommendations.push("Ensure proper cold-chain maintained for " + input.category.toLowerCase());
  }

  // Temperature check
  if (input.currentTemperature) {
    const temp = input.currentTemperature.toLowerCase();
    if (temp.includes("warm") || temp.includes("hot")) {
      flags.push("Food may not be at safe storage temperature");
      riskScore += 15;
      recommendations.push("Ensure hot food stays above 60°C or cool below 5°C before transport");
    }
  }

  // Storage check
  if (!input.storageCondition || input.storageCondition.trim() === "") {
    flags.push("Storage condition not specified");
    riskScore += 10;
    recommendations.push("Specify storage conditions to improve safety assessment");
  }

  // Packaging
  const badPackaging = ["damaged", "open", "torn", "broken"];
  if (
    input.packagingCondition &&
    badPackaging.some((b) => input.packagingCondition!.toLowerCase().includes(b))
  ) {
    flags.push("Packaging may be compromised");
    riskScore += 25;
    recommendations.push("Do not redistribute food with damaged packaging");
  }

  // Allergen disclosure
  const allergenStr = Array.isArray(input.allergens)
    ? JSON.stringify(input.allergens)
    : (input.allergens || "");
  if (!allergenStr || allergenStr === "[]" || allergenStr.trim() === "") {
    recommendations.push("Confirm allergen information before redistribution");
  }

  // Build checklist
  const checklist = [
    {
      item: "Food is within consume-before time",
      passed: hoursUntilExpiry > 0,
    },
    {
      item: "Prepared within 12 hours",
      passed: hoursOld === null || hoursOld <= 12,
    },
    {
      item: "Storage condition specified",
      passed: !!input.storageCondition && input.storageCondition.trim() !== "",
    },
    {
      item: "Packaging intact",
      passed:
        !input.packagingCondition ||
        !badPackaging.some((b) =>
          input.packagingCondition!.toLowerCase().includes(b)
        ),
    },
    {
      item: "Allergen information provided",
      passed:
        !!input.allergens &&
        input.allergens !== "[]" &&
        input.allergens.trim() !== "",
    },
  ];

  // Determine status
  let status: SafetyStatus;
  if (riskScore >= 80 || hoursUntilExpiry < 0) {
    status = "DO_NOT_REDISTRIBUTE";
  } else if (riskScore >= 50) {
    status = "HIGH_RISK";
  } else if (riskScore >= 20 || flags.length > 1) {
    status = "REVIEW_REQUIRED";
  } else {
    status = "LOW_RISK";
  }

  if (recommendations.length === 0) {
    recommendations.push("Food appears safe for redistribution. Verify all details before handover.");
  }

  return {
    status,
    riskScore: Math.min(riskScore, 100),
    flags,
    recommendations,
    checklist,
  };
}

export function generateFoodSummary(
  foodName: string,
  quantity: number,
  unit: string,
  servings: number,
  category: string,
  urgencyLevel: string
): string {
  const urgencyText =
    urgencyLevel === "CRITICAL"
      ? "Requires immediate collection"
      : urgencyLevel === "HIGH"
      ? "Needs pickup within 1-3 hours"
      : urgencyLevel === "MEDIUM"
      ? "Available for pickup within 3-6 hours"
      : "Available — schedule at convenience";

  return `${quantity} ${unit} of ${foodName} (${category.toLowerCase().replace("_", " ")}) providing approximately ${servings} servings. ${urgencyText}.`;
}
