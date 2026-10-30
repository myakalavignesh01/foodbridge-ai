"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, ArrowRight, AlertCircle } from "lucide-react";
import { urgencyColor, timeUntil } from "@/lib/utils";

export default function AvailableFoodPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/donations?status=AVAILABLE&limit=50")
      .then(r => r.json())
      .then(d => {
        let data = d.donations || [];
        if (filter !== "ALL") data = data.filter((x: any) => x.urgency === filter);
        setDonations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Food</h1>
          <p className="text-gray-500 text-sm">Browse donations matched to your organization</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${filter === f ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200"}`}
          >
            {f === "ALL" ? "All Urgency" : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading available food…</div>
      ) : donations.length === 0 ? (
        <div className="card text-center py-16">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No available food right now</p>
          <p className="text-gray-400 text-sm">New donations appear throughout the day.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {donations.map((d: any) => (
            <div key={d.id} className="card hover:border-emerald-200 transition-colors flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{d.foodName}</h3>
                  <p className="text-sm text-gray-500">{d.quantity} {d.unit} · {d.servings} servings</p>
                </div>
                <span className={`badge ${urgencyColor(d.urgency)}`}>{d.urgency}</span>
              </div>

              <div className="text-sm text-gray-600 mb-2">{d.dietaryType} · {d.category?.replace(/_/g, " ")}</div>

              <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                <span className="flex items-center gap-1 text-orange-500 font-medium">
                  <Clock className="w-3 h-3" /> {timeUntil(d.consumeBefore)}
                </span>
                <span>By {d.donor?.name}</span>
              </div>

              <div className="mt-auto flex gap-2">
                <Link href={`/dashboard/available/${d.id}`} className="btn-primary text-sm py-1.5 flex-1 justify-center">
                  View & Accept
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
