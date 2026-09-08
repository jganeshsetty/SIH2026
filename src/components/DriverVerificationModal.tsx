// src/components/DriverVerificationModal.tsx
import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Camera,
  ShieldCheck,
  RefreshCw,
  Award
} from 'lucide-react';

interface DriverVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'PICKUP_OTP' | 'QUALITY_REPORT' | 'DELIVERY_OTP';
  transportRequestId: number;
  cropName: string;
  onSuccess: (updatedRequest: any) => void;
}

export const DriverVerificationModal: React.FC<DriverVerificationModalProps> = ({
  isOpen,
  onClose,
  mode,
  transportRequestId,
  cropName,
  onSuccess
}) => {
  const { t } = useLanguage();
  const { token } = useAuth();

  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Quality Report Form State
  const [qualityGrade, setQualityGrade] = useState('Grade A Fresh');
  const [qualityQuantity, setQualityQuantity] = useState('1000');
  const [visibleDamage, setVisibleDamage] = useState('None (0%)');
  const [qualityRemarks, setQualityRemarks] = useState('Verified fresh farm produce, clean packaging at pickup.');
  const [cropPhotoUrl, setCropPhotoUrl] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80');

  if (!isOpen) return null;

  const handleVerifyOtp = async () => {
    if (!otpInput.trim() || otpInput.trim().length !== 4) {
      setErrorMsg('Please enter valid 4-digit OTP code');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const endpoint = mode === 'PICKUP_OTP' ? '/api/transport/verify-pickup-otp' : '/api/transport/verify-delivery-otp';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: transportRequestId,
          otp: otpInput.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'OTP Verification failed');
      }

      setSuccessMsg(mode === 'PICKUP_OTP' ? 'Pickup OTP Verified! Status updated to PICKED_UP' : 'Delivery OTP Verified! Delivery Completed');
      setTimeout(() => {
        onSuccess(data);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQualityReport = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/transport/quality-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: transportRequestId,
          cropPhotoUrl,
          qualityGrade,
          qualityQuantity: parseFloat(qualityQuantity) || 1000,
          visibleDamage,
          qualityRemarks
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Quality report submission failed');
      }

      setSuccessMsg('Quality verification report submitted & notifications sent!');
      setTimeout(() => {
        onSuccess(data);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Quality submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-600/30 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-emerald-800 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              {mode === 'QUALITY_REPORT' ? <Award className="w-4 h-4 text-emerald-300" /> : <KeyRound className="w-4 h-4 text-emerald-300" />}
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight">
                {mode === 'PICKUP_OTP' ? 'Farmer Pickup OTP Verification' :
                 mode === 'DELIVERY_OTP' ? 'Buyer Delivery OTP Verification' :
                 'Produce Quality & Photo Audit'}
              </h3>
              <p className="text-[11px] text-emerald-200 font-semibold">{cropName} • Job #{transportRequestId}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-xl text-white/80 hover:bg-white/20 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'PICKUP_OTP' || mode === 'DELIVERY_OTP' ? (
            /* OTP VERIFICATION MODE */
            <div className="space-y-4 text-center py-2">
              <p className="text-xs text-slate-600 font-medium">
                {mode === 'PICKUP_OTP'
                  ? 'Ask the Farmer for their 4-Digit Pickup OTP Code to authorize crop handover.'
                  : 'Ask the Buyer for their 4-Digit Delivery OTP Code to confirm destination handover.'}
              </p>

              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="0 0 0 0"
                  className="w-48 mx-auto tracking-widest text-center font-mono text-3xl font-black px-4 py-3 rounded-2xl border-2 border-emerald-600/40 focus:border-emerald-700 focus:outline-none bg-slate-50 text-slate-900 shadow-inner"
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Verify OTP Code</span>
              </button>
            </div>
          ) : (
            /* QUALITY REPORT FORM MODE */
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quality Grade</label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-emerald-600"
                >
                  <option value="Grade A Premium">Grade A Premium (Fresh, Unblemished)</option>
                  <option value="Grade A Fresh">Grade A Fresh (Standard Wholesale)</option>
                  <option value="Grade B Commercial">Grade B Commercial</option>
                  <option value="Organic Certified">Organic Certified</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Received Volume (kg)</label>
                  <input
                    type="number"
                    value={qualityQuantity}
                    onChange={(e) => setQualityQuantity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Visible Damage</label>
                  <select
                    value={visibleDamage}
                    onChange={(e) => setVisibleDamage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="None (0%)">None (0%)</option>
                    <option value="Minor (< 3%)">Minor (&lt; 3%)</option>
                    <option value="Moderate (5%)">Moderate (5%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Produce Evidence Photo URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cropPhotoUrl}
                    onChange={(e) => setCropPhotoUrl(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inspection Remarks</label>
                <textarea
                  rows={2}
                  value={qualityRemarks}
                  onChange={(e) => setQualityRemarks(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitQualityReport}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                <span>Submit Quality Certification & Notify Parties</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
