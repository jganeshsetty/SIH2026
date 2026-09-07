import React from 'react';
import { BuyerTrustProfile } from '../types';
import { BENCHMARK_BUYER_TRUST } from '../services/marketData';
import { ShieldCheck, Star, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  buyerId: number;
  buyerName?: string;
}

export const BuyerTrustBadge: React.FC<Props> = ({ buyerId, buyerName }) => {
  const profile: BuyerTrustProfile = BENCHMARK_BUYER_TRUST[buyerId] || {
    id: 99,
    buyerId,
    businessName: buyerName || 'Wholesale Buyer',
    verificationStatus: 'SELF_VERIFIED',
    gstinVerified: false,
    completedTransactionsCount: 18,
    cancelledTransactionsCount: 1,
    rating: 4.6,
    reviewsCount: 12,
    paymentEscrowReliabilityScore: 96.5
  };

  const isVerified = profile.verificationStatus === 'BUSINESS_VERIFIED';

  return (
    <div className="p-4 rounded-2xl bg-white border-1.5 border-[#10b981]/30 shadow-sm space-y-3">
      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-5 h-5 ${isVerified ? 'text-[#10b981]' : 'text-amber-500'}`} />
          <h4 className="text-xs font-black text-[#022c22]">{profile.businessName}</h4>
        </div>
        
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
          isVerified 
            ? 'bg-[#e1f2e6] text-[#065f46] border-[#10b981]/40' 
            : 'bg-amber-50 text-amber-700 border-amber-300'
        }`}>
          {profile.verificationStatus.replace('_', ' ')}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold bg-[#f6faf6] p-2.5 rounded-xl border border-[#10b981]/20">
        <div>
          <span className="text-[10px] text-gray-500 block uppercase">RATING</span>
          <span className="text-emerald-700 font-black flex items-center justify-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {profile.rating} / 5
          </span>
        </div>

        <div>
          <span className="text-[10px] text-gray-500 block uppercase">COMPLETED</span>
          <span className="text-[#022c22] font-black">{profile.completedTransactionsCount} Orders</span>
        </div>

        <div>
          <span className="text-[10px] text-gray-500 block uppercase">ESCROW SCORE</span>
          <span className="text-[#065f46] font-black">{profile.paymentEscrowReliabilityScore}%</span>
        </div>
      </div>

      {/* Verification Details */}
      <div className="flex items-center justify-between text-[10px] font-bold text-gray-600">
        <span>GSTIN Status: {profile.gstinVerified ? '✓ Verified GST' : 'Self-declared'}</span>
        <span>Cancellations: {profile.cancelledTransactionsCount}</span>
      </div>
    </div>
  );
};
