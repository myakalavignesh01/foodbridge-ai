"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Package, Truck, CheckCircle, AlertTriangle, ShieldCheck, TrendingUp, ArrowRight, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics").then(r => r.json()),
      fetch("/api/donations?limit=5").then(r => r.json()),
    ]).then(([s, d]) => {
      setStats(s);
      setDonations(d.donations || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading admin panel…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Monitor the entire FoodBridge AI ecosystem</p>
        </div>
        <Link href="/dashboard/admin" className="btn-primary">
          <ShieldCheck className="w-4 h-4" /> Admin Panel
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Total Donations", value: stats?.totalDonations || 0, icon: Package, color: "text-emerald-600 bg-emerald-50" },
          { label: "Completed", value: stats?.completedDonations || 0, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          { label: "Active Now", value: stats?.activeDonations || 0, icon: AlertTriangle, color: "text-orange-600 bg-orange-50" },
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Meals Distributed", value: stats?.totalMeals || 0, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
          { label: "Organizations", value: stats?.totalOrgs || 0, icon: ShieldCheck, color: "text-indigo-600 bg-indigo-50" },
          { label: "Pending Deliveries", value: stats?.pendingDeliveries || 0, icon: Truck, color: "text-yellow-600 bg-yellow-50" },
          { label: "Success Rate", value: `${stats?.successRate || 0}%`, icon: BarChart3, color: "text-green-600 bg-green-50" },
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
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          <Link href="/dashboard/admin" className="text-emerald-600 text-sm font-medium hover:underline flex items-center gap-1">
            Full Admin Panel <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {donations.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No recent activity</div>
        ) : (
          <div className="space-y-2">
            {donations.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                <div>
                  <span className="font-medium text-gray-900">{d.foodName}</span>
                  <span className="text-gray-400 ml-2">by {d.donor?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge text-xs ${d.urgency === "CRITICAL" ? "bg-red-100 text-red-700" : d.urgency === "HIGH" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                    {d.urgency}
                  </span>
                  <span className="text-gray-400">{d.status.replace(/_/g, " ")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
