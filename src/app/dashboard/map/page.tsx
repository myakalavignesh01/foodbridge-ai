"use client";
import { useEffect, useState } from "react";
import { MapPin, Package, Users, Zap, Info } from "lucide-react";
import { urgencyColor } from "@/lib/utils";

// Simulated map with visual grid of organizations and donations
// In production this would use Leaflet/Mapbox

const MOCK_LOCATIONS = [
  { id: "1", name: "Green Bowl Restaurant", type: "DONOR", lat: 12.971, lng: 77.594, status: "Active Donor", color: "bg-emerald-500" },
  { id: "2", name: "Hope Community Kitchen", type: "NGO", lat: 12.978, lng: 77.591, status: "Verified NGO", color: "bg-blue-500" },
  { id: "3", name: "City Food Bank", type: "FOOD_BANK", lat: 12.965, lng: 77.600, status: "Verified", color: "bg-purple-500" },
  { id: "4", name: "Sunrise Shelter", type: "SHELTER", lat: 12.975, lng: 77.585, status: "Trusted Partner", color: "bg-indigo-500" },
  { id: "5", name: "Hotel Grand", type: "DONOR", lat: 12.968, lng: 77.597, status: "Active Donor", color: "bg-emerald-500" },
  { id: "6", name: "Arjun (Volunteer)", type: "VOLUNTEER", lat: 12.972, lng: 77.598, status: "Available", color: "bg-orange-500" },
  { id: "7", name: "Priya (Volunteer)", type: "VOLUNTEER", lat: 12.970, lng: 77.593, status: "On Delivery", color: "bg-yellow-500" },
];

export default function MapPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/organizations?verified=true").then(r => r.json()),
      fetch("/api/donations?status=AVAILABLE&limit=10").then(r => r.json()),
    ]).then(([orgs, d]) => {
      setOrganizations(Array.isArray(orgs) ? orgs : []);
      setDonations(d.donations || []);
    }).catch(() => {});
  }, []);

  const allLocations = [
    ...MOCK_LOCATIONS,
    ...organizations.slice(0, 6).map((o: any, i: number) => ({
      id: o.id,
      name: o.name,
      type: o.type,
      status: o.verificationStatus,
      color: o.type === "NGO" || o.type === "FOOD_BANK" || o.type === "SHELTER" ? "bg-blue-500" : "bg-emerald-500",
    })),
  ];

  const LEGEND = [
    { color: "bg-emerald-500", label: "Food Donors" },
    { color: "bg-blue-500", label: "NGOs / Recipients" },
    { color: "bg-orange-500", label: "Volunteers" },
    { color: "bg-purple-500", label: "Food Banks" },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Live Map</h1>
        <p className="text-gray-500 text-sm">Real-time view of donors, recipients, and volunteers</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {LEGEND.map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${l.color}`} />
            <span className="text-xs text-gray-600">{l.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Map visualization */}
        <div className="md:col-span-2">
          <div className="relative bg-gradient-to-br from-green-50 to-blue-50 border border-gray-200 rounded-2xl overflow-hidden" style={{ height: 460 }}>
            {/* Grid overlay simulating map */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(#999 1px, transparent 1px), linear-gradient(90deg, #999 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

            {/* Map label */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200">
              📍 Bengaluru Metropolitan Area
            </div>

            {/* Markers positioned pseudo-randomly but consistently */}
            {allLocations.slice(0, 12).map((loc, i) => {
              const x = 10 + ((i * 73 + 31) % 75);
              const y = 10 + ((i * 53 + 17) % 70);
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelected(selected?.id === loc.id ? null : loc)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className={`w-4 h-4 rounded-full ${loc.color} border-2 border-white shadow-md flex items-center justify-center`}>
                    {selected?.id === loc.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap bg-white/90 px-1 rounded text-gray-600 font-medium text-[10px]">
                    {loc.name.split(" ")[0]}
                  </div>
                </button>
              );
            })}

            {/* Active donation pulse */}
            {donations.slice(0, 3).map((d, i) => {
              const x = 15 + ((i * 89 + 42) % 65);
              const y = 15 + ((i * 61 + 28) % 60);
              return (
                <div key={d.id} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                  <div className="w-5 h-5 bg-orange-400 rounded-full border-2 border-white shadow-md animate-pulse flex items-center justify-center">
                    <Package className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              );
            })}

            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-xs text-gray-500 border border-gray-200">
              🟠 Active donations: {donations.length}
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="space-y-3">
          {selected ? (
            <div className="card border-2 border-emerald-200">
              <div className={`w-10 h-10 rounded-xl ${selected.color} flex items-center justify-center mb-3`}>
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{selected.name}</h3>
              <div className="text-sm text-gray-500 mb-2">{selected.type?.replace(/_/g, " ")}</div>
              <span className="badge bg-emerald-100 text-emerald-700 text-xs">{selected.status}</span>
            </div>
          ) : (
            <div className="card text-center py-8">
              <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Click a marker to view details</p>
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" /> Active Donations
            </h3>
            {donations.length === 0 ? (
              <p className="text-gray-400 text-sm">No active donations</p>
            ) : (
              <div className="space-y-2">
                {donations.slice(0, 5).map((d: any) => (
                  <div key={d.id} className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${d.urgency === "CRITICAL" ? "bg-red-500" : d.urgency === "HIGH" ? "bg-orange-500" : "bg-yellow-500"}`} />
                    <span className="text-gray-700 truncate flex-1">{d.foodName}</span>
                    <span className={`text-xs font-medium ${d.urgency === "CRITICAL" ? "text-red-600" : d.urgency === "HIGH" ? "text-orange-600" : "text-gray-400"}`}>{d.urgency}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Organizations
            </h3>
            <div className="space-y-2">
              {allLocations.slice(0, 5).map(l => (
                <div key={l.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  <span className="text-gray-700 truncate flex-1">{l.name}</span>
                  <span className="text-xs text-gray-400">{l.type?.replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
