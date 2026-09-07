import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft, 
  Navigation, 
  Play, 
  Package,
  LogOut,
  Camera,
  ShieldCheck,
  Building,
  Warehouse,
  User,
  Upload,
  AlertCircle
} from 'lucide-react';
import { LiveTrackingMap } from '../components/LiveTrackingMap.tsx';
import { BotanicalParallaxBackground } from '../components/BotanicalParallaxBackground.tsx';

export interface DeliveryRequest {
  id: number;
  cropName: string;
  quantity: number;
  unit: string;
  farmerName: string;
  farmerLocation: string;
  buyerName: string;
  buyerLocation: string;
  pathType: 'Farmer → Buyer' | 'Farmer → FPO' | 'Farmer → Storehouse';
  distanceKm: number;
  farePayout: number;
  status: 'AVAILABLE' | 'ACCEPTED' | 'PICKUP' | 'QUALITY_VERIFIED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
  isAccepted: boolean;
  qualityVerification?: {
    isGradeAConfirmed: boolean;
    isMoistureCompliant: boolean;
    isPackagingOK: boolean;
    photoUrl: string;
    inspectedAt: string;
  };
}

const INITIAL_REQUESTS: DeliveryRequest[] = [
  {
    id: 701,
    cropName: 'Tomato (Grade A Hybrid)',
    quantity: 5000,
    unit: 'kg',
    farmerName: 'Ganesh (Farmer)',
    farmerLocation: 'Central Agro Zone, Nashik, Maharashtra',
    buyerName: 'Reliance Wholesale Agro Depot',
    buyerLocation: 'Mumbai Central Wholesale Depot, Maharashtra',
    pathType: 'Farmer → Buyer',
    distanceKm: 165,
    farePayout: 18500,
    status: 'AVAILABLE',
    isAccepted: false
  },
  {
    id: 702,
    cropName: 'Red Onion (Grade A Export)',
    quantity: 8000,
    unit: 'kg',
    farmerName: 'Ramesh Patil (Farmer)',
    farmerLocation: 'Narayangaon Farm, Pune, Maharashtra',
    buyerName: 'Thane Regional FPO Aggregation Hub',
    buyerLocation: 'Thane Agro Hub #2, Maharashtra',
    pathType: 'Farmer → FPO',
    distanceKm: 120,
    farePayout: 14200,
    status: 'AVAILABLE',
    isAccepted: false
  },
  {
    id: 703,
    cropName: 'Organic Potato',
    quantity: 10000,
    unit: 'kg',
    farmerName: 'Suresh Shinde (Farmer)',
    farmerLocation: 'Shirol Agri Zone, Kolhapur, Maharashtra',
    buyerName: 'Kisan Cold Storage Facility',
    buyerLocation: 'Pune Cold Storage Warehouse #4, Maharashtra',
    pathType: 'Farmer → Storehouse',
    distanceKm: 240,
    farePayout: 26000,
    status: 'AVAILABLE',
    isAccepted: false
  }
];

