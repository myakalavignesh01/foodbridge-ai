"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, MapPin, Clock, CheckCircle, ArrowRight, Package } from "lucide-react";
import { urgencyColor, timeUntil } from "@/lib/utils";

export default function VolunteerDashboard() {
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/donations?status=AVAILABLE&limit=8")
      .then(r => r.json())
      .then(d => { setPickups(d.donations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Accept pickups and help deliver food to those who need it</p>
        </div>
        <Link href="/dashboard/pickups" className="btn-primary">
          <Truck className="w-4 h-4" /> View Pickups
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Available Pickups", value: pickups.length, icon: Package, color: "text-emerald-600 bg-emerald-50" },
          { label: "Urgent", value: pickups.filter(d => d.urgency === "CRITICAL" || d.urgency === "HIGH").length, icon: Clock, color: "text-orange-600 bg-orange-50" },
          { label: "My Deliveries", value: 0, icon: Truck, color: "text-blue-600 bg-blue-50" },
          { label: "Completed", value: 0, icon: CheckCircle, color: "text-purple-600 bg-purple-50" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs font-medium">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Available Near You</h2>
          <Link href="/dashboard/pickups" className="text-emerald-600 text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading…</div>
        ) : pickups.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No pickups available</p>
            <p className="text-gray-400 text-sm">Check back soon. New donations appear regularly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pickups.map((d: any) => (
              <div key={d.id} className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{d.foodName}</div>
                    <div className="text-sm text-gray-500">{d.quantity} {d.unit} · {d.servings} servings</div>
                  </div>
                  <span className={`badge ${urgencyColor(d.urgency)}`}>{d.urgency}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {d.pickupAddress?.substring(0, 30) || "Location TBD"}…</span>
                  <span className="flex items-center gap-1 text-orange-500"><Clock className="w-3 h-3" /> {timeUntil(d.consumeBefore)}</span>
                </div>
                <Link
                  href={`/dashboard/pickups/${d.id}`}
                  className="btn-primary text-sm py-1.5 w-full justify-center"
                >
                  Accept Pickup
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
