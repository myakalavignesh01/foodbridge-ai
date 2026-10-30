"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check, AlertTriangle, ShieldCheck, Package, MapPin, ClipboardList } from "lucide-react";
import { assessFoodSafety } from "@/lib/food-safety";
import { calculateUrgency } from "@/lib/matching-engine";
import { safetyColor } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Food Details", icon: Package },
  { id: 2, label: "Safety", icon: ShieldCheck },
  { id: 3, label: "Pickup", icon: MapPin },
  { id: 4, label: "Review", icon: ClipboardList },
];

const FOOD_CATEGORIES = ["COOKED_MEALS", "BAKERY", "PRODUCE", "DAIRY", "PACKAGED", "BEVERAGES", "OTHER"];
const ALLERGENS = ["Gluten", "Dairy", "Eggs", "Nuts", "Soy", "Shellfish", "Fish", "Sesame"];

const defaultForm = {
  foodName: "", category: "COOKED_MEALS", quantity: "", unit: "kg", servings: "",
  dietaryType: "VEGETARIAN", allergens: [] as string[],
  preparedAt: "", availableFrom: "", consumeBefore: "",
  storageCondition: "", currentTemperature: "", packagingCondition: "INTACT",
  pickupAddress: "", pickupLat: "", pickupLng: "", contactPerson: "", contactPhone: "", accessInstructions: "",
  notes: "",
};

