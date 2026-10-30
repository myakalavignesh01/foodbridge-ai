"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, TrendingUp, Users, CheckCircle, AlertTriangle, Plus, ArrowRight, Leaf } from "lucide-react";
import { formatDate, timeUntil, urgencyColor, statusColor } from "@/lib/utils";

export default function DonorDashboard() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/donations?limit=5")
      .then(r => r.json())
      .then(d => { setDonations(d.donations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = {
    total: donations.length,
    active: donations.filter(d => ["AVAILABLE", "MATCHED", "PICKUP_ASSIGNED", "IN_TRANSIT"].includes(d.status)).length,
    completed: donations.filter(d => d.status === "COMPLETED").length,
    meals: donations.reduce((s, d) => s + (d.servings || 0), 0),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donor Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your food donations and track impact</p>
        </div>
        <Link href="/dashboard/donate" className="btn-primary">
          <Plus className="w-4 h-4" /> Donate Food
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Donations", value: stats.total, icon: Package, color: "text-emerald-600 bg-emerald-50" },
          { label: "Active", value: stats.active, icon: AlertTriangle, color: "text-orange-600 bg-orange-50" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
          { label: "Meals Shared", value: stats.meals, icon: Leaf, color: "text-purple-600 bg-purple-50" },
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

      {/* Recent donations */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Donations</h2>
          <Link href="/dashboard/donations" className="text-emerald-600 text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading…</div>
        ) : donations.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No donations yet</p>
            <p className="text-gray-400 text-sm mb-4">Turn your surplus into someone&apos;s next meal.</p>
            <Link href="/dashboard/donate" className="btn-primary text-sm">Create Donation</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {donations.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm truncate">{d.foodName}</span>
                    <span className={`badge ${urgencyColor(d.urgency)}`}>{d.urgency}</span>
                  </div>
                  <div className="text-xs text-gray-500">{d.quantity} {d.unit} · {d.servings} servings · {formatDate(d.createdAt)}</div>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className={`badge ${statusColor(d.status)} text-xs`}>{d.status.replace(/_/g, " ")}</span>
                  <Link href={`/dashboard/donations/${d.id}`} className="text-emerald-600 hover:text-emerald-700">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Impact summary */}
      {stats.completed > 0 && (
        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <h3 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Your Impact
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-xl font-bold text-emerald-700">{stats.completed}</div><div className="text-xs text-emerald-600">Redistributions</div></div>
            <div><div className="text-xl font-bold text-emerald-700">{stats.meals}</div><div className="text-xs text-emerald-600">Meals Shared</div></div>
            <div><div className="text-xl font-bold text-emerald-700">{Math.round(stats.meals * 0.8)}</div><div className="text-xs text-emerald-600">People Reached</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
