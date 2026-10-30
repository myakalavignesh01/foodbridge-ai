"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { statusColor, formatDateTime } from "@/lib/utils";

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch donations that are in active delivery states for this volunteer
    fetch("/api/donations?limit=20")
      .then(r => r.json())
      .then(d => {
        const active = (d.donations || []).filter((don: any) =>
          ["PICKUP_ASSIGNED", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(don.status)
        );
        setDeliveries(active);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
        <p className="text-gray-500 text-sm">Track your accepted pickups and completed deliveries</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading deliveries…</div>
      ) : deliveries.length === 0 ? (
        <div className="card text-center py-16">
          <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No active deliveries</p>
          <p className="text-gray-400 text-sm mb-4">Accept a pickup to get started.</p>
          <Link href="/dashboard/pickups" className="btn-primary text-sm inline-flex">Browse Pickups</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveries.map((d: any) => (
            <div key={d.id} className="card flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                d.status === "COMPLETED" ? "bg-emerald-100" : "bg-orange-100"
              }`}>
                {d.status === "COMPLETED"
                  ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                  : <Truck className="w-5 h-5 text-orange-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{d.foodName}</div>
                <div className="text-sm text-gray-500">{d.quantity} {d.unit} · {d.servings} servings</div>
                <div className="text-xs text-gray-400 mt-0.5">{d.pickupAddress?.substring(0, 50)}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`badge text-xs ${statusColor(d.status)}`}>{d.status.replace(/_/g, " ")}</span>
                <Link href={`/dashboard/pickups/${d.id}`} className="text-emerald-600 hover:text-emerald-700">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
