"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, CheckCircle, MapPin, Clock } from "lucide-react";
import { urgencyColor, timeUntil, statusColor } from "@/lib/utils";

export default function PickupDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [donation, setDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const r = await fetch(`/api/donations/${id}`);
    const d = await r.json();
    setDonation(d);
    setLoading(false);
  }
  useEffect(() => { load(); }, [id]);

  async function doAction(action: string) {
    setActionLoading(true);
    const r = await fetch(`/api/donations/${id}/delivery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const d = await r.json();
    if (r.ok) { setMessage("✅ Status updated!"); await load(); }
    else setMessage(`❌ ${d.error}`);
    setActionLoading(false);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;
  if (!donation) return <div className="text-center py-20 text-gray-500">Not found.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/pickups" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{donation.foodName}</h1>
          <p className="text-sm text-gray-400">Pickup #{id.slice(0, 8).toUpperCase()}</p>
        </div>
        <span className={`ml-auto badge ${urgencyColor(donation.urgency)}`}>{donation.urgency}</span>
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${message.startsWith("✅") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>{message}</div>
      )}

      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Pickup Location</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-emerald-600 mt-0.5" /><span className="text-gray-700">{donation.pickupAddress}</span></div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /><span className="text-orange-600 font-medium">{timeUntil(donation.consumeBefore)}</span></div>
          {donation.contactPerson && <div><span className="text-gray-400">Contact: </span><span className="font-medium">{donation.contactPerson} — {donation.contactPhone}</span></div>}
          {donation.accessInstructions && <div className="bg-gray-50 p-2 rounded-lg text-gray-600">{donation.accessInstructions}</div>}
        </div>
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Food Details</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Quantity", `${donation.quantity} ${donation.unit}`],
            ["Servings", donation.servings],
            ["Dietary", donation.dietaryType],
            ["Status", donation.status?.replace(/_/g, " ")],
          ].map(([k, v]) => (
            <div key={k}><span className="text-gray-400 block">{k}</span><span className="font-medium text-gray-900">{v}</span></div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {donation.status === "AVAILABLE" && (
          <button onClick={() => doAction("ACCEPT_PICKUP")} disabled={actionLoading} className="btn-primary disabled:opacity-60">
            <Truck className="w-4 h-4" /> Accept Pickup
          </button>
        )}
        {donation.status === "PICKUP_ASSIGNED" && (
          <button onClick={() => doAction("CONFIRM_PICKUP")} disabled={actionLoading} className="btn-primary disabled:opacity-60">
            <CheckCircle className="w-4 h-4" /> Confirm Food Collected
          </button>
        )}
        {donation.status === "IN_TRANSIT" && (
          <button onClick={() => doAction("CONFIRM_DELIVERY")} disabled={actionLoading} className="btn-accent disabled:opacity-60">
            <CheckCircle className="w-4 h-4" /> Confirm Food Delivered
          </button>
        )}
      </div>
    </div>
  );
}
