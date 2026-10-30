"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { urgencyColor, statusColor, timeUntil } from "@/lib/utils";

export default function RequestsPage() {
  const [matched, setMatched] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/donations?status=MATCHED&limit=20")
      .then(r => r.json())
      .then(d => { setMatched(d.donations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-500 text-sm">Donations matched to your organization</p>
        </div>
        <Link href="/dashboard/available" className="btn-secondary text-sm">Browse Available</Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : matched.length === 0 ? (
        <div className="card text-center py-16">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No active requests</p>
          <p className="text-gray-400 text-sm mb-4">Browse available donations and accept ones that match your needs.</p>
          <Link href="/dashboard/available" className="btn-primary text-sm inline-flex">Browse Food</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {matched.map((d: any) => (
            <div key={d.id} className="card hover:border-emerald-200 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{d.foodName}</h3>
                  <p className="text-sm text-gray-500">{d.quantity} {d.unit} · {d.servings} servings · {d.dietaryType}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${urgencyColor(d.urgency)} text-xs`}>{d.urgency}</span>
                  <span className={`badge ${statusColor(d.status)} text-xs`}>{d.status.replace(/_/g, " ")}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1 text-orange-500 font-medium">
                  <Clock className="w-3 h-3" /> {timeUntil(d.consumeBefore)}
                </span>
                <Link href={`/dashboard/available/${d.id}`} className="text-emerald-600 font-medium hover:underline flex items-center gap-1">
                  View Details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {d.delivery && (
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-emerald-700 font-medium">
                  🚗 Volunteer assigned — en route
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