export default function DonatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleAllergen(a: string) {
    setForm(prev => ({
      ...prev,
      allergens: prev.allergens.includes(a) ? prev.allergens.filter(x => x !== a) : [...prev.allergens, a],
    }));
  }

  function validateStep(s: number) {
    if (s === 1) {
      if (!form.foodName.trim()) return "Food name is required";
      if (!form.quantity || isNaN(+form.quantity)) return "Valid quantity required";
      if (!form.servings || isNaN(+form.servings)) return "Servings count required";
      if (!form.consumeBefore) return "Consume-before time required";
    }
    if (s === 2) {
      if (!safetyConfirmed) return "Please confirm the food safety checklist";
    }
    if (s === 3) {
      if (!form.pickupAddress.trim()) return "Pickup address required";
      if (!form.contactPhone.trim()) return "Contact phone required";
    }
    return null;
  }

  function nextStep() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError("");
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          allergens: form.allergens,
          availableFrom: form.availableFrom || new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Submission failed"); return; }

      // Trigger AI matching
      await fetch(`/api/donations/${data.donation.id}/match`, { method: "POST" });
      router.push(`/dashboard/donations/${data.donation.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Safety preview (client side)
  const safety = form.consumeBefore
    ? assessFoodSafety({
        foodName: form.foodName || "Food",
        category: form.category,
        preparedAt: form.preparedAt ? new Date(form.preparedAt) : null,
        consumeBefore: new Date(form.consumeBefore),
        storageCondition: form.storageCondition,
        packagingCondition: form.packagingCondition,
        currentTemperature: form.currentTemperature,
        allergens: JSON.stringify(form.allergens),
      })
    : null;

  const urgency = form.consumeBefore ? calculateUrgency(new Date(form.consumeBefore)) : null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Donate Surplus Food</h1>
        <p className="text-gray-500 text-sm mt-0.5">Fill in the details and AI will find the best recipient</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step > s.id ? "bg-emerald-600 text-white" : step === s.id ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span className={`text-xs mt-1 font-medium ${step === s.id ? "text-emerald-600" : "text-gray-400"}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-4 ${step > s.id ? "bg-emerald-600" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="card">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Food Details</h2>
            <div>
              <label className="label">Food Name *</label>
              <input name="foodName" className="input" placeholder="e.g. Vegetable Rice, Bread Loaves" value={form.foodName} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Category *</label>
                <select name="category" className="input" value={form.category} onChange={handleChange}>
                  {FOOD_CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Dietary Type</label>
                <select name="dietaryType" className="input" value={form.dietaryType} onChange={handleChange}>
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Quantity *</label>
                <input name="quantity" type="number" className="input" placeholder="0" min="0.1" step="0.1" value={form.quantity} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Unit</label>
                <select name="unit" className="input" value={form.unit} onChange={handleChange}>
                  {["kg", "liters", "portions", "boxes", "packets", "pieces"].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Servings *</label>
                <input name="servings" type="number" className="input" placeholder="0" min="1" value={form.servings} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prepared At</label>
                <input name="preparedAt" type="datetime-local" className="input" value={form.preparedAt} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Consume Before *</label>
                <input name="consumeBefore" type="datetime-local" className="input" value={form.consumeBefore} onChange={handleChange} />
              </div>
            </div>

            {urgency && (
              <div className={`p-3 rounded-lg border text-sm font-medium ${urgency.level === "CRITICAL" ? "bg-red-50 border-red-200 text-red-700" : urgency.level === "HIGH" ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-green-50 border-green-200 text-green-700"}`}>
                ⏱️ Urgency: <strong>{urgency.level}</strong> — {urgency.hoursLeft > 0 ? `${urgency.hoursLeft.toFixed(1)}h until expiry` : "Already expired!"}
              </div>
            )}

            <div>
              <label className="label">Allergens (select all that apply)</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ALLERGENS.map(a => (
                  <button
                    key={a} type="button"
                    onClick={() => toggleAllergen(a)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.allergens.includes(a) ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Food Safety Assessment</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Storage Condition</label>
                <select name="storageCondition" className="input" value={form.storageCondition} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Room temperature">Room temperature</option>
                  <option value="Refrigerated">Refrigerated (2–8°C)</option>
                  <option value="Frozen">Frozen (&lt;0°C)</option>
                  <option value="Hot holding">Hot holding (&gt;60°C)</option>
                </select>
              </div>
              <div>
                <label className="label">Packaging Condition</label>
                <select name="packagingCondition" className="input" value={form.packagingCondition} onChange={handleChange}>
                  <option value="INTACT">Intact / Sealed</option>
                  <option value="Open container">Open container</option>
                  <option value="Damaged packaging">Damaged packaging</option>
                  <option value="Loose / unwrapped">Loose / unwrapped</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Current Temperature (optional)</label>
              <input name="currentTemperature" className="input" placeholder="e.g. Hot, Chilled, ~4°C" value={form.currentTemperature} onChange={handleChange} />
            </div>

            {safety && (
              <div className={`p-4 rounded-xl border ${safetyColor(safety.status)}`}>
                <div className="font-semibold mb-2">AI Safety Assessment: {safety.status.replace(/_/g, " ")}</div>
                {safety.flags.length > 0 && (
                  <ul className="mb-2 space-y-1">
                    {safety.flags.map(f => <li key={f} className="text-sm flex items-center gap-1.5">⚠️ {f}</li>)}
                  </ul>
                )}
                <div className="space-y-1 mb-3">
                  {safety.checklist.map(c => (
                    <div key={c.item} className="flex items-center gap-2 text-sm">
                      <span>{c.passed ? "✅" : "❌"}</span> {c.item}
                    </div>
                  ))}
                </div>
                {safety.recommendations.map(r => (
                  <div key={r} className="text-xs opacity-80">💡 {r}</div>
                ))}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg">
              <strong>Disclaimer:</strong> AI recommendations are decision-support only. Food donors and authorized organizations remain responsible for following applicable food-safety regulations and procedures.
            </div>

            <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors">
              <input
                type="checkbox"
                checked={safetyConfirmed}
                onChange={(e) => setSafetyConfirmed(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-sm text-gray-700">
                I confirm that to the best of my knowledge, this food is safe for redistribution and I have followed applicable food-safety guidelines.
              </span>
            </label>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Pickup Details</h2>
            <div>
              <label className="label">Pickup Address *</label>
              <input name="pickupAddress" className="input" placeholder="Full address" value={form.pickupAddress} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Contact Person</label>
                <input name="contactPerson" className="input" placeholder="Name" value={form.contactPerson} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Contact Phone *</label>
                <input name="contactPhone" className="input" placeholder="+91 98765 43210" value={form.contactPhone} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="label">Available From</label>
              <input name="availableFrom" type="datetime-local" className="input" value={form.availableFrom} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Access Instructions</label>
              <textarea name="accessInstructions" className="input" rows={2} placeholder="e.g. Ring bell at back entrance, ask for kitchen manager" value={form.accessInstructions} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea name="notes" className="input" rows={2} placeholder="Any other important information" value={form.notes} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Review & Submit</h2>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div><span className="text-gray-400">Food:</span> <span className="font-medium">{form.foodName}</span></div>
                <div><span className="text-gray-400">Category:</span> <span className="font-medium">{form.category.replace(/_/g, " ")}</span></div>
                <div><span className="text-gray-400">Quantity:</span> <span className="font-medium">{form.quantity} {form.unit}</span></div>
                <div><span className="text-gray-400">Servings:</span> <span className="font-medium">{form.servings}</span></div>
                <div><span className="text-gray-400">Dietary:</span> <span className="font-medium">{form.dietaryType}</span></div>
                <div><span className="text-gray-400">Packaging:</span> <span className="font-medium">{form.packagingCondition}</span></div>
                <div><span className="text-gray-400">Pickup:</span> <span className="font-medium">{form.pickupAddress?.substring(0, 30)}…</span></div>
                <div><span className="text-gray-400">Contact:</span> <span className="font-medium">{form.contactPhone}</span></div>
              </div>
              {form.allergens.length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-400">Allergens: </span>
                  {form.allergens.map(a => <span key={a} className="badge bg-orange-100 text-orange-700 mr-1">{a}</span>)}
                </div>
              )}
            </div>

            {urgency && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${urgency.level === "CRITICAL" ? "bg-red-50 text-red-700" : urgency.level === "HIGH" ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"}`}>
                ⏱️ Urgency: <strong>{urgency.level}</strong>
              </div>
            )}

            {safety && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium border ${safetyColor(safety.status)}`}>
                🛡️ Safety: <strong>{safety.status.replace(/_/g, " ")}</strong>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              <strong>🤖 After submission:</strong> FoodBridge AI will immediately analyze your donation and recommend the best verified recipient within seconds.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => { setError(""); setStep(s => s - 1); }}
            disabled={step === 1}
            className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {step < 4 ? (
            <button type="button" onClick={nextStep} className="btn-primary">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-accent disabled:opacity-60">
              {submitting ? "Submitting…" : "🚀 Donate Food"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
