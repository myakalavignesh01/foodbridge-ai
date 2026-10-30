"use client";
import { useEffect, useState } from "react";
import { Users, Package, ShieldCheck, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminPanelPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("donations");
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/donations?limit=20").then(r => r.json()),
      fetch("/api/organizations").then(r => r.json()),
    ]).then(([d, o]) => {
      setDonations(d.donations || []);
      setOrgs(Array.isArray(o) ? o : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function verifyOrg(id: string, status: string) {
    setVerifying(id);
    await fetch("/api/organizations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, verificationStatus: status }),
    });
    setOrgs(prev => prev.map(o => o.id === id ? { ...o, verificationStatus: status } : o));
    setVerifying(null);
  }

  const badgeColor = (s: string) => s === "TRUSTED" ? "bg-emerald-100 text-emerald-700" : s === "VERIFIED" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm">Manage users, organizations, and platform activity</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {["donations", "organizations"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${tab === t ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading admin data…</div>
      ) : tab === "donations" ? (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">All Donations ({donations.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Food", "Donor", "Qty", "Status", "Urgency", "Safety"].map(h => (
                    <th key={h} className="text-left text-gray-400 font-medium pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {donations.map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-900">{d.foodName}</td>
                    <td className="py-2 pr-4 text-gray-500">{d.donor?.name}</td>
                    <td className="py-2 pr-4 text-gray-600">{d.quantity} {d.unit}</td>
                    <td className="py-2 pr-4">
                      <span className={`badge text-xs ${d.status === "COMPLETED" ? "bg-green-100 text-green-700" : d.status === "AVAILABLE" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        {d.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`badge text-xs ${d.urgency === "CRITICAL" ? "bg-red-100 text-red-700" : d.urgency === "HIGH" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                        {d.urgency}
                      </span>
                    </td>
                    <td className="py-2 text-xs text-gray-400">{d.safetyStatus?.replace(/_/g, " ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Organizations ({orgs.length})</h2>
          <div className="space-y-3">
            {orgs.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">{o.name}</div>
                  <div className="text-xs text-gray-400">{o.type?.replace(/_/g, " ")} · {o.address}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge text-xs ${badgeColor(o.verificationStatus)}`}>{o.verificationStatus}</span>
                  {o.verificationStatus === "UNVERIFIED" && (
                    <button
                      onClick={() => verifyOrg(o.id, "VERIFIED")}
                      disabled={verifying === o.id}
                      className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {verifying === o.id ? "…" : "Verify"}
                    </button>
                  )}
                  {o.verificationStatus === "VERIFIED" && (
                    <button
                      onClick={() => verifyOrg(o.id, "TRUSTED")}
                      disabled={verifying === o.id}
                      className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 disabled:opacity-60"
                    >
                      {verifying === o.id ? "…" : "Mark Trusted"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
