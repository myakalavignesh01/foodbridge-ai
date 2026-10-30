"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, MapPin, Clock, Users, ShieldCheck } from "lucide-react";
import { urgencyColor, safetyColor, timeUntil } from "@/lib/utils";

export default function AvailableDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [donation, setDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/donations/${id}`).then(r => r.json()).then(d => { setDonation(d); setLoading(false); });
  }, [id]);

  async function acceptDonation() {
    setAccepting(true);
    const r = await fetch(`/api/donations/${id}/accept`, { method: "POST" });
    const d = await r.json();
    if (r.ok) {
      setMessage("✅ Donation accepted! A volunteer will be assigned.");
      setTimeout(() => router.push("/dashboard"), 2000);
    } else {
      setMessage(`❌ ${d.error}`);
    }
    setAccepting(false);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;
  if (!donation || donation.error) return <div className="text-center py-20 text-gray-500">Not found.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/available" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{donation.foodName}</h1>
          <p className="text-sm text-gray-400">Donation #{id.slice(0, 8).toUpperCase()}</p>
        </div>
        <span className={`ml-auto badge ${urgencyColor(donation.urgency)}`}>{donation.urgency}</span>
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${message.startsWith("✅") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message}
        </div>
      )}

      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Food Information</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Food Name", donation.foodName],
            ["Category", donation.category?.replace(/_/g, " ")],
            ["Quantity", `${donation.quantity} ${donation.unit}`],
            ["Servings", donation.servings],
            ["Dietary Type", donation.dietaryType],
            ["Storage", donation.storageCondition || "Not specified"],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="text-gray-400 block">{k}</span>
              <span className="font-medium text-gray-900">{v}</span>
            </div>
          ))}
        </div>
        {donation.safetyStatus && (
          <div className={`mt-3 p-2 rounded-lg border text-sm font-medium ${safetyColor(donation.safetyStatus)}`}>
            🛡️ Safety Status: {donation.safetyStatus.replace(/_/g, " ")}
          </div>
        )}
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Pickup Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <span className="text-gray-700">{donation.pickupAddress}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-orange-600 font-medium">{timeUntil(donation.consumeBefore)}</span>
          </div>
          {donation.contactPhone && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Contact:</span>
              <span className="font-medium">{donation.contactPerson} — {donation.contactPhone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 mb-6">
        <ShieldCheck className="w-4 h-4 inline mr-1.5" />
        <strong>Safety Reminder:</strong> AI assessments are decision-support only. Your organization is responsible for verifying food safety before redistribution.
      </div>

      <button
        onClick={acceptDonation}
        disabled={accepting || donation.status !== "AVAILABLE"}
        className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60"
      >
        {accepting ? "Accepting…" : donation.status !== "AVAILABLE" ? "Already Accepted" : "✅ Accept This Donation"}
      </button>
    </div>
  );
}
