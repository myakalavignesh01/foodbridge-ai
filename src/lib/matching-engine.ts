// AI Matching Engine - deterministic scoring
// All matching logic is rule-based, AI model is only used for text summaries

export interface DonationInput {
  id: string;
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  servings: number;
  dietaryType: string;
  allergens?: string | null;
  preparedAt?: Date | null;
  availableFrom: Date;
  consumeBefore: Date;
  storageCondition?: string | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  packagingCondition?: string | null;
  currentTemperature?: string | null;
}

export interface RecipientInput {
  id: string;
  name: string;
  type: string;
  latitude?: number | null;
  longitude?: number | null;
  capacity?: number | null;
  verificationStatus: string;
  beneficiaries?: number | null;
  dailyMealRequirement?: number | null;
  currentFoodStock?: number | null;
  preferredCategories?: string | null;
}

export interface MatchWeights {
  distance: number;
  urgency: number;
  need: number;
  compatibility: number;
  capacity: number;
  reliability: number;
  pickup: number;
}

export const DEFAULT_WEIGHTS: MatchWeights = {
  distance: 25,
  urgency: 20,
  need: 20,
  compatibility: 15,
  capacity: 10,
  reliability: 5,
  pickup: 5,
};

export function calculateUrgency(consumeBefore: Date): {
  level: string;
  hoursLeft: number;
  score: number;
} {
  const now = new Date();
  const hoursLeft = (consumeBefore.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursLeft <= 0) return { level: "EXPIRED", hoursLeft: 0, score: 0 };
  if (hoursLeft <= 1) return { level: "CRITICAL", hoursLeft, score: 100 };
  if (hoursLeft <= 3) return { level: "HIGH", hoursLeft, score: 80 };
  if (hoursLeft <= 6) return { level: "MEDIUM", hoursLeft, score: 50 };
  return { level: "LOW", hoursLeft, score: 20 };
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function distanceScore(distanceKm: number): number {
  if (distanceKm <= 1) return 100;
  if (distanceKm <= 3) return 85;
  if (distanceKm <= 5) return 70;
  if (distanceKm <= 10) return 50;
  if (distanceKm <= 20) return 30;
  return 10;
}

function needScore(recipient: RecipientInput, servings: number): number {
  const required = recipient.dailyMealRequirement || 0;
  const stock = recipient.currentFoodStock || 0;
  const shortage = Math.max(0, required - stock);

  if (shortage === 0) return 20;
  const fulfillRatio = Math.min(servings / shortage, 1);
  return Math.round(40 + fulfillRatio * 60);
}

function compatibilityScore(donation: DonationInput, recipient: RecipientInput): number {
  const preferred = recipient.preferredCategories
    ? (JSON.parse(recipient.preferredCategories) as string[])
    : [];

  let score = 60;
  if (preferred.length === 0 || preferred.includes(donation.category)) {
    score += 40;
  }
  return score;
}

function capacityScore(recipient: RecipientInput, servings: number): number {
  const cap = recipient.capacity || 999;
  if (servings <= cap) return 100;
  if (servings <= cap * 1.2) return 70;
  return 40;
}

function verificationScore(status: string): number {
  if (status === "TRUSTED") return 100;
  if (status === "VERIFIED") return 80;
  return 30;
}

export interface MatchResult {
  recipientId: string;
  recipientName: string;
  totalScore: number;
  distanceKm: number;
  distanceScore: number;
  urgencyScore: number;
  needScore: number;
  compatibilityScore: number;
  capacityScore: number;
  reliabilityScore: number;
  explanation: string[];
}

export function scoreRecipient(
  donation: DonationInput,
  recipient: RecipientInput,
  weights: MatchWeights = DEFAULT_WEIGHTS
): MatchResult {
  const urgency = calculateUrgency(donation.consumeBefore);

  let distKm = 5; // default if no coords
  if (
    donation.pickupLat &&
    donation.pickupLng &&
    recipient.latitude &&
    recipient.longitude
  ) {
    distKm = haversineDistance(
      donation.pickupLat,
      donation.pickupLng,
      recipient.latitude,
      recipient.longitude
    );
  }

  const dScore = distanceScore(distKm);
  const uScore = urgency.score;
  const nScore = needScore(recipient, donation.servings);
  const cScore = compatibilityScore(donation, recipient);
  const capScore = capacityScore(recipient, donation.servings);
  const rScore = verificationScore(recipient.verificationStatus);
  const pScore = 80; // default pickup availability

  const total =
    (dScore * weights.distance +
      uScore * weights.urgency +
      nScore * weights.need +
      cScore * weights.compatibility +
      capScore * weights.capacity +
      rScore * weights.reliability +
      pScore * weights.pickup) /
    100;

  const explanation: string[] = [];
  if (distKm <= 5) explanation.push(`${distKm.toFixed(1)} km distance`);
  if (uScore >= 80) explanation.push("High urgency match");
  if (nScore >= 70) explanation.push(`Recipient needs ${recipient.dailyMealRequirement} meals`);
  if (cScore >= 90) explanation.push("Food category compatible");
  if (capScore >= 80) explanation.push("Within recipient capacity");
  if (rScore >= 80) explanation.push("Verified organization");

  return {
    recipientId: recipient.id,
    recipientName: recipient.name,
    totalScore: Math.min(Math.round(total), 100),
    distanceKm: Math.round(distKm * 10) / 10,
    distanceScore: dScore,
    urgencyScore: uScore,
    needScore: nScore,
    compatibilityScore: cScore,
    capacityScore: capScore,
    reliabilityScore: rScore,
    explanation,
  };
}

export function rankRecipients(
  donation: DonationInput,
  recipients: RecipientInput[],
  weights?: MatchWeights
): MatchResult[] {
  return recipients
    .filter((r) => r.verificationStatus !== "UNVERIFIED")
    .map((r) => scoreRecipient(donation, r, weights))
    .sort((a, b) => b.totalScore - a.totalScore);
}
