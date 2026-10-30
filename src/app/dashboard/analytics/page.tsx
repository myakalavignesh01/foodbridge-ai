"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const COLORS = ["#059669", "#3b82f6", "#ea580c", "#8b5cf6", "#f59e0b", "#6b7280"];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics").then(r => r.json()),
      fetch("/api/donations?limit=100").then(r => r.json()),
    ]).then(([s, d]) => {
      setStats(s);
      setDonations(d.donations || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading analytics…</div>;

  // Category breakdown
  const categoryData = Object.entries(stats?.categoryBreakdown || {}).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value: value as number,
  }));

  // Urgency breakdown
  const urgencyData = ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(u => ({
    name: u,
    count: donations.filter(d => d.urgency === u).length,
  }));

  // Status breakdown
  const statusData = ["AVAILABLE", "MATCHED", "COMPLETED", "CANCELLED"].map(s => ({
    name: s.replace(/_/g, " "),
    count: donations.filter(d => d.status === s).length,
  }));

  // Daily trend (last 7 days)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const day = d.toLocaleDateString("en-US", { weekday: "short" });
    const count = donations.filter(don => {
      const donDate = new Date(don.createdAt);
      return donDate.toDateString() === d.toDateString();
    }).length;
    return { day, count };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm">Platform performance and impact metrics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Donations", value: stats?.totalDonations || 0, color: "text-emerald-600" },
          { label: "Completed", value: stats?.completedDonations || 0, color: "text-blue-600" },
          { label: "Meals Delivered", value: stats?.totalMeals || 0, color: "text-purple-600" },
          { label: "Success Rate", value: `${stats?.successRate || 0}%`, color: "text-green-600" },
        ].map(k => (
          <div key={k.label} className="stat-card text-center">
            <div className={`text-3xl font-bold ${k.color} mb-1`}>{k.value}</div>
            <div className="text-gray-400 text-sm">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Donations by day */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Donations (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Donations" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Food Categories</h2>
          {categoryData.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${percent != null ? (percent * 100).toFixed(0) : 0}%`} labelLine={false} fontSize={11}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Urgency */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Donations by Urgency</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={urgencyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
              <Tooltip />
              <Bar dataKey="count" fill="#ea580c" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Donation Status Distribution</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Impact summary */}
      <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-5">
        <h2 className="font-semibold text-emerald-800 mb-3">🌍 Platform Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div><div className="text-2xl font-bold text-emerald-700">{stats?.totalMeals || 0}</div><div className="text-xs text-emerald-600">Meals Redistributed</div></div>
          <div><div className="text-2xl font-bold text-emerald-700">{Math.round((stats?.totalMeals || 0) * 0.4)} kg</div><div className="text-xs text-emerald-600">Food Waste Prevented</div></div>
          <div><div className="text-2xl font-bold text-emerald-700">{Math.round((stats?.totalMeals || 0) * 0.8)}</div><div className="text-xs text-emerald-600">People Reached</div></div>
          <div><div className="text-2xl font-bold text-emerald-700">{stats?.totalOrgs || 0}</div><div className="text-xs text-emerald-600">Organizations Active</div></div>
        </div>
        <p className="text-xs text-emerald-600 mt-3 text-center">* Environmental impact estimates are based on configurable methodology and not guaranteed measurements.</p>
      </div>
    </div>
  );
}
