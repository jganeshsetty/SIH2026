import React from 'react';
import { Crop, BuyerDemand, FPOBulkOffer, MatchingResult } from '../types';
import { computeSmartMatchScore } from '../services/smartMatching';
import { Target, CheckCircle2, MapPin, Calendar, DollarSign, Award, ArrowRight } from 'lucide-react';

interface Props {
  crop: Crop | FPOBulkOffer;
  demands: BuyerDemand[];
  onSelectDemand?: (demand: BuyerDemand, match: MatchingResult) => void;
}

export const SmartMatchingWidget: React.FC<Props> = ({ crop, demands, onSelectDemand }) => {
  // Compute match score for all demands
  const matches = demands.map((demand) => ({
    demand,
    result: computeSmartMatchScore(crop, demand)
  })).sort((a, b) => b.result.matchScore - a.result.matchScore);

  return (
    <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-xl space-y-6">
      
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-[#10b981]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#10b981]" />
            <h3 className="text-xl font-black text-[#022c22]">Smart Farmer ↔ Buyer Matching Engine</h3>
          </div>
          <p className="text-xs text-[#065f46] font-semibold mt-1">
            Transparent algorithmic matching based on Crop, Quantity, Grade, Target Price, Location, and Required Date.
          </p>
        </div>
        <span className="text-xs font-black bg-[#e1f2e6] text-[#065f46] px-3 py-1 rounded-full border border-[#10b981]/30">
          {matches.length} Matched Demand(s)
        </span>
      </div>

      {/* Match Cards List */}
      <div className="space-y-4">
        {matches.map(({ demand, result }) => {
          const isHighMatch = result.matchScore >= 80;

          return (
            <div 
              key={demand.id}
              className="p-5 rounded-2xl bg-white border-1.5 border-[#10b981]/30 shadow-sm hover:shadow-md hover:border-[#10b981]/60 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              {/* Left Side: Demand Info & Breakdown */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-[#022c22] bg-[#e1f2e6] px-2.5 py-1 rounded-lg border border-[#10b981]/30">
                    {demand.buyerName}
                  </span>
                  <span className="text-xs font-bold text-[#065f46]">
                    Required by: {demand.requiredByDate}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-[#022c22]">
                    {demand.cropName} ({demand.variety})
                  </h4>
                  <p className="text-xs text-[#065f46] font-semibold mt-0.5">
                    Grade Requirement: <span className="font-extrabold text-[#022c22]">{demand.requiredGrade}</span>
                  </p>
                </div>

                {/* Score Breakdown Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold">
                  <div className="bg-[#f6faf6] p-2 rounded-lg border border-[#10b981]/20 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Target: ₹{demand.targetMinPrice} - ₹{demand.targetMaxPrice}/kg</span>
                  </div>
                  <div className="bg-[#f6faf6] p-2 rounded-lg border border-[#10b981]/20 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Qty: {demand.requiredQuantity} {demand.unit}</span>
                  </div>
                  <div className="bg-[#f6faf6] p-2 rounded-lg border border-[#10b981]/20 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>~{result.distanceKm} km away</span>
                  </div>
                  <div className="bg-[#f6faf6] p-2 rounded-lg border border-[#10b981]/20 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Grade Score: {result.gradeScore}%</span>
                  </div>
                </div>

                {/* Transparent Match Reasons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.reasons.map((reason, idx) => (
                    <span key={idx} className="text-[10px] font-extrabold text-[#065f46] bg-[#e1f2e6]/70 px-2 py-0.5 rounded-md">
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Side: Score Badge & CTA */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#f6faf6] border border-[#10b981]/30 min-w-[140px] text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#065f46]">MATCH SCORE</span>
                <span className={`text-3xl font-black ${isHighMatch ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {result.matchScore}%
                </span>
                
                {onSelectDemand && (
                  <button
                    onClick={() => onSelectDemand(demand, result)}
                    className="mt-3 px-4 py-2 rounded-xl text-xs font-black bg-[#065f46] hover:bg-[#10b981] text-white transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>Connect Offer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
