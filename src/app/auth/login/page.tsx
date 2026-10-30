"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Demo login shortcuts
  const demoAccounts = [
    { label: "Demo Donor", email: "donor@demo.com", password: "demo1234" },
    { label: "Demo NGO", email: "ngo@demo.com", password: "demo1234" },
    { label: "Demo Volunteer", email: "volunteer@demo.com", password: "demo1234" },
    { label: "Demo Admin", email: "admin@demo.com", password: "demo1234" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your FoodBridge AI account</p>
        </div>

        <div className="card">
          {params.get("registered") && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
              <span>✅ Account created! Sign in below.</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-emerald-600 font-medium hover:underline">Create one free</Link>
            </p>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-6">
          <p className="text-xs text-gray-400 text-center mb-3">Quick demo login</p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((a) => (
              <button
                key={a.label}
                onClick={() => { setEmail(a.email); setPassword(a.password); }}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 hover:border-emerald-300 transition-colors text-left"
              >
                <span className="block font-medium text-gray-800">{a.label}</span>
                <span className="text-gray-400">{a.email}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">Click a demo account to auto-fill, then press Sign In</p>
        </div>
      </div>
    </div>
  );
}
