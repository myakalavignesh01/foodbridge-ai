"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, Users, CheckCircle, ArrowRight, AlertCircle } from "lucide-react";
import { urgencyColor, statusColor, timeUntil } from "@/lib/utils";

export default function RecipientDashboard() {
  const [available, setAvailable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/donations?status=AVAILABLE&limit=6")
      .then(r => r.json())
      .then(d => { setAvailable(d.donations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipient Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Browse available food donations and manage requests</p>
        </div>
        <Link href="/dashboard/available" className="btn-primary">
          Browse Food
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Available Now", value: available.length, icon: Package, color: "text-emerald-600 bg-emerald-50" },
          { label: "Matched Today", value: available.filter(d => d.urgency === "HIGH" || d.urgency === "CRITICAL").length, icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
          { label: "Critical Urgency", value: available.filter(d => d.urgency === "CRITICAL").length, icon: AlertCircle, color: "text-red-600 bg-red-50" },
          { label: "Meals Available", value: available.reduce((s: number, d: any) => s + (d.servings || 0), 0), icon: Users, color: "text-purple-600 bg-purple-50" },
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
          <h2 className="font-semibold text-gray-900">Available Donations</h2>
          <Link href="/dashboard/available" className="text-emerald-600 text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading…</div>
        ) : available.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No available donations right now</p>
            <p className="text-gray-400 text-sm">Check back soon — donors post new food daily.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {available.map((d: any) => (
              <div key={d.id} className="border border-gray-200 rounded-xl p-3 hover:border-emerald-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-gray-900 text-sm">{d.foodName}</span>
                  <span className={`badge ${urgencyColor(d.urgency)} text-xs`}>{d.urgency}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{d.quantity} {d.unit} · {d.servings} servings</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-orange-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeUntil(d.consumeBefore)}
                  </span>
                  <Link href={`/dashboard/available/${d.id}`} className="text-xs text-emerald-600 font-medium hover:underline">
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
