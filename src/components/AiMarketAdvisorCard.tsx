import React, { useState, useEffect } from 'react';
import { Crop, MandiPrice, Warehouse, BuyerDemand, AiRecommendation } from '../types.ts';
import { generateAiMarketAdvisorRecommendation } from '../services/aiAdvisor.ts';
import { Sparkles, TrendingUp, Archive, Users, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

interface Props {
  crop: Crop;
  mandiPrices: MandiPrice[];
  warehouses: Warehouse[];
  demands: BuyerDemand[];
  onExecuteAction?: (action: 'SELL_NOW' | 'STORE' | 'AGGREGATE') => void;
}

export const AiMarketAdvisorCard: React.FC<Props> = ({ crop, mandiPrices, warehouses, demands, onExecuteAction }) => {
  const [recommendation, setRecommendation] = useState<AiRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const loadRecommendation = async () => {
    setLoading(true);
    const rec = await generateAiMarketAdvisorRecommendation(
      crop,
      mandiPrices,
      warehouses,
      demands,
      import.meta.env.VITE_GEMINI_API_KEY
    );
    setRecommendation(rec);
    setLoading(false);
  };

  useEffect(() => {
    loadRecommendation();
  }, [crop]);

  // Simulate market dynamics changing over time if the user takes no action
  useEffect(() => {
    if (loading || !recommendation) return;
    
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 5000); // Check every 5 seconds for demo purposes

    return () => clearInterval(interval);
  }, [loading, recommendation]);

  useEffect(() => {
    if (!recommendation) return;

    if (timeElapsed === 2) { // After 10 seconds (2 * 5s)
      setRecommendation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          action: 'STORE',
          headline: 'Market Shift Detected: Store crop due to sudden price drop',
          reasoning: [
            ...prev.reasoning,
            'URGENT: Live market prices just dropped by 4% in your local Mandi.',
            'Quality is holding up well; storing for 2 weeks will yield better returns.'
          ],
          financialProjection: {
            ...prev.financialProjection,
            immediateSaleRevenue: prev.financialProjection.immediateSaleRevenue * 0.96
          }
        };
      });
    } else if (timeElapsed === 4) { // After 20 seconds
      setRecommendation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          action: 'AGGREGATE',
          headline: 'Quality Degrading: Aggregate with FPO to sell in bulk immediately',
          reasoning: [
            'URGENT: Freshness degrading. FPO bulk buyers are offering immediate pickup.',
            'Avoid storage costs and further quality degradation.'
          ]
        };
      });
    }
  }, [timeElapsed]);

  if (loading) {
    return (
      <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-xl text-center py-8">
        <Sparkles className="w-6 h-6 text-[#10b981] animate-spin mx-auto mb-2" />
        <span className="text-xs font-black text-[#065f46]">Gemini AI analyzing Mandi trends, storage costs & buyer demands...</span>
      </div>
    );
  }

  if (!recommendation) return null;

  const actionColors = {
    SELL_NOW: 'bg-emerald-600 text-white',
    STORE: 'bg-amber-600 text-white',
    AGGREGATE: 'bg-indigo-600 text-white'
  };

  const actionIcons = {
    SELL_NOW: <TrendingUp className="w-5 h-5" />,
    STORE: <Archive className="w-5 h-5" />,
    AGGREGATE: <Users className="w-5 h-5" />
  };

  return (
    <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-[#10b981]/40 shadow-2xl space-y-6">
      
      {/* Header & Action Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#10b981]/25 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest block">POWERED BY GEMINI AI</span>
            <h3 className="text-xl font-black text-[#022c22]">AI Market Decision Advisor</h3>
          </div>
        </div>

        <button 
          onClick={() => { setTimeElapsed(0); loadRecommendation(); }}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white border border-[#10b981]/30 text-xs font-extrabold text-[#065f46] hover:bg-[#e1f2e6] transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-analyze</span>
        </button>
      </div>

      {/* Primary Recommendation Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#065f46] to-[#022c22] text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-black bg-white/20 backdrop-blur-md">
            {actionIcons[recommendation.action]}
            <span>RECOMMENDED DECISION: {recommendation.action.replace('_', ' ')}</span>
          </div>
          <span className="text-xs font-bold text-[#a7f3d0]">
            Confidence: {recommendation.confidenceScore}%
          </span>
        </div>

        <h4 className="text-lg font-black text-white">{recommendation.headline}</h4>

        {/* Financial Projections Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-bold border-t border-white/20">
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
            <span className="text-[10px] text-[#a7f3d0] uppercase block font-semibold">IMMEDIATE SALE REVENUE</span>
            <span className="text-base font-black">₹{recommendation.financialProjection.immediateSaleRevenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
            <span className="text-[10px] text-[#a7f3d0] uppercase block font-semibold">PROJECTED STORAGE NET REVENUE</span>
            <span className="text-base font-black">₹{recommendation.financialProjection.projectedStorageRevenueNet.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Reasoning Bullet Points */}
      <div className="space-y-2">
        <h5 className="text-xs font-black text-[#022c22] uppercase tracking-wider">AI Rationale & Data Analysis:</h5>
        <ul className="space-y-2 text-xs text-[#065f46] font-semibold">
          {recommendation.reasoning.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-[#f6faf6] p-3 rounded-xl border border-[#10b981]/20">
              <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Steps & Execute Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#10b981]/20">
        <div className="text-xs text-gray-500 font-medium italic max-w-md">
          {recommendation.disclaimer}
        </div>

        {onExecuteAction && (
          <button
            onClick={() => onExecuteAction(recommendation.action)}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-102 ${actionColors[recommendation.action]}`}
          >
            <span>EXECUTE {recommendation.action.replace('_', ' ')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
