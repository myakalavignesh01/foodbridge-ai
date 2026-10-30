"use client";
import { Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Leaf, LayoutDashboard, Package, Users, Truck, BarChart3,
  Bell, Settings, LogOut, Menu, X, MapPin, MessageSquare,
  ShieldCheck, ChevronDown, Zap
} from "lucide-react";

function NavLink({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
  return (
    <Link href={href} className={`sidebar-link ${active ? "active" : ""}`}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(data => setNotifCount(Array.isArray(data) ? data.filter((n: any) => !n.readStatus).length : 0))
      .catch(() => {});
  }, [pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center animate-pulse">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-gray-500 text-sm">Loading FoodBridge AI…</span>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const user = session.user as any;
  const role = user?.role || "DONOR";

  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["DONOR", "RECIPIENT", "VOLUNTEER", "ADMIN"] },
    { href: "/dashboard/donate", label: "Donate Food", icon: Package, roles: ["DONOR"] },
    { href: "/dashboard/donations", label: "My Donations", icon: Package, roles: ["DONOR"] },
    { href: "/dashboard/available", label: "Available Food", icon: Package, roles: ["RECIPIENT"] },
    { href: "/dashboard/requests", label: "My Requests", icon: Package, roles: ["RECIPIENT"] },
    { href: "/dashboard/pickups", label: "Available Pickups", icon: Truck, roles: ["VOLUNTEER"] },
    { href: "/dashboard/deliveries", label: "My Deliveries", icon: Truck, roles: ["VOLUNTEER"] },
    { href: "/dashboard/map", label: "Live Map", icon: MapPin, roles: ["DONOR", "RECIPIENT", "VOLUNTEER", "ADMIN"] },
    { href: "/dashboard/assistant", label: "AI Assistant", icon: MessageSquare, roles: ["DONOR", "RECIPIENT", "VOLUNTEER", "ADMIN"] },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, roles: ["DONOR", "ADMIN"] },
    { href: "/dashboard/admin", label: "Admin Panel", icon: ShieldCheck, roles: ["ADMIN"] },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell, roles: ["DONOR", "RECIPIENT", "VOLUNTEER", "ADMIN"] },
  ].filter(n => n.roles.includes(role));

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">FoodBridge AI</div>
            <div className="text-xs text-gray-400">Zero Hunger Platform</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
          />
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{user?.name}</div>
            <div className="text-xs text-gray-400">{role}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 shrink-0">
        <Sidebar />
      </aside>

      {/* Sidebar mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-gray-100 transform transition-transform md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="absolute top-4 right-4">
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <Sidebar />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0">
          <button className="md:hidden p-1 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span className={`badge ${
              role === "DONOR" ? "bg-emerald-100 text-emerald-700" :
              role === "RECIPIENT" ? "bg-blue-100 text-blue-700" :
              role === "VOLUNTEER" ? "bg-orange-100 text-orange-700" :
              "bg-purple-100 text-purple-700"
            }`}>
              {role}
            </span>
            {user?.verificationStatus === "VERIFIED" && <span className="badge bg-emerald-50 text-emerald-600 border border-emerald-200">✓ Verified</span>}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Link href="/dashboard/notifications" className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-500" />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center animate-pulse">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-gray-500 text-sm">Loading FoodBridge AI…</span>
        </div>
      </div>
    }>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}
