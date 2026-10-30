"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, MapPin, Users, Zap, AlertTriangle, Truck } from "lucide-react";
import { urgencyColor, statusColor, safetyColor, formatDateTime, timeUntil } from "@/lib/utils";

const STATUS_STEPS = [
  "AVAILABLE", "MATCHING", "MATCHED", "PICKUP_ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "COMPLETED"
];

export default function DonationDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [donation, setDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    const r = await fetch(`/api/donations/${id}`);
    const d = await r.json();
    setDonation(d);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function runMatch() {
    setMatching(true);
    await fetch(`/api/donations/${id}/match`, { method: "POST" });
    await load();
    setMatching(false);
  }

  async function cancelDonation() {
    if (!confirm("Cancel this donation?")) return;
    await fetch(`/api/donations/${id}`, { method: "DELETE" });
    router.push("/dashboard/donations");
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading donation…</div>;
  if (!donation || donation.error) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Donation not found.</p>
      <Link href="/dashboard/donations" className="btn-primary mt-4 inline-flex">Back to Donations</Link>
    </div>
  );

  const currentStep = STATUS_STEPS.indexOf(donation.status);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/donations" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{donation.foodName}</h1>
          <p className="text-sm text-gray-400">Donation #{id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`badge ${urgencyColor(donation.urgency)}`}>{donation.urgency}</span>
          <span className={`badge ${statusColor(donation.status)}`}>{donation.status.replace(/_/g, " ")}</span>
        </div>
      </div>

      {/* Status timeline */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Donation Status</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STATUS_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 shrink-0">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < currentStep ? "bg-emerald-600 text-white" : i === currentStep ? "bg-emerald-600 text-white ring-4 ring-emerald-100" : "bg-gray-200 text-gray-400"}`}>
                  {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs text-gray-400 mt-1 text-center w-16">{s.replace(/_/g, " ")}</span>
              </div>
              {i < STATUS_STEPS.length - 1 && <div className={`w-6 h-0.5 mb-4 ${i < currentStep ? "bg-emerald-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Food details */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">Food Details</h2>
          <div className="space-y-2 text-sm">
            {[
              ["Category", donation.category?.replace(/_/g, " ")],
              ["Quantity", `${donation.quantity} ${donation.unit}`],
              ["Servings", donation.servings],
              ["Dietary", donation.dietaryType],
              ["Storage", donation.storageCondition || "Not specified"],
              ["Expires", timeUntil(donation.consumeBefore)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-400">{k}</span>
                <span className="font-medium text-gray-900">{v}</span>
              </div>
            ))}
            {donation.safetyStatus && (
              <div className={`p-2 rounded-lg border text-xs font-medium ${safetyColor(donation.safetyStatus)}`}>
                🛡️ Safety: {donation.safetyStatus.replace(/_/g, " ")}
              </div>
            )}
          </div>
        </div>

        {/* Pickup details */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">Pickup Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="text-gray-700">{donation.pickupAddress}</span>
            </div>
            {donation.contactPerson && <div className="flex justify-between"><span className="text-gray-400">Contact</span><span className="font-medium">{donation.contactPerson}</span></div>}
            {donation.contactPhone && <div className="flex justify-between"><span className="text-gray-400">Phone</span><span className="font-medium">{donation.contactPhone}</span></div>}
            {donation.accessInstructions && <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">{donation.accessInstructions}</div>}
          </div>
          {donation.delivery?.volunteer && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-emerald-700">Volunteer: {donation.delivery.volunteer.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Matches */}
      {donation.matches?.length > 0 && (
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">AI Recommended Recipients</h2>
          </div>
          <div className="space-y-3">
            {donation.matches.map((m: any, i: number) => (
              <div key={m.id} className={`p-3 rounded-xl border ${i === 0 ? "border-emerald-300 bg-emerald-50" : "border-gray-200"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {m.recipient?.name}
                      {i === 0 && <span className="badge bg-emerald-600 text-white text-xs">Best Match</span>}
                    </div>
                    <div className="text-sm text-gray-500">{m.recipient?.type?.replace(/_/g, " ")} · {m.distance?.toFixed(1)} km away</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-700">{m.matchScore}</div>
                    <div className="text-xs text-gray-400">/ 100</div>
                  </div>
                </div>
                {m.explanation && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(JSON.parse(m.explanation) as string[]).map((e: string) => (
                      <span key={e} className="text-xs bg-white border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {e}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 text-xs text-gray-400 border-t border-gray-100 pt-2">
                  <span className="font-medium text-gray-600">How this score was calculated: </span>
                  Distance {m.distanceScore}% · Need {m.needScore}% · Urgency {m.urgencyScore}% · Compatibility {m.compatibilityScore}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {["AVAILABLE", "DRAFT"].includes(donation.status) && (
          <button onClick={runMatch} disabled={matching} className="btn-primary disabled:opacity-60">
            {matching ? "Running AI Match…" : "🤖 Run AI Match"}
          </button>
        )}
        {["AVAILABLE", "DRAFT"].includes(donation.status) && (
          <button onClick={cancelDonation} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50">
            Cancel Donation
          </button>
        )}
      </div>
    </div>
  );
}
