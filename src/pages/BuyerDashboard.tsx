import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
  ShoppingBag, 
  Package, 
  Navigation, 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ChevronRight,
  Check,
  X,
  LogOut,
  PlusCircle,
  Target,
  BarChart3,
  Layers,
  Award
} from 'lucide-react';
import { LiveTrackingMap } from '../components/LiveTrackingMap.tsx';
import { BotanicalParallaxBackground } from '../components/BotanicalParallaxBackground.tsx';
import { BuyerTrustBadge } from '../components/BuyerTrustBadge.tsx';
import { SmartMatchingWidget } from '../components/SmartMatchingWidget.tsx';
import { EcosystemMapView } from '../components/EcosystemMapView.tsx';
import { BENCHMARK_BUYER_DEMANDS } from '../services/marketData.ts';
import { BuyerDemand, Crop as AppCrop } from '../types.ts';

interface AvailableCrop {
  id: number;
  name: string;
  farmerName: string;
  farmerLocation: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  description: string;
  imageUrl: string;
  status?: 'AVAILABLE' | 'ACCEPTED' | 'ORDER_CONFIRMED';
  quality?: string;
}

interface BuyerOrder {
  id: number;
  cropName: string;
  farmerName: string;
  farmerLocation: string;
  quantity: number;
  totalPrice: number;
  status: 'ORDER_CONFIRMED' | 'PICKED_UP' | 'IN_TRANSIT' | 'NEAR_DESTINATION' | 'DELIVERED';
  transporterName: string;
  currentLocation: string;
  estimatedArrival: string;
  buyerDestination: string;
}

const INITIAL_CROPS: AvailableCrop[] = [
  {
    id: 1,
    name: 'Tomato',
    farmerName: 'Ganesh (Farmer)',
    farmerLocation: 'Nashik, Maharashtra',
    quantity: 5000,
    unit: 'kg',
    pricePerUnit: 32,
    description: 'Fresh field-picked hybrid tomatoes, Grade A sorted for wholesale procurement.',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80',
    quality: 'Grade A Fresh'
  }
];

const INITIAL_ORDERS: BuyerOrder[] = [
  {
    id: 501,
    cropName: 'Tomato',
    farmerName: 'Ganesh (Farmer)',
    farmerLocation: 'Nashik, Maharashtra',
    quantity: 5000,
    totalPrice: 160000,
    status: 'IN_TRANSIT',
    transporterName: 'Kisan Express Logistics (Driver: Ramesh Shinde)',
    currentLocation: 'Mumbai-Nashik Express Highway - Mile 42',
    estimatedArrival: 'Today, 5:30 PM',
    buyerDestination: 'Mumbai Central Agro Depot, Maharashtra'
  }
];

