import React, { useState } from 'react';
import { FPO, FPOBulkOffer, FPOMember, Crop } from '../types';
import { BENCHMARK_FPOS } from '../services/marketData';
import { Users, Plus, CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  userCrops?: Crop[];
  onOfferCreated?: (offer: FPOBulkOffer) => void;
}

export const FpoManagementModule: React.FC<Props> = ({ userCrops = [], onOfferCreated }) => {
  const [fpos, setFpos] = useState<FPO[]>(BENCHMARK_FPOS);
  const [myFpo, setMyFpo] = useState<FPO | null>(BENCHMARK_FPOS[0]);
  const [activeTab, setActiveTab] = useState<'members' | 'aggregate' | 'bulk-offers'>('members');
  
  // Members produce state for single sample Tomato pool
  const [membersProduce, setMembersProduce] = useState<FPOMember[]>([
    { id: 1, fpoId: 1, farmerId: 1, farmerName: 'Ramesh Patil (Member)', cropName: 'Tomato', committedQuantity: 10000, unit: 'kg', joinedDate: '2026-08-20' },
    { id: 2, fpoId: 1, farmerId: 2, farmerName: 'Suresh Deshmukh (Member)', cropName: 'Tomato', committedQuantity: 10000, unit: 'kg', joinedDate: '2026-08-25' },
    { id: 3, fpoId: 1, farmerId: 3, farmerName: 'Ganesh (You)', cropName: 'Tomato', committedQuantity: 5000, unit: 'kg', joinedDate: '2026-09-01' }
  ]);

  const [bulkOffers, setBulkOffers] = useState<FPOBulkOffer[]>([
    {
      id: 901,
      fpoId: 1,
      fpoName: 'Sahyadri Farmer Producer Co. Ltd',
      cropName: 'Tomato',
      variety: 'Hybrid Grade A',
      totalQuantity: 25, // 25 Tonnes
      unit: 'Tonnes',
      grade: 'Grade A Fresh',
      askingPricePerUnit: 3450, // ₹3,450/Quintal = ₹34.50/kg
      location: 'Dindori Road Agri Cluster, Nashik, MH',
      lat: 20.0400,
      lng: 73.7500,
      status: 'ACTIVE',
      createdAt: '2026-09-05'
    }
  ]);

  // Form State
  const [newCropName, setNewCropName] = useState('Tomato');
  const [newQuantity, setNewQuantity] = useState('5000');
  const [successMsg, setSuccessMsg] = useState('');

  const totalAggregatedVolumeKg = membersProduce.reduce((acc, curr) => acc + curr.committedQuantity, 0);

  const handleCommitProduce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuantity) return;

    const newMember: FPOMember = {
      id: Date.now(),
      fpoId: myFpo?.id || 1,
      farmerId: 99,
      farmerName: 'Ganesh Setty (You)',
      cropName: newCropName,
      committedQuantity: parseFloat(newQuantity),
      unit: 'kg',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setMembersProduce([newMember, ...membersProduce]);
    setSuccessMsg('Your produce committed to FPO bulk pool successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreateBulkOffer = () => {
    if (!myFpo) return;
    const newOffer: FPOBulkOffer = {
      id: Date.now(),
      fpoId: myFpo.id,
      fpoName: myFpo.name,
      cropName: 'Organic Wheat',
      variety: 'Lokwan Grade A',
      totalQuantity: parseFloat((totalAggregatedVolumeKg / 1000).toFixed(1)),
      unit: 'Tonnes',
      grade: 'Grade A Export',
      askingPricePerUnit: 3250,
      location: `${myFpo.district}, ${myFpo.state}`,
      lat: myFpo.lat,
      lng: myFpo.lng,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setBulkOffers([newOffer, ...bulkOffers]);
    if (onOfferCreated) onOfferCreated(newOffer);
    setSuccessMsg('FPO Bulk Contract Offer published for wholesale buyers!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#10b981]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#10b981]" />
            <h3 className="text-xl font-black text-[#022c22]">FPO Aggregation & Bulk Bargaining</h3>
          </div>
          <p className="text-xs text-[#065f46] font-semibold mt-1">
            Pool produce with regional farmers to demand bulk price premiums (+15%) from enterprise buyers.
          </p>
        </div>

        {myFpo && (
          <div className="bg-[#e1f2e6] px-3.5 py-1.5 rounded-xl border border-[#10b981]/30 text-xs font-black text-[#065f46]">
            {myFpo.name} ({myFpo.totalMembers} Members)
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#065f46] text-white text-xs font-black flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#f6faf6] p-1.5 rounded-2xl border border-[#10b981]/20">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'members' ? 'bg-[#065f46] text-white shadow-sm' : 'text-[#065f46] hover:bg-[#e1f2e6]'
          }`}
        >
          1. Member Produce Pool
        </button>
        <button
          onClick={() => setActiveTab('aggregate')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'aggregate' ? 'bg-[#065f46] text-white shadow-sm' : 'text-[#065f46] hover:bg-[#e1f2e6]'
          }`}
        >
          2. Commit My Produce
        </button>
        <button
          onClick={() => setActiveTab('bulk-offers')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'bulk-offers' ? 'bg-[#065f46] text-white shadow-sm' : 'text-[#065f46] hover:bg-[#e1f2e6]'
          }`}
        >
          3. FPO Bulk Offers ({bulkOffers.length})
        </button>
      </div>

      {/* TAB 1: MEMBERS PRODUCE */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="bg-[#f6faf6] p-4 rounded-2xl border border-[#10b981]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black text-[#10b981] uppercase tracking-wider block">TOTAL POOL VOLUME</span>
              <span className="text-2xl font-black text-[#022c22]">
                {(totalAggregatedVolumeKg / 1000).toFixed(2)} Tonnes ({totalAggregatedVolumeKg.toLocaleString('en-IN')} kg)
              </span>
            </div>
            <button
              onClick={handleCreateBulkOffer}
              className="px-5 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black transition-colors flex items-center gap-2 shadow-md"
            >
              <span>Publish FPO Bulk Contract</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-[#10b981]/15 border border-[#10b981]/20 rounded-2xl overflow-hidden">
            {membersProduce.map((m) => (
              <div key={m.id} className="p-4 bg-white flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-extrabold text-[#022c22] block">{m.farmerName}</span>
                  <span className="text-gray-500 font-medium">{m.cropName} • Joined {m.joinedDate}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-[#065f46] text-sm block">{m.committedQuantity.toLocaleString('en-IN')} kg</span>
                  <span className="text-[10px] text-[#10b981] font-bold">Verified Member</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: COMMIT MY PRODUCE */}
      {activeTab === 'aggregate' && (
        <form onSubmit={handleCommitProduce} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-extrabold text-[#022c22] mb-1">Select Crop to Pool</label>
            <select
              value={newCropName}
              onChange={(e) => setNewCropName(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#10b981]/30 text-xs font-bold text-[#022c22] bg-white"
            >
              <option value="Organic Wheat">Organic Wheat</option>
              <option value="Red Onion (Kandhi)">Red Onion (Kandhi)</option>
              <option value="Fresh Tomato">Fresh Tomato</option>
              <option value="Sweet Yellow Corn">Sweet Yellow Corn</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#022c22] mb-1">Quantity to Commit (kg)</label>
            <input
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full p-3 rounded-xl border border-[#10b981]/30 text-xs font-bold text-[#022c22] bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Commit Produce to FPO Pool</span>
          </button>
        </form>
      )}

      {/* TAB 3: BULK OFFERS */}
      {activeTab === 'bulk-offers' && (
        <div className="grid grid-cols-1 gap-4">
          {bulkOffers.map((offer) => (
            <div key={offer.id} className="p-5 rounded-2xl bg-white border-1.5 border-[#10b981]/30 shadow-sm flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black text-[#10b981] bg-[#e1f2e6] px-2 py-0.5 rounded-md border border-[#10b981]/30">
                  {offer.fpoName}
                </span>
                <h4 className="text-base font-black text-[#022c22] mt-1">{offer.cropName} ({offer.variety})</h4>
                <p className="text-xs text-[#065f46] font-semibold">{offer.grade} • Location: {offer.location}</p>
              </div>

              <div className="text-right">
                <span className="text-xl font-black text-[#022c22] block">{offer.totalQuantity} {offer.unit}</span>
                <span className="text-xs font-extrabold text-[#10b981]">Asking: ₹{offer.askingPricePerUnit}/Quintal</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
