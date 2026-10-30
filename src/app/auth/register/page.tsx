"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, AlertCircle, CheckCircle } from "lucide-react";

const ROLES = [
  { value: "DONOR", label: "Food Donor", desc: "Restaurant, hotel, caterer, event organizer", icon: "🏪" },
  { value: "RECIPIENT", label: "Recipient Organization", desc: "NGO, food bank, shelter, community kitchen", icon: "🏠" },
  { value: "VOLUNTEER", label: "Volunteer / Delivery Partner", desc: "Help pick up and deliver food", icon: "🚗" },
];

const ORG_TYPES_DONOR = ["RESTAURANT", "HOTEL", "SUPERMARKET", "BAKERY", "CATERER", "CORPORATE", "COLLEGE", "OTHER"];
const ORG_TYPES_RECIPIENT = ["NGO", "FOOD_BANK", "SHELTER", "COMMUNITY_KITCHEN", "OTHER"];

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const preRole = params.get("role") || "";

  const [role, setRole] = useState(preRole);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    organizationName: "", organizationType: "", address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!role) { setError("Please select a role."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); return; }
      router.push("/auth/login?registered=1");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const orgTypes = role === "DONOR" ? ORG_TYPES_DONOR : ORG_TYPES_RECIPIENT;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-xl">FoodBridge AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join thousands fighting food waste</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Role selection */}
          <div className="mb-5">
            <label className="label">I am a…</label>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${role === r.value ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} className="hidden" />
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      {r.label} {role === r.value && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div className="text-gray-500 text-xs">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Full Name</label>
                <input name="name" className="input" placeholder="Your name" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input name="phone" className="input" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
            </div>

            {(role === "DONOR" || role === "RECIPIENT") && (
              <>
                <div>
                  <label className="label">Organization Name</label>
                  <input name="organizationName" className="input" placeholder="e.g. Green Bowl Restaurant" value={form.organizationName} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Organization Type</label>
                    <select name="organizationType" className="input" value={form.organizationType} onChange={handleChange}>
                      <option value="">Select type</option>
                      {orgTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">City / Address</label>
                    <input name="address" className="input" placeholder="Bengaluru, Karnataka" value={form.address} onChange={handleChange} />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading || !role} className="btn-primary w-full justify-center py-2.5 mt-2 disabled:opacity-60">
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-4">
            Already have an account? <Link href="/auth/login" className="text-emerald-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
