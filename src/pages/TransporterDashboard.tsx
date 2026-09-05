import React, { useState } from 'react';
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
  LogOut
} from 'lucide-react';
import { LiveTrackingMap } from '../components/LiveTrackingMap.tsx';
import { BotanicalParallaxBackground } from '../components/BotanicalParallaxBackground.tsx';

interface DeliveryRequest {
  id: number;
  cropName: string;
  quantity: number;
  unit: string;
  farmerLocation: string;
  buyerLocation: string;
  distanceKm: number;
  status: 'ACCEPTED' | 'PICKUP' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
  isAccepted: boolean;
}

export const TransporterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, appUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');

  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([
    {
      id: 701,
      cropName: 'Tomato (Grade A Fresh)',
      quantity: 5000,
      unit: 'kg',
      farmerLocation: 'Central Agro Zone, Nashik, Maharashtra',
      buyerLocation: 'Mumbai Central Agro Depot, Maharashtra',
      distanceKm: 165,
      status: 'ACCEPTED',
      isAccepted: false
    }
  ]);

  const [activeDelivery, setActiveDelivery] = useState<DeliveryRequest | null>(null);

  const handleAcceptDelivery = (deliveryId: number) => {
    setDeliveries(prev => prev.map(del => {
      if (del.id === deliveryId) {
        const updated = { ...del, isAccepted: true, status: 'PICKUP' as const };
        setActiveDelivery(updated);
        return updated;
      }
      return del;
    }));

    setActiveTab('active');
  };

  const handleUpdateStatus = (newStatus: 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED') => {
    if (!activeDelivery) return;

    const updated = { ...activeDelivery, status: newStatus };
    setActiveDelivery(updated);

    setDeliveries(prev => prev.map(d => d.id === updated.id ? updated : d));

    if (newStatus === 'DELIVERED') {
      setTimeout(() => {
        alert('Delivery marked as DELIVERED! Escrow payout triggered for farmer.');
      }, 300);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f6faf6] text-[#101e17] pt-6 pb-20 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      
      {/* 3D Botanical Parallax Background */}
      <BotanicalParallaxBackground />

      <div className="relative z-20 max-w-6xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#10b981]/30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="p-2.5 rounded-2xl bg-white/80 border-1.5 border-[#10b981]/40 text-[#065f46] hover:bg-[#e1f2e6] transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block">FREIGHT DISPATCH</span>
              <h1 className="text-3xl font-black text-[#022c22]">Transportation Hub</h1>
            </div>

            {user ? (
              <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-2xl border border-[#10b981]/30 shadow-sm ml-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full border border-[#10b981]" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#10b981] text-white flex items-center justify-center text-xs font-bold">
                    {(user.displayName || user.email || 'T')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-[#022c22] max-w-[100px] truncate">{user.displayName || user.email}</span>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  title="Sign Out"
                  className="p-1 rounded-lg text-[#065f46] hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Switcher */}
          <div className="flex items-center gap-2 bg-white/85 backdrop-blur-xl p-1.5 rounded-2xl border-1.5 border-[#10b981]/35 shadow-md">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'available' 
                  ? 'bg-[#065f46] text-white shadow-md' 
                  : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Available Deliveries</span>
            </button>

            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'active' 
                  ? 'bg-[#065f46] text-white shadow-md' 
                  : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Active Delivery {activeDelivery ? '(1)' : ''}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: AVAILABLE DELIVERIES */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#022c22]">Available Deliveries</h2>
              <span className="text-xs font-bold text-[#065f46] bg-[#e1f2e6] px-3 py-1 rounded-full border border-[#10b981]/30">
                {deliveries.filter(d => !d.isAccepted).length} Request(s)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {deliveries.map(del => (
                <div key={del.id} className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-[#10b981] uppercase tracking-wider bg-[#e1f2e6] px-2.5 py-0.5 rounded-md border border-[#10b981]/30">
                        REQUEST #{del.id}
                      </span>
                      <span className="text-xs font-semibold text-[#065f46]">Distance: {del.distanceKm} km</span>
                    </div>

                    <h3 className="text-lg font-black text-[#022c22]">{del.cropName} ({del.quantity} {del.unit})</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-[#065f46]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#10b981] shrink-0" />
                        <span>Pickup: <strong>{del.farmerLocation}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-[#10b981] shrink-0" />
                        <span>Dropoff: <strong>{del.buyerLocation}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    {del.isAccepted ? (
                      <div className="px-4 py-2 rounded-xl bg-[#e1f2e6] text-[#065f46] font-extrabold text-xs flex items-center gap-1.5 border border-[#10b981]/30">
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                        <span>ACCEPTED (ACTIVE)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAcceptDelivery(del.id)}
                        className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 border border-[#10b981]/40"
                      >
                        <Truck className="w-4 h-4" />
                        <span>ACCEPT DELIVERY</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE DELIVERY */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            {!activeDelivery ? (
              <div className="p-12 text-center rounded-3xl bg-white/80 border-1.5 border-[#10b981]/30 shadow-md">
                <Truck className="w-12 h-12 text-[#10b981]/50 mx-auto mb-3" />
                <p className="text-sm font-extrabold text-[#065f46]">No active delivery selected. Accept a job from Available Deliveries.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Active Delivery Status Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-xl space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#10b981]/20 pb-4">
                    <div>
                      <span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest block">ACTIVE HIGHWAY DISPATCH</span>
                      <h2 className="text-2xl font-black text-[#022c22]">{activeDelivery.cropName} ({activeDelivery.quantity} {activeDelivery.unit})</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#10b981]/20 text-[#065f46] font-black text-xs border border-[#10b981]/30">
                        STATUS: {activeDelivery.status}
                      </span>
                    </div>
                  </div>

                  {/* Route & Locations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#e1f2e6]/70 border border-[#10b981]/30 text-xs font-semibold text-[#065f46]">
                    <div>
                      <span className="text-[10px] font-black text-[#065f46]/70 uppercase block">PICKUP LOCATION</span>
                      <strong className="text-sm text-[#022c22]">{activeDelivery.farmerLocation}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-[#065f46]/70 uppercase block">BUYER DESTINATION</span>
                      <strong className="text-sm text-[#022c22]">{activeDelivery.buyerLocation}</strong>
                    </div>
                  </div>

                  {/* Real Interactive Leaflet Live Tracking Map */}
                  <LiveTrackingMap 
                    farmerLocationName={activeDelivery.farmerLocation}
                    buyerLocationName={activeDelivery.buyerLocation}
                    transporterName="Driver Mark (Your Vehicle)"
                    status={activeDelivery.status}
                  />

                  {/* Action Controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    {activeDelivery.status === 'PICKUP' && (
                      <button
                        onClick={() => handleUpdateStatus('PICKED_UP')}
                        className="w-full py-4 rounded-2xl bg-[#065f46] hover:bg-[#047857] text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 border border-[#10b981]/40"
                      >
                        <Package className="w-5 h-5" />
                        <span>CONFIRM PICKUP FROM FARMER</span>
                      </button>
                    )}

                    {activeDelivery.status === 'PICKED_UP' && (
                      <button
                        onClick={() => handleUpdateStatus('IN_TRANSIT')}
                        className="w-full py-4 rounded-2xl bg-[#10b981] hover:bg-[#047857] text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 border border-white/30"
                      >
                        <Play className="w-5 h-5" />
                        <span>START DELIVERY (IN TRANSIT)</span>
                      </button>
                    )}

                    {activeDelivery.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => handleUpdateStatus('DELIVERED')}
                        className="w-full py-4 rounded-2xl bg-[#022c22] hover:bg-black text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 border border-[#10b981]/40"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                        <span>MARK AS DELIVERED</span>
                      </button>
                    )}

                    {activeDelivery.status === 'DELIVERED' && (
                      <div className="w-full p-4 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 text-[#065f46] text-center font-black text-sm flex items-center justify-center gap-2 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                        <span>DELIVERY COMPLETED & ESCROW RELEASED</span>
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
