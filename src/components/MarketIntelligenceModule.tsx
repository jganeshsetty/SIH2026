import React, { useState, useEffect } from 'react';
import { MandiPrice } from '../types.ts';
import { getMandiIntelligence } from '../services/marketData.ts';
import { TrendingUp, TrendingDown, MapPin, BarChart3, AlertCircle, Building2 } from 'lucide-react';

interface Props {
  selectedCrop?: string;
  onSelectMandiPrice?: (price: MandiPrice) => void;
}

export const MarketIntelligenceModule: React.FC<Props> = ({ selectedCrop, onSelectMandiPrice }) => {
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [source, setSource] = useState<'LIVE_AGMARKNET' | 'VERIFIED_BENCHMARK'>('VERIFIED_BENCHMARK');
  const [loading, setLoading] = useState(true);
  const [activeCropFilter, setActiveCropFilter] = useState(selectedCrop || 'All');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getMandiIntelligence(activeCropFilter === 'All' ? undefined : activeCropFilter);
      setPrices(res.prices);
      setSource(res.source);
      setLoading(false);
    }
    loadData();
  }, [activeCropFilter]);

  return (
    <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-xl space-y-6">
      
      {/* Header & Source Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#10b981]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#10b981]" />
            <h2 className="text-xl font-black text-[#022c22]">Market Intelligence & Mandi Prices</h2>
          </div>
          <p className="text-xs text-[#065f46] font-semibold mt-1">
            Real-time APMC Mandi price trends, modal rate variations, and arrival volumes.
          </p>
        </div>

        {/* Data Source Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#e1f2e6] text-[#065f46] border border-[#10b981]/30">
          <span className={`w-2 h-2 rounded-full ${source === 'LIVE_AGMARKNET' ? 'bg-green-500 animate-ping' : 'bg-amber-500'}`}></span>
          <span>{source === 'LIVE_AGMARKNET' ? 'LIVE AGMARKNET API' : 'VERIFIED BENCHMARK DATA'}</span>
        </div>
      </div>

      {/* Quick Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {['All', 'Tomato'].map((crop) => (
          <button
            key={crop}
            onClick={() => setActiveCropFilter(crop)}
            className={`px-3.5 py-1.5 rounded-xl transition-all border ${
              activeCropFilter === crop
                ? 'bg-[#065f46] text-white border-[#065f46] shadow-sm'
                : 'bg-white text-[#065f46] border-[#10b981]/30 hover:bg-[#e1f2e6]'
            }`}
          >
            {crop === 'All' ? 'All Mandis' : 'Sample: Tomato'}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-[#065f46]">
          Fetching latest Mandi rates...
        </div>
      ) : (
        /* Mandi Price Grid Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prices.map((mandi) => {
            const isPriceUp = mandi.modalPrice >= mandi.prevModalPrice;
            const diffPercent = Math.abs(((mandi.modalPrice - mandi.prevModalPrice) / mandi.prevModalPrice) * 100).toFixed(1);

            return (
              <div 
                key={mandi.id}
                onClick={() => onSelectMandiPrice && onSelectMandiPrice(mandi)}
                className="p-5 rounded-2xl bg-white border-1.5 border-[#10b981]/25 shadow-sm hover:shadow-md hover:border-[#10b981]/60 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#10b981] bg-[#e1f2e6] px-2 py-0.5 rounded-md border border-[#10b981]/30">
                      {mandi.district}, {mandi.state}
                    </span>
                    <span className={`text-xs font-black flex items-center gap-1 ${isPriceUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPriceUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {isPriceUp ? `+${diffPercent}%` : `-${diffPercent}%`}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-[#022c22] mb-1">{mandi.mandiName}</h3>
                  <p className="text-xs font-bold text-[#065f46]/80 mb-3">{mandi.cropName} ({mandi.variety})</p>

                  <div className="bg-[#f6faf6] p-3 rounded-xl border border-[#10b981]/20 flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#065f46]/70 uppercase block">MODAL PRICE</span>
                      <span className="text-xl font-black text-[#022c22]">₹{mandi.modalPrice}</span>
                      <span className="text-[10px] text-[#065f46] font-semibold"> / Quintal</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#065f46]/70 uppercase block">RANGE</span>
                      <span className="text-xs font-extrabold text-[#065f46]">₹{mandi.minPrice} - ₹{mandi.maxPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#10b981]/15 flex items-center justify-between text-[11px] font-bold text-[#065f46]">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#10b981]" />
                    Arrivals: {mandi.arrivalVolume} Tonnes
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">{mandi.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
