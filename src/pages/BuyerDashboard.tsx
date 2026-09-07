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
  MessageCircle,
  Eye,
  Calendar,
  Clock
} from 'lucide-react';
import { LiveTrackingMap } from '../components/LiveTrackingMap.tsx';
import { BotanicalParallaxBackground } from '../components/BotanicalParallaxBackground.tsx';
import { BuyerTrustBadge } from '../components/BuyerTrustBadge.tsx';
import { EcosystemMapView } from '../components/EcosystemMapView.tsx';
import { ChatWidget } from '../components/ChatWidget.tsx';
import { BENCHMARK_BUYER_DEMANDS } from '../services/marketData.ts';
import { BuyerDemand } from '../types.ts';

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
  harvestDate?: string;
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
    quality: 'Grade A Fresh',
    harvestDate: '2026-09-10'
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
  const [activeTab, setActiveTab] = useState<'available-crops' | 'my-orders' | 'post-demand' | 'map' | 'delivery'>('available-crops');

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

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPartner, setChatPartner] = useState({ id: 1, name: 'Ganesh (Farmer)' });

  // Detail Modal State
  const [detailModalCrop, setDetailModalCrop] = useState<AvailableCrop | null>(null);

  // Active delivery dynamic state
  const [activeDelivery, setActiveDelivery] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('farmora_active_delivery');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

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

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'farmora_crops') {
        try {
          if (e.newValue) {
            setCrops(JSON.parse(e.newValue));
          }
        } catch (err) {}
      }
      if (e.key === 'farmora_buyer_orders') {
        try {
          if (e.newValue) {
            setMyOrders(JSON.parse(e.newValue));
            if (e.oldValue !== e.newValue && e.newValue.includes('IN_TRANSIT')) {
              setToastMsg('Farmer Accepted Your Order! Escrow processed.');
              setTimeout(() => setToastMsg(''), 3500);
            }
          }
        } catch (err) {}
      }
      if (e.key === 'farmora_active_delivery') {
        try {
          if (e.newValue) {
            setActiveDelivery(JSON.parse(e.newValue));
          }
        } catch (err) {}
      }
      if (e.key === 'farmora_chats') {
        setToastMsg('New Message Received from Farmer!');
        setTimeout(() => setToastMsg(''), 3500);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
    setToastMsg('Buyer Demand Posted! Smart Matching broadcasted to Farmers.');
    setTimeout(() => {
      setToastMsg('');
    }, 3000);
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
      transporterName: 'Kisan Express Logistics (Driver: Ramesh Shinde)',
      currentLocation: 'Farmer Hub Dispatch Point',
      estimatedArrival: 'Tomorrow, 2:00 PM',
      buyerDestination: 'Wholesale Depot Hub, Mumbai'
    };

    const updatedOrders = [newOrder, ...myOrders];
    setMyOrders(updatedOrders);
    try {
      localStorage.setItem('farmora_buyer_orders', JSON.stringify(updatedOrders));
      
      // Write Offer to 'farmora_offers' so the Farmer receives notification instantly
      const existingOffers = JSON.parse(localStorage.getItem('farmora_offers') || '[]');
      const newOffer = {
        id: newOrder.id,
        cropId: crop.id,
        buyerName: appUser?.name || 'Reliance Fresh Agro Procurement',
        cropName: crop.name,
        offeredQuantity: crop.quantity,
        offeredPrice: totalPrice,
        date: new Date().toISOString().split('T')[0],
        status: 'PENDING'
      };
      localStorage.setItem('farmora_offers', JSON.stringify([newOffer, ...existingOffers]));
      window.dispatchEvent(new Event('storage'));
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

      <div className="relative z-20 max-w-7xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-3xl bg-white/90 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md">
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
                  FARMORA BUYER PORTAL
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                  Wholesale Procurement
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#022c22] mt-0.5">Wholesale Procurement Hub</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {appUser || user ? (
              <div className="flex items-center gap-2 bg-[#e1f2e6] px-3 py-1.5 rounded-2xl border border-[#10b981]/30 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {(appUser?.name || user?.displayName || user?.email || 'B')[0].toUpperCase()}
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <span className="text-xs font-bold text-[#022c22] block max-w-[140px] truncate">
                    {appUser?.name || user?.displayName || user?.email}
                  </span>
                  <span className="text-[10px] font-bold text-[#065f46] uppercase tracking-wider">Buyer Account</span>
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

        {/* Strict 5-Page Tab Navigation Bar */}
        <div className="bg-white/95 backdrop-blur-xl p-2 rounded-3xl border-1.5 border-[#10b981]/35 shadow-md">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            
            <button
              onClick={() => setActiveTab('available-crops')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'available-crops'
                  ? 'bg-[#065f46] text-white shadow-md shadow-[#065f46]/20'
                  : 'text-[#065f46] hover:bg-[#e1f2e6] hover:text-[#022c22]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>1. Available Produce</span>
            </button>

            <button
              onClick={() => setActiveTab('my-orders')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'my-orders'
                  ? 'bg-[#065f46] text-white shadow-md shadow-[#065f46]/20'
                  : 'text-[#065f46] hover:bg-[#e1f2e6] hover:text-[#022c22]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>2. My Orders ({myOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('post-demand')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'post-demand'
                  ? 'bg-[#065f46] text-white shadow-md shadow-[#065f46]/20'
                  : 'text-[#065f46] hover:bg-[#e1f2e6] hover:text-[#022c22]'
              }`}
            >
              <Target className="w-4 h-4 text-[#10b981]" />
              <span>3. Buyer Demands</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'map'
                  ? 'bg-[#065f46] text-white shadow-md shadow-[#065f46]/20'
                  : 'text-[#065f46] hover:bg-[#e1f2e6] hover:text-[#022c22]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>4. Ecosystem Map</span>
            </button>

            <button
              onClick={() => setActiveTab('delivery')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'delivery'
                  ? 'bg-[#065f46] text-white shadow-md shadow-[#065f46]/20'
                  : 'text-[#065f46] hover:bg-[#e1f2e6] hover:text-[#022c22]'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>5. Transportation</span>
            </button>

          </div>
        </div>

        {/* Buyer Trust Badge Banner */}
        <BuyerTrustBadge buyerId={appUser?.id || 2} buyerName={appUser?.name} />

        {/* PAGE 1: AVAILABLE CROPS WITH DETAILS & CHAT */}
        {activeTab === 'available-crops' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#022c22]">Available Farmer Produce</h2>
                <p className="text-xs text-[#065f46] font-semibold">Direct listings from verified regional producers ready for procurement.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                {crops.length} Listed Harvest(s)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {crops.map((crop) => (
                <div key={crop.id} className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-lg flex flex-col justify-between space-y-4">
                  <div className="flex gap-4">
                    <img src={crop.imageUrl} alt={crop.name} className="w-24 h-24 rounded-2xl object-cover border border-[#10b981]/30 shadow-sm" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-[#10b981] bg-[#e1f2e6] px-2 py-0.5 rounded border border-[#10b981]/30">
                        {crop.quality || 'Grade A Fresh'}
                      </span>
                      <h3 className="text-lg font-black text-[#022c22]">{crop.name}</h3>
                      <p className="text-xs text-[#065f46] font-semibold">{crop.farmerName} • {crop.farmerLocation}</p>
                      <div className="mt-2 text-xs font-black text-[#022c22]">
                        {crop.quantity.toLocaleString('en-IN')} {crop.unit} @ ₹{crop.pricePerUnit}/unit
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 italic bg-[#f6faf6] p-2.5 rounded-xl border border-gray-100">
                    "{crop.description}"
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => setDetailModalCrop(crop)}
                      className="py-3 rounded-2xl bg-[#e1f2e6] hover:bg-[#10b981] hover:text-white text-[#065f46] text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details & Chat</span>
                    </button>

                    <button
                      onClick={() => { setSelectedCrop(crop); setPaymentStep('review'); }}
                      className="py-3 rounded-2xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Buy Direct (₹{(crop.quantity * crop.pricePerUnit).toLocaleString('en-IN')})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 2: MY ORDERS / TRANSACTIONS */}
        {activeTab === 'my-orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#022c22]">Purchase Orders & Escrow Status</h2>
                <p className="text-xs text-[#065f46] font-semibold">Track order confirmations, escrow payments, and supplier notifications.</p>
              </div>
            </div>

            {myOrders.map((order) => (
              <div key={order.id} className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-[#10b981] bg-[#e1f2e6] px-2 py-0.5 rounded border border-[#10b981]/30">
                      ORDER #{order.id}
                    </span>
                    <span className="text-[10px] font-bold text-[#065f46]">Supplier: {order.farmerName}</span>
                  </div>
                  <h4 className="text-lg font-black text-[#022c22]">{order.cropName} ({order.quantity.toLocaleString('en-IN')} kg)</h4>
                  <p className="text-xs text-[#065f46] font-semibold">Destination: {order.buyerDestination}</p>
                  <p className="text-xs text-gray-500 font-bold">Transporter: {order.transporterName}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#065f46] block">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                    <span className="text-xs font-extrabold text-[#10b981] bg-[#e1f2e6] px-2.5 py-1 rounded-lg border border-[#10b981]/30 inline-block mt-1">
                      Escrow Locked • {order.status}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('delivery')}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Live GPS</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGE 3: POST CROP DEMAND & ACTIVE DEMANDS LIST (MERGED) */}
        {activeTab === 'post-demand' && (
          <div className="space-y-8">
            
            {/* Top Section: Form */}
            <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border-1.5 border-[#10b981]/35 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#10b981]/20">
                <div className="w-12 h-12 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46]">
                  <Target className="w-6 h-6 text-[#10b981]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#022c22]">Post Bulk Crop Requirement</h2>
                  <p className="text-xs text-[#065f46] font-semibold">Broadcast specs to regional Farmers & FPOs with automated matching.</p>
                </div>
              </div>

              <form onSubmit={handlePostDemand} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1">Crop Name *</label>
                    <input
                      type="text"
                      required
                      value={cropName}
                      onChange={(e) => setCropName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#10b981]/30 text-xs font-bold text-[#022c22] bg-[#f6faf6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1">Required Grade / Quality *</label>
                    <select
                      value={requiredGrade}
                      onChange={(e) => setRequiredGrade(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#10b981]/30 text-xs font-bold text-[#022c22] bg-[#f6faf6]"
                    >
                      <option value="Grade A Fresh">Grade A Fresh</option>
                      <option value="Grade A Organic">Grade A Organic</option>
                      <option value="Export Grade (55mm+)">Export Grade (55mm+)</option>
                      <option value="Standard Grade B">Standard Grade B</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1">Quantity (kg) *</label>
                    <input
                      type="number"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#10b981]/30 text-xs font-bold text-[#022c22] bg-[#f6faf6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1">Target Min Price (₹/kg)</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#10b981]/30 text-xs font-bold text-[#022c22] bg-[#f6faf6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1">Target Max Price (₹/kg)</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#10b981]/30 text-xs font-bold text-[#022c22] bg-[#f6faf6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#022c22] mb-1">Delivery Destination Hub</label>
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#10b981]/30 text-xs font-bold text-[#022c22] bg-[#f6faf6]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Target className="w-5 h-5 text-[#a7f3d0]" />
                  <span>Post Demand & Enable Smart Farmer Matching</span>
                </button>
              </form>
            </div>

            {/* Bottom Section: Active Posted Demands List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#10b981]/20 pb-3">
                <h3 className="text-xl font-black text-[#022c22]">Your Active Posted Demands</h3>
                <span className="text-xs font-black bg-[#e1f2e6] text-[#065f46] px-3 py-1 rounded-full border border-[#10b981]/30">
                  {demands.length} Demands Live
                </span>
              </div>

              {demands.map((demand) => (
                <div key={demand.id} className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <span className="text-[10px] font-black text-[#10b981] bg-[#e1f2e6] px-2 py-0.5 rounded border border-[#10b981]/30">
                      DEMAND #{demand.id} • {demand.status}
                    </span>
                    <h4 className="text-lg font-black text-[#022c22] mt-1">{demand.cropName} ({demand.variety})</h4>
                    <p className="text-xs text-[#065f46] font-semibold">
                      Grade: {demand.requiredGrade} • Destination: {demand.deliveryLocation}
                    </p>
                    <p className="text-xs font-bold text-[#022c22] mt-1">
                      Required: {demand.requiredQuantity.toLocaleString('en-IN')} {demand.unit} @ ₹{demand.targetMinPrice} - ₹{demand.targetMaxPrice}/unit
                    </p>
                  </div>

                  <div className="bg-[#f6faf6] p-4 rounded-2xl border border-[#10b981]/30 text-center min-w-[150px]">
                    <span className="text-[10px] font-black text-[#10b981] block">MATCHED PRODUCERS</span>
                    <span className="text-2xl font-black text-[#022c22]">2 FPOs</span>
                    <span className="text-[10px] text-[#065f46] block font-bold mt-1">Match Score: 94%</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* PAGE 4: MAP VIEW */}
        {activeTab === 'map' && (
          <EcosystemMapView />
        )}

        {/* PAGE 5: TRANSPORTATION / LIVE TRACKING */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#022c22]">Live Transportation & Delivery GPS</h2>
                <p className="text-xs text-[#065f46] font-semibold">Real-time driver location and temperature-monitored transit tracking.</p>
              </div>
            </div>

            {/* Quality Verification Audit Badge if verified */}
            {activeDelivery?.qualityVerification && (
              <div className="p-4 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 text-xs font-semibold text-[#065f46] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={activeDelivery.qualityVerification.photoUrl} alt="Verified Crop" className="w-14 h-14 rounded-xl object-cover border border-[#10b981]/30 shadow-xs" />
                  <div>
                    <span className="font-black text-[#022c22] text-sm block flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                      Driver Quality Inspection Report Verified ({activeDelivery.qualityVerification.inspectedAt})
                    </span>
                    <span className="text-[11px] text-[#065f46] block mt-0.5">
                      Grade A Freshness: Approved • Temperature & Moisture: Compliant • Photo Audit Verified.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Live GPS Map */}
            <LiveTrackingMap 
              farmerLocationName={activeDelivery?.farmerLocation || 'Nashik Farmer Hub, Maharashtra'}
              buyerLocationName={activeDelivery?.buyerLocation || 'Mumbai Central Agro Depot, Maharashtra'}
              transporterName="Kisan Express Logistics (Driver: Ramesh Shinde)"
              status={activeDelivery?.status || 'IN_TRANSIT'}
              pathType={activeDelivery?.pathType || 'Farmer → Buyer'}
              qualityVerified={!!activeDelivery?.qualityVerification}
            />
          </div>
        )}

        {/* CROP DETAIL MODAL & CHAT TRIGGER */}
        {detailModalCrop && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full border-2 border-[#10b981] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <span className="text-[10px] font-black text-[#10b981] bg-[#e1f2e6] px-2 py-0.5 rounded border border-[#10b981]/30">
                    {detailModalCrop.quality || 'Grade A Fresh'}
                  </span>
                  <h3 className="font-black text-xl text-[#022c22] mt-1">{detailModalCrop.name} Details</h3>
                </div>
                <button onClick={() => setDetailModalCrop(null)} className="text-gray-400 hover:text-black font-bold p-1">✕</button>
              </div>

              <img src={detailModalCrop.imageUrl} alt={detailModalCrop.name} className="w-full h-48 rounded-2xl object-cover border border-[#10b981]/30 shadow-sm" />

              <div className="space-y-2 text-xs font-semibold text-[#065f46]">
                <p>Producer / Farmer: <span className="font-bold text-black">{detailModalCrop.farmerName}</span></p>
                <p>Location: <span className="font-bold text-black">{detailModalCrop.farmerLocation}</span></p>
                <p>Available Quantity: <span className="font-bold text-black">{detailModalCrop.quantity.toLocaleString('en-IN')} {detailModalCrop.unit}</span></p>
                <p>Price: <span className="font-bold text-[#065f46] text-base">₹{detailModalCrop.pricePerUnit} / {detailModalCrop.unit}</span></p>
                <p>Harvest Date: <span className="font-bold text-black">{detailModalCrop.harvestDate || '2026-09-10'}</span></p>
                <div className="p-3 bg-[#f6faf6] rounded-xl border border-gray-200 mt-2">
                  <span className="font-bold text-black block mb-1">Description & Quality Notes:</span>
                  <p className="text-gray-700 italic">{detailModalCrop.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <button
                  onClick={() => {
                    setChatPartner({ id: 1, name: detailModalCrop.farmerName });
                    setChatOpen(true);
                    setDetailModalCrop(null);
                  }}
                  className="py-3.5 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                  <span>💬 Chat with Farmer</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedCrop(detailModalCrop);
                    setPaymentStep('review');
                    setDetailModalCrop(null);
                  }}
                  className="py-3.5 rounded-2xl bg-[#065f46] hover:bg-[#10b981] text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Buy & Lock Escrow</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT / ESCROW MODAL */}
        {selectedCrop && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-[#10b981] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-black text-base text-[#022c22]">Escrow Payment Authorization</h3>
                <button onClick={() => setSelectedCrop(null)} className="text-gray-400 font-bold p-1">✕</button>
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
                    className="w-full py-3.5 rounded-2xl bg-[#065f46] text-white font-black text-xs hover:bg-[#10b981] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    <span>Confirm Escrow Lock & Dispatch</span>
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

      {/* CHAT WIDGET */}
      <ChatWidget
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        buyerName={chatPartner.name}
        currentUserId={appUser?.id || 2}
        recipientId={chatPartner.id}
      />

    </div>
  );
};