export const TransporterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, appUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');

  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>(() => {
    try {
      const saved = localStorage.getItem('farmora_delivery_requests');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_REQUESTS;
  });

  const [activeDelivery, setActiveDelivery] = useState<DeliveryRequest | null>(() => {
    try {
      const saved = localStorage.getItem('farmora_active_delivery');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // Quality Inspection Form State
  const [isGradeA, setIsGradeA] = useState(true);
  const [isMoistureOK, setIsMoistureOK] = useState(true);
  const [isPackagingOK, setIsPackagingOK] = useState(true);
  const [inspectionPhoto, setInspectionPhoto] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80');
  const [toastMsg, setToastMsg] = useState('');

  // Sync active delivery to localStorage for cross-portal visibility
  useEffect(() => {
    if (activeDelivery) {
      localStorage.setItem('farmora_active_delivery', JSON.stringify(activeDelivery));
      window.dispatchEvent(new Event('storage'));
    }
  }, [activeDelivery]);

  const handleAcceptDelivery = (delivery: DeliveryRequest) => {
    const updated: DeliveryRequest = {
      ...delivery,
      isAccepted: true,
      status: 'PICKUP'
    };

    setDeliveries(prev => prev.map(d => d.id === delivery.id ? updated : d));
    setActiveDelivery(updated);
    localStorage.setItem('farmora_delivery_requests', JSON.stringify(deliveries));
    localStorage.setItem('farmora_active_delivery', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    setToastMsg(`Delivery Request #${delivery.id} Accepted! Proceed to Farmer Pickup.`);
    setTimeout(() => {
      setToastMsg('');
      setActiveTab('active');
    }, 1500);
  };

  const handleVerifyQualityAndPickup = () => {
    if (!activeDelivery) return;

    const updated: DeliveryRequest = {
      ...activeDelivery,
      status: 'PICKED_UP',
      qualityVerification: {
        isGradeAConfirmed: isGradeA,
        isMoistureCompliant: isMoistureOK,
        isPackagingOK: isPackagingOK,
        photoUrl: inspectionPhoto,
        inspectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };

    setActiveDelivery(updated);
    setDeliveries(prev => prev.map(d => d.id === updated.id ? updated : d));
    localStorage.setItem('farmora_active_delivery', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    setToastMsg('Crop Quality Verified & Pickup Confirmed! Load added to truck.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleUpdateStatus = (newStatus: 'IN_TRANSIT' | 'DELIVERED') => {
    if (!activeDelivery) return;

    const updated: DeliveryRequest = {
      ...activeDelivery,
      status: newStatus
    };

    setActiveDelivery(updated);
    setDeliveries(prev => prev.map(d => d.id === updated.id ? updated : d));
    localStorage.setItem('farmora_active_delivery', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    if (newStatus === 'DELIVERED') {
      setToastMsg('Delivery Completed! Escrow released to Farmer & Fare deposited to Driver.');
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setInspectionPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f6faf6] text-[#101e17] pt-6 pb-20 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      
      {/* 3D Botanical Parallax Background */}
      <BotanicalParallaxBackground />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#065f46] text-white px-6 py-4 rounded-2xl shadow-2xl border border-[#10b981]/50 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
          <span className="text-xs font-black">{toastMsg}</span>
        </div>
      )}

      <div className="relative z-20 max-w-6xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="p-2.5 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 text-[#065f46] hover:bg-[#10b981] hover:text-white transition-all shadow-xs"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-white bg-[#065f46] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  FARMORA TRANSPORT PORTAL
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                  Freight Driver
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#022c22] mt-0.5">Agricultural Transportation Hub</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {appUser || user ? (
              <div className="flex items-center gap-2 bg-[#e1f2e6] px-3 py-1.5 rounded-2xl border border-[#10b981]/30 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {(appUser?.name || user?.displayName || user?.email || 'T')[0].toUpperCase()}
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <span className="text-xs font-bold text-[#022c22] block max-w-[140px] truncate">
                    {appUser?.name || user?.displayName || user?.email}
                  </span>
                  <span className="text-[10px] font-bold text-[#065f46] uppercase tracking-wider">Transport Driver</span>
                </div>
                <button
                  onClick={async () => { await logout(); navigate('/auth'); }}
                  title="Sign Out"
                  className="p-1.5 rounded-xl text-[#065f46] hover:bg-rose-100 hover:text-rose-600 transition-colors ml-1 flex items-center gap-1 font-bold text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Switcher */}
        <div className="bg-white/95 backdrop-blur-xl p-2 rounded-3xl border-1.5 border-[#10b981]/35 shadow-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'available' 
                  ? 'bg-[#065f46] text-white shadow-md' 
                  : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <Truck className="w-4 h-4 text-[#10b981]" />
              <span>Available Delivery Offers ({deliveries.filter(d => !d.isAccepted).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'active' 
                  ? 'bg-[#065f46] text-white shadow-md' 
                  : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <Navigation className="w-4 h-4 text-[#10b981]" />
              <span>Active Dispatch {activeDelivery ? '(1 Active)' : ''}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: AVAILABLE DELIVERIES */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#022c22]">Available Delivery Requests</h2>
                <p className="text-xs text-[#065f46] font-semibold">Select and accept agricultural freight jobs across regional supply chains.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {deliveries.map(del => (
                <div key={del.id} className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-white bg-[#065f46] px-2.5 py-0.5 rounded-md">
                        REQUEST #{del.id}
                      </span>

                      {/* Path Type Badge */}
                      <span className="text-[10px] font-black text-[#065f46] bg-[#e1f2e6] px-2.5 py-0.5 rounded-md border border-[#10b981]/30">
                        PATH: {del.pathType}
                      </span>

                      <span className="text-xs font-semibold text-[#065f46]">Distance: {del.distanceKm} km</span>
                    </div>

                    <h3 className="text-lg font-black text-[#022c22]">{del.cropName} ({del.quantity.toLocaleString('en-IN')} {del.unit})</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-[#065f46]">
                      <div className="flex items-start gap-1.5 bg-[#f6faf6] p-2.5 rounded-xl border border-gray-100">
                        <MapPin className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-gray-500 font-bold block uppercase">Producer Pickup</span>
                          <strong className="text-[#022c22]">{del.farmerName}</strong>
                          <span className="block text-gray-600 font-medium">{del.farmerLocation}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 bg-[#f6faf6] p-2.5 rounded-xl border border-gray-100">
                        <Navigation className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-gray-500 font-bold block uppercase">Delivery Destination</span>
                          <strong className="text-[#022c22]">{del.buyerName}</strong>
                          <span className="block text-gray-600 font-medium">{del.buyerLocation}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto text-right border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 flex flex-row md:flex-col items-center md:items-end justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 block uppercase">Driver Fare Compensation</span>
                      <span className="text-2xl font-black text-[#065f46]">₹{del.farePayout.toLocaleString('en-IN')}</span>
                    </div>

                    {del.isAccepted ? (
                      <div className="px-4 py-2 rounded-xl bg-[#e1f2e6] text-[#065f46] font-extrabold text-xs flex items-center gap-1.5 border border-[#10b981]/30">
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                        <span>ACCEPTED</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAcceptDelivery(del)}
                        className="px-6 py-3.5 rounded-2xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 border border-[#10b981]/40 cursor-pointer"
                      >
                        <Truck className="w-4 h-4 text-[#a7f3d0]" />
                        <span>ACCEPT DELIVERY OFFER</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE DISPATCH & QUALITY VERIFICATION */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            {!activeDelivery ? (
              <div className="p-12 text-center rounded-3xl bg-white/80 border-1.5 border-[#10b981]/30 shadow-md">
                <Truck className="w-12 h-12 text-[#10b981]/50 mx-auto mb-3" />
                <p className="text-sm font-extrabold text-[#065f46]">No active delivery selected. Accept an offer from Available Delivery Offers.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Active Delivery Status Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-xl space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#10b981]/20 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-white bg-[#065f46] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                          DISPATCH #{activeDelivery.id}
                        </span>
                        <span className="text-[10px] font-black text-[#065f46] bg-[#e1f2e6] px-2.5 py-0.5 rounded-md border border-[#10b981]/30">
                          {activeDelivery.pathType}
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-[#022c22] mt-1">{activeDelivery.cropName} ({activeDelivery.quantity.toLocaleString('en-IN')} {activeDelivery.unit})</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#10b981] text-white font-black text-xs shadow-xs">
                        STATUS: {activeDelivery.status}
                      </span>
                    </div>
                  </div>

                  {/* Route & Locations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#e1f2e6]/70 border border-[#10b981]/30 text-xs font-semibold text-[#065f46]">
                    <div>
                      <span className="text-[10px] font-black text-[#065f46]/70 uppercase block">FARMER PICKUP LOCATION</span>
                      <strong className="text-sm text-[#022c22] block">{activeDelivery.farmerName}</strong>
                      <span>{activeDelivery.farmerLocation}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-[#065f46]/70 uppercase block">DELIVERY DESTINATION ({activeDelivery.pathType})</span>
                      <strong className="text-sm text-[#022c22] block">{activeDelivery.buyerName}</strong>
                      <span>{activeDelivery.buyerLocation}</span>
                    </div>
                  </div>

                  {/* Real Interactive Leaflet Live Tracking Map */}
                  <LiveTrackingMap 
                    farmerLocationName={activeDelivery.farmerLocation}
                    buyerLocationName={activeDelivery.buyerLocation}
                    transporterName="Driver Ramesh Shinde (Your Vehicle)"
                    status={activeDelivery.status}
                    pathType={activeDelivery.pathType}
                    qualityVerified={!!activeDelivery.qualityVerification}
                  />

                  {/* STEP 1: CROP QUALITY INSPECTION AT PICKUP */}
                  {activeDelivery.status === 'PICKUP' && (
                    <div className="p-6 rounded-3xl bg-white border-2 border-[#10b981] shadow-lg space-y-5">
                      <div className="flex items-center gap-3 pb-3 border-b border-[#10b981]/20">
                        <div className="w-10 h-10 rounded-2xl bg-[#e1f2e6] flex items-center justify-center text-[#065f46]">
                          <Camera className="w-5 h-5 text-[#10b981]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-[#022c22]">Pickup Crop Quality Verification & Photo Inspection</h3>
                          <p className="text-xs text-[#065f46] font-semibold">Verify crop condition against farmer specs before loading into truck.</p>
                        </div>
                      </div>

                      {/* Checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="flex items-center gap-2 p-3 rounded-xl bg-[#f6faf6] border border-[#10b981]/30 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isGradeA}
                            onChange={(e) => setIsGradeA(e.target.checked)}
                            className="w-4 h-4 text-[#10b981] rounded focus:ring-0"
                          />
                          <span className="text-xs font-bold text-[#022c22]">Grade A Freshness Verified</span>
                        </label>

                        <label className="flex items-center gap-2 p-3 rounded-xl bg-[#f6faf6] border border-[#10b981]/30 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isMoistureOK}
                            onChange={(e) => setIsMoistureOK(e.target.checked)}
                            className="w-4 h-4 text-[#10b981] rounded focus:ring-0"
                          />
                          <span className="text-xs font-bold text-[#022c22]">Moisture & Temp Compliant</span>
                        </label>

                        <label className="flex items-center gap-2 p-3 rounded-xl bg-[#f6faf6] border border-[#10b981]/30 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isPackagingOK}
                            onChange={(e) => setIsPackagingOK(e.target.checked)}
                            className="w-4 h-4 text-[#10b981] rounded focus:ring-0"
                          />
                          <span className="text-xs font-bold text-[#022c22]">Crates & Sorting Approved</span>
                        </label>
                      </div>

                      {/* Photo Capture & Upload Box */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#f6faf6] border border-dashed border-[#10b981]/40">
                        <img src={inspectionPhoto} alt="Inspection Photo" className="w-28 h-28 rounded-xl object-cover border border-[#10b981]/30 shadow-xs" />
                        
                        <div className="space-y-2 flex-1 text-center sm:text-left">
                          <span className="text-xs font-black text-[#022c22] block">Capture / Upload Crop Quality Inspection Photo</span>
                          <p className="text-[11px] text-[#065f46]">Photo will be timestamped and saved to the consignment audit record.</p>
                          
                          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black cursor-pointer transition-all shadow-xs">
                            <Upload className="w-4 h-4" />
                            <span>Upload / Capture Photo</span>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={handleVerifyQualityAndPickup}
                        className="w-full py-4 rounded-2xl bg-[#065f46] hover:bg-[#10b981] text-white font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-5 h-5 text-[#a7f3d0]" />
                        <span>VERIFY CROP QUALITY & CONFIRM PICKUP</span>
                      </button>
                    </div>
                  )}

                  {/* Quality Verification Badge (If Completed) */}
                  {activeDelivery.qualityVerification && (
                    <div className="p-4 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 text-xs font-semibold text-[#065f46] flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={activeDelivery.qualityVerification.photoUrl} alt="Verified Crop" className="w-12 h-12 rounded-xl object-cover border border-[#10b981]/30" />
                        <div>
                          <span className="font-black text-[#022c22] block flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                            Crop Quality Verified at Pickup ({activeDelivery.qualityVerification.inspectedAt})
                          </span>
                          <span className="text-[11px] text-[#065f46]">
                            Grade A: Verified • Moisture: Compliant • Photo Audit attached.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    {activeDelivery.status === 'PICKED_UP' && (
                      <button
                        onClick={() => handleUpdateStatus('IN_TRANSIT')}
                        className="w-full py-4 rounded-2xl bg-[#10b981] hover:bg-[#047857] text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 border border-white/30 cursor-pointer"
                      >
                        <Play className="w-5 h-5" />
                        <span>START DELIVERY (IN TRANSIT)</span>
                      </button>
                    )}

                    {activeDelivery.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => handleUpdateStatus('DELIVERED')}
                        className="w-full py-4 rounded-2xl bg-[#022c22] hover:bg-black text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 border border-[#10b981]/40 cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                        <span>MARK AS DELIVERED</span>
                      </button>
                    )}

                    {activeDelivery.status === 'DELIVERED' && (
                      <div className="w-full p-4 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 text-[#065f46] text-center font-black text-sm flex items-center justify-center gap-2 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                        <span>DELIVERY COMPLETED • ESCROW RELEASED TO FARMER & FARE DEPOSITED</span>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
