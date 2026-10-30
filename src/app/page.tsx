"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Leaf, ArrowRight, Users, ShieldCheck, Zap, MapPin, TrendingUp,
  CheckCircle, ChevronDown, Star, Heart, Globe, Clock, Package
} from "lucide-react";

const STATS = [
  { value: "2,840", label: "Meals Redistributed", icon: "🍽️" },
  { value: "1,420 kg", label: "Food Saved from Waste", icon: "🥗" },
  { value: "1,960", label: "People Reached", icon: "👥" },
  { value: "94%", label: "Match Success Rate", icon: "🎯" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Post Surplus", desc: "Donors list surplus food with details — quantity, type, pickup window, and location.", icon: Package },
  { step: "02", title: "AI Finds the Best Match", desc: "FoodBridge AI scores and ranks verified recipients based on distance, need, urgency and compatibility.", icon: Zap },
  { step: "03", title: "Volunteer Collects", desc: "A nearby volunteer accepts the pickup and collects the food within the window.", icon: MapPin },
  { step: "04", title: "Food Reaches People", desc: "The recipient confirms delivery. Impact is recorded — meals served, people reached, waste prevented.", icon: Heart },
];

const FOR_USERS = [
  {
    role: "Donors",
    color: "bg-emerald-50 border-emerald-200",
    icon: "🏪",
    items: ["Restaurants, hotels, bakeries, caterers", "Post surplus in under 3 minutes", "Real-time pickup tracking", "Monthly impact reports"],
    cta: "Start Donating",
    href: "/auth/register?role=DONOR",
  },
  {
    role: "NGOs & Recipients",
    color: "bg-blue-50 border-blue-200",
    icon: "🏠",
    items: ["Verified food banks, shelters, kitchens", "AI-matched donations sent to you", "Set food requirements & capacity", "Confirm receipt & report impact"],
    cta: "Register as Recipient",
    href: "/auth/register?role=RECIPIENT",
  },
  {
    role: "Volunteers",
    color: "bg-orange-50 border-orange-200",
    icon: "🚗",
    items: ["Accept nearby pickup tasks", "Navigate with built-in directions", "Confirm pickup and delivery", "Track your personal impact"],
    cta: "Join as Volunteer",
    href: "/auth/register?role=VOLUNTEER",
  },
];

const TESTIMONIALS = [
  { name: "Meera Sharma", role: "NGO Director, Hope Kitchen", text: "FoodBridge AI has transformed how we receive food. We get matched automatically with donations that fit our needs — no phone calls, no guesswork.", avatar: "MS" },
  { name: "Rahul Verma", role: "Restaurant Owner, Green Bowl", text: "We used to throw away 30–40 meals a night. Now they reach a community kitchen 2 km away within an hour. The AI matching is remarkable.", avatar: "RV" },
  { name: "Priya Nair", role: "Volunteer Coordinator", text: "The volunteer dashboard shows everything — nearby pickups, estimated ETAs, live status. It feels like a professional logistics platform.", avatar: "PN" },
];

const FAQ = [
  { q: "Who can donate food?", a: "Any individual, restaurant, hotel, supermarket, caterer, event organizer, college, or corporate cafeteria with surplus food." },
  { q: "How does AI matching work?", a: "Our matching engine scores recipient organizations on distance, current food need, capacity, food compatibility, urgency, and verification status. The highest-scoring recipient gets recommended first." },
  { q: "Is AI responsible for food safety decisions?", a: "No. AI provides a risk assessment as decision support only. Donors and recipient organizations remain responsible for following applicable food-safety regulations." },
  { q: "How quickly can food be picked up?", a: "For critical donations (< 1 hour until expiry), the average pickup assignment is under 5 minutes. Volunteers are notified immediately." },
  { q: "Is the platform free?", a: "Core donation functionality is free for all organizations working toward food redistribution. Advanced analytics and ESG reporting are available on paid plans." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">FoodBridge <span className="text-emerald-600">AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</a>
            <a href="#impact" className="hover:text-emerald-600 transition-colors">Impact</a>
            <a href="#for-users" className="hover:text-emerald-600 transition-colors">For You</a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-emerald-600 font-medium px-3 py-1.5">Sign In</Link>
            <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-orange-50 pt-20 pb-28 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #059669 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Globe className="w-4 h-4" /> UN SDG 2 — Zero Hunger
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Turn Surplus Food<br />
            <span className="text-emerald-600">Into Meals.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            FoodBridge AI connects surplus food with verified organizations and communities — using intelligent matching and real-time coordination.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link href="/auth/register?role=DONOR" className="btn-primary text-base py-3 px-8">
              Donate Food <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/register?role=RECIPIENT" className="btn-secondary text-base py-3 px-8">Find Food</Link>
            <Link href="/auth/register?role=VOLUNTEER" className="btn-secondary text-base py-3 px-8">Join as Volunteer</Link>
          </div>

          {/* Flow diagram */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-gray-600">
            {["Restaurant / Hotel", "Surplus Food", "FoodBridge AI", "Verified NGO", "Community"].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-lg border ${i === 2 ? "bg-emerald-600 text-white border-emerald-600 font-semibold" : "bg-white border-gray-200"}`}>{item}</span>
                {i < 4 && <ArrowRight className="w-4 h-4 text-emerald-400" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="impact" className="bg-emerald-600 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-emerald-200 text-center text-sm font-medium mb-8 uppercase tracking-widest">Platform Impact</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-emerald-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Problem</h2>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">
            Millions of kilograms of edible food are wasted daily by restaurants, hotels, and events — while communities nearby struggle with hunger. The problem is rarely a lack of food. It's a lack of <strong>real-time visibility, coordination, and trust</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "🚫", title: "No Visibility", desc: "Donors don't know who needs food right now." },
              { icon: "⏱️", title: "Time-Critical", desc: "Surplus food expires within hours. Every minute counts." },
              { icon: "🔗", title: "No Coordination", desc: "Manual phone calls and messages can't scale." },
            ].map(item => (
              <div key={item.title} className="card text-left">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500">Four simple steps from surplus to impact.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="text-emerald-600 font-bold text-xs tracking-widest mb-2">{step.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI MATCHING */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-sm font-medium px-3 py-1 rounded-full mb-4">
                <Zap className="w-4 h-4" /> AI-Powered
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Intelligent Matching Engine</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our AI scores every potential recipient against 7 factors — ensuring food reaches the right place at the right time.
              </p>
              <div className="space-y-3">
                {[
                  ["Distance", "25%", "bg-emerald-500"],
                  ["Recipient Need", "20%", "bg-blue-500"],
                  ["Urgency", "20%", "bg-orange-500"],
                  ["Food Compatibility", "15%", "bg-purple-500"],
                  ["Capacity", "10%", "bg-yellow-500"],
                  ["Reliability + Pickup", "10%", "bg-gray-400"],
                ].map(([label, pct, color]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-44">{label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${color}`} style={{ width: pct }} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-8">{pct}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card border-2 border-emerald-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Recommendation</span>
                <span className="badge bg-emerald-100 text-emerald-700">94/100 Match</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                <div className="font-semibold text-gray-900">Donation #FB1024</div>
                <div className="text-gray-500">120 packed meals · Expires 8:30 PM · <span className="text-red-600 font-medium">HIGH urgency</span></div>
              </div>
              <div className="font-semibold text-gray-900 mb-1">Hope Community Kitchen</div>
              <div className="text-gray-500 text-sm mb-3">2.4 km · Needs 150 meals · Verified ✓</div>
              <div className="space-y-1 text-sm mb-4">
                {["2.4 km distance", "Needs 150 meals", "Vegetarian compatible", "Pickup available", "Verified organization"].map(r => (
                  <div key={r} className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle className="w-4 h-4" /> {r}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="btn-primary text-sm py-2 flex-1">Accept Match</button>
                <button className="btn-secondary text-sm py-2 px-4">Alternatives</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOR USERS */}
      <section id="for-users" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Built for Everyone in the Chain</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FOR_USERS.map((u) => (
              <div key={u.role} className={`card border-2 ${u.color} flex flex-col`}>
                <div className="text-4xl mb-3">{u.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{u.role}</h3>
                <ul className="space-y-2 flex-1 mb-6">
                  {u.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href={u.href} className="btn-primary text-sm py-2 text-center justify-center">{u.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST & SAFETY */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Trust & Safety First</h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto">Every organization is verified. Every donation has a safety assessment. AI recommendations are always decision-support — humans remain in control.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🔐", title: "Verified Organizations" },
              { icon: "🛡️", title: "Food Safety Engine" },
              { icon: "👁️", title: "AI Explainability" },
              { icon: "📋", title: "Full Audit Trail" },
            ].map(item => (
              <div key={item.title} className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm font-medium text-gray-700">{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-4 bg-emerald-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What People Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">{t.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {item.q}
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-emerald-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start Redirecting Surplus Today</h2>
          <p className="text-emerald-200 mb-8 text-lg">Join hundreds of restaurants, NGOs and volunteers making food waste history.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/register?role=DONOR" className="bg-white text-emerald-700 font-semibold px-8 py-3 rounded-lg hover:bg-emerald-50 transition-colors">
              Donate Food
            </Link>
            <Link href="/auth/register?role=RECIPIENT" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-emerald-500 transition-colors">
              Find Food
            </Link>
            <Link href="/auth/register?role=VOLUNTEER" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-emerald-500 transition-colors">
              Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">FoodBridge AI</span>
            </div>
            <p className="text-sm">Surplus Food. Smart Matching. Zero Hunger.</p>
            <p className="text-xs mt-2 text-gray-600">UN SDG 2 — Zero Hunger</p>
          </div>
          {[
            { title: "Platform", links: ["How It Works", "AI Matching", "Food Safety", "Analytics"] },
            { title: "For Users", links: ["Donors", "NGOs & Recipients", "Volunteers", "Administrators"] },
            { title: "Company", links: ["About", "Impact Report", "Privacy Policy", "Terms of Service"] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-3 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} FoodBridge AI. Built to fight hunger and food waste. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
