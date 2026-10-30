"use client";
import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const r = await fetch("/api/notifications");
    const d = await r.json();
    setNotifications(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
  }

  const typeIcon = (type: string) => {
    if (type.includes("CREATED")) return "📦";
    if (type.includes("MATCH")) return "🤖";
    if (type.includes("VOLUNTEER")) return "🚗";
    if (type.includes("DELIVERY")) return "✅";
    if (type.includes("WELCOME")) return "👋";
    return "🔔";
  };

  const unread = notifications.filter(n => !n.readStatus).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && <p className="text-sm text-gray-400">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm py-1.5 flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No notifications yet</p>
          <p className="text-gray-400 text-sm">You'll be notified when there's activity on your donations or deliveries.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <div key={n.id} className={`card p-4 ${!n.readStatus ? "border-emerald-200 bg-emerald-50" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{typeIcon(n.type)}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="font-medium text-gray-900 text-sm">{n.title}</div>
                    {!n.readStatus && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-1" />}
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-xs text-gray-400 mt-1 block">{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
