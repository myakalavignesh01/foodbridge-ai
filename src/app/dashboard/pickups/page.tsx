"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, Clock, MapPin, ArrowRight } from "lucide-react";
import { urgencyColor, timeUntil } from "@/lib/utils";

export default function PickupsPage() {
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/donations?status=AVAILABLE&limit=20")
      .then(r => r.json())
      .then(d => { setPickups(d.donations || []); setLoading(false); });
  }, []);

  async function acceptPickup(id: string) {
    setAccepting(id);
    const r = await fetch(`/api/donations/${id}/delivery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ACCEPT_PICKUP" }),
    });
    const d = await r.json();
    setMessages(prev => ({ ...prev, [id]: r.ok ? "✅ Pickup accepted!" : `❌ ${d.error}` }));
    setAccepting(null);
    if (r.ok) setPickups(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Available Pickups</h1>
        <p className="text-gray-500 text-sm">Accept a pickup and help deliver food to those who need it</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading pickups…</div>
      ) : pickups.length === 0 ? (
        <div className="card text-center py-16">
          <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No pickups available right now</p>
          <p className="text-gray-400 text-sm">Check back soon — new donations appear throughout the day.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pickups.map((d: any) => (
            <div key={d.id} className="card flex flex-col">
              {messages[d.id] && (
                <div className={`text-sm p-2 rounded-lg mb-3 ${messages[d.id].startsWith("✅") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                  {messages[d.id]}
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{d.foodName}</h3>
                  <p className="text-sm text-gray-500">{d.quantity} {d.unit} · {d.servings} servings</p>
                </div>
                <span className={`badge ${urgencyColor(d.urgency)}`}>{d.urgency}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{d.pickupAddress?.substring(0, 35)}…</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-orange-600 mb-4">
                <Clock className="w-3 h-3" /> {timeUntil(d.consumeBefore)}
              </div>
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => acceptPickup(d.id)}
                  disabled={!!accepting}
                  className="btn-primary text-sm py-2 flex-1 justify-center disabled:opacity-60"
                >
                  {accepting === d.id ? "Accepting…" : "Accept Pickup"}
                </button>
                <Link href={`/dashboard/donations/${d.id}`} className="btn-secondary text-sm py-2 px-3">
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