export const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, appUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'available-crops' | 'post-demand' | 'my-demands' | 'my-orders' | 'live-tracking' | 'map'>('available-crops');

  // Demands state
  const [demands, setDemands] = useState<BuyerDemand[]>(BENCHMARK_BUYER_DEMANDS);

  // Form State for posting buyer demand
  const [cropName, setCropName] = useState('Tomato');
  const [variety, setVariety] = useState('Hybrid Grade A');
  const [quantity, setQuantity] = useState('5000');
  const [unit, setUnit] = useState('kg');
  const [requiredGrade, setRequiredGrade] = useState('Grade A Fresh');
  const [minPrice, setMinPrice] = useState('30');
  const [maxPrice, setMaxPrice] = useState('35');
  const [deliveryLocation, setDeliveryLocation] = useState('Mumbai Central Agro Depot, Maharashtra');
  const [requiredByDate, setRequiredByDate] = useState('2026-09-15');
  const [toastMsg, setToastMsg] = useState('');

  // Persistent crops list
  const [crops, setCrops] = useState<AvailableCrop[]>(() => {
    try {
      const saved = localStorage.getItem('farmora_crops');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CROPS;
  });

  const [myOrders, setMyOrders] = useState<BuyerOrder[]>(() => {
    try {
      const saved = localStorage.getItem('farmora_buyer_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_ORDERS;
  });

  const [selectedCrop, setSelectedCrop] = useState<AvailableCrop | null>(null);
  const [paymentStep, setPaymentStep] = useState<'review' | 'escrow' | 'success'>('review');

  const handlePostDemand = (e: React.FormEvent) => {
    e.preventDefault();
    const newDemand: BuyerDemand = {
      id: Date.now(),
      buyerId: appUser?.id || 2,
      buyerName: appUser?.name || 'Reliance Fresh Agro Procurement',
      cropName,
      variety,
      requiredQuantity: parseFloat(quantity) || 10000,
      unit,
      requiredGrade,
      targetMinPrice: parseFloat(minPrice) || 28,
      targetMaxPrice: parseFloat(maxPrice) || 34,
      deliveryLocation,
      lat: 19.0760,
      lng: 73.0048,
      requiredByDate: requiredByDate || '2026-09-25',
      status: 'OPEN',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setDemands([newDemand, ...demands]);
    setToastMsg('Buyer Demand Posted! Smart Matching enabled for Farmers & FPOs.');
    setTimeout(() => {
      setToastMsg('');
      setActiveTab('my-demands');
    }, 1500);
  };

  const processAcceptFarmerOffer = (crop: AvailableCrop) => {
    const totalPrice = crop.quantity * crop.pricePerUnit;
    const newOrder: BuyerOrder = {
      id: Date.now(),
      cropName: crop.name,
      farmerName: crop.farmerName,
      farmerLocation: crop.farmerLocation,
      quantity: crop.quantity,
      totalPrice,
      status: 'ORDER_CONFIRMED',
      transporterName: 'Express Freight Driver Mark',
      currentLocation: 'Farmer Hub Dispatch Point',
      estimatedArrival: 'Tomorrow, 2:00 PM',
      buyerDestination: 'Wholesale Depot Hub, Mumbai'
    };

    const updatedOrders = [newOrder, ...myOrders];
    setMyOrders(updatedOrders);
    try {
      localStorage.setItem('farmora_buyer_orders', JSON.stringify(updatedOrders));
    } catch (e) {}

    return newOrder;
  };

  return (
    <div className="relative min-h-screen bg-[#f6faf6] text-[#101e17] pt-6 pb-24 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      
      {/* 3D Botanical Parallax Background */}
      <BotanicalParallaxBackground />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#065f46] text-white px-6 py-4 rounded-2xl shadow-2xl border border-[#10b981]/50 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
          <span className="text-xs font-black">{toastMsg}</span>
        </div>
      )}

      <div className="relative z-20 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#10b981]/30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="p-2.5 rounded-2xl bg-white/80 border-1.5 border-[#10b981]/40 text-[#065f46] hover:bg-[#e1f2e6] transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block">WHOLESALE PROCUREMENT</span>
              <h1 className="text-3xl font-black text-[#022c22]">Buyer Procurement Hub</h1>
            </div>

            {user ? (
              <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-2xl border border-[#10b981]/30 shadow-sm ml-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full border border-[#10b981]" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#10b981] text-white flex items-center justify-center text-xs font-bold">
                    {(user.displayName || user.email || 'B')[0].toUpperCase()}
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

          {/* Tab Switcher */}
          <div className="flex flex-wrap items-center gap-2 bg-white/85 backdrop-blur-xl p-1.5 rounded-2xl border-1.5 border-[#10b981]/35 shadow-md text-xs font-extrabold">
            <button
              onClick={() => setActiveTab('available-crops')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'available-crops' ? 'bg-[#065f46] text-white shadow-sm' : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Available Produce</span>
            </button>

            <button
              onClick={() => setActiveTab('post-demand')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'post-demand' ? 'bg-[#065f46] text-white shadow-sm' : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-[#10b981]" />
              <span>Post Crop Demand</span>
            </button>

            <button
              onClick={() => setActiveTab('my-demands')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'my-demands' ? 'bg-[#065f46] text-white shadow-sm' : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Active Demands ({demands.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('my-orders')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'my-orders' ? 'bg-[#065f46] text-white shadow-sm' : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Orders ({myOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'map' ? 'bg-[#065f46] text-white shadow-sm' : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Map View</span>
            </button>
          </div>
        </div>

        {/* Buyer Trust Profile Banner */}
        <div className="mb-6">
          <BuyerTrustBadge buyerId={appUser?.id || 2} buyerName={appUser?.name} />
        </div>

        {/* TAB 1: AVAILABLE CROPS */}
        {activeTab === 'available-crops' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crops.map((crop) => (
              <div key={crop.id} className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-lg flex flex-col justify-between space-y-4">
                <div className="flex gap-4">
                  <img src={crop.imageUrl} alt={crop.name} className="w-24 h-24 rounded-2xl object-cover border border-[#10b981]/30" />
                  <div>
                    <span className="text-[10px] font-black text-[#10b981] bg-[#e1f2e6] px-2 py-0.5 rounded border border-[#10b981]/30">
                      {crop.quality || 'Grade A'}
                    </span>
                    <h3 className="text-lg font-black text-[#022c22] mt-1">{crop.name}</h3>
                    <p className="text-xs text-[#065f46] font-semibold">{crop.farmerName} • {crop.farmerLocation}</p>
                    <div className="mt-2 text-xs font-black text-[#022c22]">
                      {crop.quantity.toLocaleString('en-IN')} {crop.unit} @ ₹{crop.pricePerUnit}/unit
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { setSelectedCrop(crop); setPaymentStep('review'); }}
                  className="w-full py-3 rounded-2xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Buy Direct & Lock Escrow (₹{(crop.quantity * crop.pricePerUnit).toLocaleString('en-IN')})</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: POST CROP DEMAND */}
        {activeTab === 'post-demand' && (
          <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border-1.5 border-[#10b981]/35 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#10b981]/20">
              <div className="w-11 h-11 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46]">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#022c22]">Post Bulk Crop Requirement</h2>
                <p className="text-xs text-[#065f46] font-semibold">Broadcast grade specs to regional Farmers & FPOs with smart matching.</p>
              </div>
            </div>

            <form onSubmit={handlePostDemand} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#022c22] mb-1">Crop Name *</label>
                  <input
                    type="text"
                    required
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#10b981]/30 text-xs font-bold text-[#022c22]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#022c22] mb-1">Required Grade / Quality *</label>
                  <select
                    value={requiredGrade}
                    onChange={(e) => setRequiredGrade(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#10b981]/30 text-xs font-bold text-[#022c22]"
                  >
                    <option value="Grade A Premium">Grade A Premium</option>
                    <option value="Grade A Organic">Grade A Organic</option>
                    <option value="Export Grade (55mm+)">Export Grade (55mm+)</option>
                    <option value="Standard Grade B">Standard Grade B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#022c22] mb-1">Quantity (kg) *</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#10b981]/30 text-xs font-bold text-[#022c22]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#022c22] mb-1">Target Min Price (₹/kg)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#10b981]/30 text-xs font-bold text-[#022c22]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#022c22] mb-1">Target Max Price (₹/kg)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#10b981]/30 text-xs font-bold text-[#022c22]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#022c22] mb-1">Delivery Destination Hub</label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#10b981]/30 text-xs font-bold text-[#022c22]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Target className="w-5 h-5" />
                <span>Post Demand & Enable Smart Farmer Matching</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ACTIVE DEMANDS */}
        {activeTab === 'my-demands' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-[#022c22]">Active Buyer Demands & Matches</h2>
            {demands.map((demand) => (
              <div key={demand.id} className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-black text-[#10b981] bg-[#e1f2e6] px-2 py-0.5 rounded border border-[#10b981]/30">
                    DEMAND #{demand.id} • {demand.status}
                  </span>
                  <h3 className="text-lg font-black text-[#022c22] mt-1">{demand.cropName} ({demand.variety})</h3>
                  <p className="text-xs text-[#065f46] font-semibold">
                    Grade: {demand.requiredGrade} • Destination: {demand.deliveryLocation}
                  </p>
                  <p className="text-xs font-bold text-[#022c22] mt-1">
                    Required: {demand.requiredQuantity.toLocaleString('en-IN')} {demand.unit} @ ₹{demand.targetMinPrice} - ₹{demand.targetMaxPrice}/unit
                  </p>
                </div>

                <div className="bg-[#f6faf6] p-4 rounded-2xl border border-[#10b981]/30 text-center min-w-[140px]">
                  <span className="text-[10px] font-black text-[#10b981] block">MATCHED PRODUCERS</span>
                  <span className="text-2xl font-black text-[#022c22]">2 FPOs</span>
                  <span className="text-[10px] text-[#065f46] block font-bold mt-1">Match Score: 94%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: ORDERS */}
        {activeTab === 'my-orders' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-[#022c22]">Purchase Orders & Escrow Status</h2>
            {myOrders.map((order) => (
              <div key={order.id} className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-black text-[#022c22]">{order.cropName}</h4>
                  <p className="text-xs text-[#065f46] font-semibold">Supplier: {order.farmerName} • Destination: {order.buyerDestination}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[#022c22] block">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs font-extrabold text-[#10b981] bg-[#e1f2e6] px-2.5 py-1 rounded-lg border border-[#10b981]/30">
                    Escrow Locked • {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: MAP */}
        {activeTab === 'map' && (
          <EcosystemMapView />
        )}

        {/* Payment Modal */}
        {selectedCrop && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-[#10b981] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-black text-base text-[#022c22]">Escrow Payment Authorization</h3>
                <button onClick={() => setSelectedCrop(null)} className="text-gray-400 font-bold">✕</button>
              </div>

              {paymentStep === 'review' && (
                <div className="space-y-3 text-xs font-semibold text-[#065f46]">
                  <p>Crop: <span className="font-bold text-black">{selectedCrop.name}</span></p>
                  <p>Quantity: <span className="font-bold text-black">{selectedCrop.quantity} {selectedCrop.unit}</span></p>
                  <p>Total Escrow Lock: <span className="font-black text-[#065f46] text-base">₹{(selectedCrop.quantity * selectedCrop.pricePerUnit).toLocaleString('en-IN')}</span></p>

                  <button
                    onClick={() => {
                      processAcceptFarmerOffer(selectedCrop);
                      setPaymentStep('success');
                      setTimeout(() => {
                        setSelectedCrop(null);
                        setActiveTab('my-orders');
                      }, 1500);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-[#065f46] text-white font-black text-xs hover:bg-[#10b981]"
                  >
                    Confirm Escrow Lock & Dispatch
                  </button>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-[#10b981] mx-auto animate-bounce" />
                  <h4 className="font-black text-base text-[#022c22]">Escrow Payment Locked!</h4>
                  <p className="text-xs text-[#065f46]">Order created & driver dispatch notified.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
