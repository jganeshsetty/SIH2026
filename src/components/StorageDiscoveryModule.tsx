import React, { useState } from 'react';
import { Warehouse, StorageBooking } from '../types';
import { BENCHMARK_WAREHOUSES } from '../services/marketData';
import { Archive, MapPin, CheckCircle2, Phone, ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  userFarmerId?: number;
  onBookingCreated?: (booking: StorageBooking) => void;
}

export const StorageDiscoveryModule: React.FC<Props> = ({ userFarmerId = 1, onBookingCreated }) => {
  const [warehouses] = useState<Warehouse[]>(BENCHMARK_WAREHOUSES);
  const [bookings, setBookings] = useState<StorageBooking[]>([
    {
      id: 801,
      farmerId: userFarmerId,
      warehouseId: 1,
      warehouseName: 'Nashik Agro Cold Storage',
      cropName: 'Tomato',
      quantityTonnes: 5.0,
      startDate: '2026-09-05',
      durationMonths: 1,
      totalCost: 750,
      status: 'ACTIVE',
      createdAt: '2026-09-05'
    }
  ]);

  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [cropName, setCropName] = useState('Tomato');
  const [quantityTonnes, setQuantityTonnes] = useState('5.0');
  const [durationMonths, setDurationMonths] = useState('1');
  const [successMsg, setSuccessMsg] = useState('');

  const handleBookStorage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse) return;

    const qty = parseFloat(quantityTonnes) || 1;
    const months = parseInt(durationMonths) || 1;
    const totalCost = qty * selectedWarehouse.costPerTonPerMonth * months;

    const newBooking: StorageBooking = {
      id: Date.now(),
      farmerId: userFarmerId,
      warehouseId: selectedWarehouse.id,
      warehouseName: selectedWarehouse.name,
      cropName,
      quantityTonnes: qty,
      startDate: new Date().toISOString().split('T')[0],
      durationMonths: months,
      totalCost,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const newDeliveryRequest = {
      id: Date.now(),
      cropName: cropName,
      quantity: qty * 1000,
      unit: "kg",
      farmerName: "Ganesh (Farmer)",
      farmerLocation: "Central Agro Zone, Nashik, Maharashtra",
      buyerName: selectedWarehouse.name,
      buyerLocation: selectedWarehouse.location,
      pathType: "Farmer → Storehouse" as const,
      distanceKm: 45,
      farePayout: Math.round(qty * 2500),
      status: "AVAILABLE" as const,
      isAccepted: false,
    };

    try {
      const existingRequests = JSON.parse(localStorage.getItem("farmora_delivery_requests") || "[]");
      localStorage.setItem("farmora_delivery_requests", JSON.stringify([newDeliveryRequest, ...existingRequests]));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}

    try {
      const token = localStorage.getItem("farmora_token");
      if (token) {
        fetch("/api/transport/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(newDeliveryRequest),
        });
      }
    } catch (e) {}

    setBookings([newBooking, ...bookings]);
    if (onBookingCreated) onBookingCreated(newBooking);
    setSelectedWarehouse(null);
    setSuccessMsg("Cold Storage space reserved! Transportation pickup request dispatched to Drivers.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#10b981]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-[#10b981]" />
            <h3 className="text-xl font-black text-[#022c22]">Nearby Cold Storages & Warehouses</h3>
          </div>
          <p className="text-xs text-[#065f46] font-semibold mt-1">
            Store produce locally to hold for seasonal price surges and prevent post-harvest losses.
          </p>
        </div>
        <span className="text-xs font-black bg-[#e1f2e6] text-[#065f46] px-3 py-1 rounded-full border border-[#10b981]/30">
          {warehouses.length} Storage Facilities
        </span>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#065f46] text-white text-xs font-black flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {warehouses.map((wh) => {
          const occupancyPercent = Math.round(((wh.totalCapacityTonnes - wh.availableCapacityTonnes) / wh.totalCapacityTonnes) * 100);

          return (
            <div 
              key={wh.id}
              className="p-5 rounded-2xl bg-white border-1.5 border-[#10b981]/30 shadow-sm hover:shadow-md hover:border-[#10b981]/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black text-[#10b981] bg-[#e1f2e6] px-2 py-0.5 rounded-md border border-[#10b981]/30">
                    {wh.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500">{wh.district}, {wh.state}</span>
                </div>

                <h4 className="text-base font-black text-[#022c22] mb-1">{wh.name}</h4>
                <p className="text-xs text-[#065f46] font-semibold mb-3 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#10b981]" />
                  {wh.location}
                </p>

                {/* Capacity Gauge */}
                <div className="bg-[#f6faf6] p-3 rounded-xl border border-[#10b981]/20 space-y-2 mb-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#065f46]">Available Space:</span>
                    <span className="text-[#022c22] font-black">{wh.availableCapacityTonnes} / {wh.totalCapacityTonnes} Tonnes</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#10b981]" style={{ width: `${occupancyPercent}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-semibold text-gray-600">
                    <span>Rate: ₹{wh.costPerTonPerMonth}/Ton/Month</span>
                    <span>{occupancyPercent}% Occupied</span>
                  </div>
                </div>

                <div className="text-[11px] font-semibold text-[#065f46] mb-4">
                  Supported: {wh.supportedCrops.join(', ')}
                </div>
              </div>

              <button
                onClick={() => setSelectedWarehouse(wh)}
                className="w-full py-2.5 rounded-xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Reserve Storage Space</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Reserve Modal */}
      {selectedWarehouse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-[#10b981] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-base font-black text-[#022c22]">Reserve Space: {selectedWarehouse.name}</h4>
              <button onClick={() => setSelectedWarehouse(null)} className="text-gray-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleBookStorage} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Crop to Store</label>
                <input 
                  type="text" 
                  value={cropName} 
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quantity (Tonnes)</label>
                  <input 
                    type="number" 
                    value={quantityTonnes} 
                    onChange={(e) => setQuantityTonnes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Duration (Months)</label>
                  <input 
                    type="number" 
                    value={durationMonths} 
                    onChange={(e) => setDurationMonths(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold" 
                  />
                </div>
              </div>

              <div className="bg-[#f6faf6] p-3 rounded-xl border border-[#10b981]/30 flex justify-between text-xs font-black">
                <span>Estimated Total Cost:</span>
                <span className="text-[#065f46]">
                  ₹{(parseFloat(quantityTonnes || '1') * selectedWarehouse.costPerTonPerMonth * parseInt(durationMonths || '1')).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedWarehouse(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#065f46] text-white text-xs font-black hover:bg-[#10b981]"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
