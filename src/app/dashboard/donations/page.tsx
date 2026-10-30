"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Filter, Clock, ArrowRight } from "lucide-react";
import { urgencyColor, statusColor, timeUntil, formatDate } from "@/lib/utils";

export default function DonationsListPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const q = filter !== "ALL" ? `?status=${filter}` : "";
    fetch(`/api/donations${q}`)
      .then(r => r.json())
      .then(d => { setDonations(d.donations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  const FILTERS = ["ALL", "AVAILABLE", "MATCHED", "PICKUP_ASSIGNED", "IN_TRANSIT", "COMPLETED", "CANCELLED"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
        <Link href="/dashboard/donate" className="btn-primary"><Package className="w-4 h-4" /> New Donation</Link>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium whitespace-nowrap transition-colors ${filter === f ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
          >
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : donations.length === 0 ? (
        <div className="card text-center py-16">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No donations{filter !== "ALL" ? ` with status ${filter.replace(/_/g, " ")}` : ""}</p>
          <Link href="/dashboard/donate" className="btn-primary mt-4 inline-flex text-sm">Create Your First Donation</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {donations.map((d: any) => (
            <div key={d.id} className="card hover:border-emerald-200 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{d.foodName}</h3>
                    <span className={`badge ${urgencyColor(d.urgency)} text-xs`}>{d.urgency}</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {d.quantity} {d.unit} · {d.servings} servings · {d.dietaryType}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeUntil(d.consumeBefore)}</span>
                    <span>{formatDate(d.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  <span className={`badge ${statusColor(d.status)} text-xs`}>{d.status.replace(/_/g, " ")}</span>
                  <Link href={`/dashboard/donations/${d.id}`} className="text-emerald-600 hover:text-emerald-700">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              {d.matches?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-emerald-700 font-medium">
                  🤖 AI Match: {d.matches[0]?.recipient?.name} — {d.matches[0]?.matchScore}/100
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
