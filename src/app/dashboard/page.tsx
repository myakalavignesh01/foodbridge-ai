"use client";
import { useSession } from "next-auth/react";
import DonorDashboard from "@/components/dashboards/DonorDashboard";
import RecipientDashboard from "@/components/dashboards/RecipientDashboard";
import VolunteerDashboard from "@/components/dashboards/VolunteerDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "DONOR";

  if (role === "RECIPIENT") return <RecipientDashboard />;
  if (role === "VOLUNTEER") return <VolunteerDashboard />;
  if (role === "ADMIN") return <AdminDashboard />;
  return <DonorDashboard />;
}
