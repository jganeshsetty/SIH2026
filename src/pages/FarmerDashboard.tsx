import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sprout, 
  PlusCircle, 
  FileText, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  ArrowLeft,
  LogOut,
  BarChart3,
  Target,
  Sparkles,
  Users,
  Archive,
  Layers,
  ChevronRight,
  Info,
  CreditCard,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { LiveTrackingMap } from '../components/LiveTrackingMap';
import { BotanicalParallaxBackground } from '../components/BotanicalParallaxBackground';
import { MarketIntelligenceModule } from '../components/MarketIntelligenceModule';
import { SmartMatchingWidget } from '../components/SmartMatchingWidget';
import { AiMarketAdvisorCard } from '../components/AiMarketAdvisorCard';
import { FpoManagementModule } from '../components/FpoManagementModule';
import { StorageDiscoveryModule } from '../components/StorageDiscoveryModule';
import { EcosystemMapView } from '../components/EcosystemMapView';
import { ChatWidget } from '../components/ChatWidget';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../i18n/LanguageContext';
import { RazorpayPaymentModal } from '../components/RazorpayPaymentModal';
import { BENCHMARK_MANDI_PRICES, BENCHMARK_WAREHOUSES, BENCHMARK_BUYER_DEMANDS } from '../services/marketData';
import { Crop as AppCrop } from '../types';

interface Crop {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  harvestDate: string;
  description: string;
  imageUrl?: string;
  quality?: string;
}

interface Offer {
  id: number;
  cropId: number;
  buyerName: string;
  cropName: string;
  offeredQuantity: number;
  offeredPrice: number;
  date: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

interface DeliveryOrder {
  id: number;
  cropName: string;
  buyerName: string;
  quantity: number;
  unit: string;
  status: 'ORDER_CONFIRMED' | 'PICKED_UP' | 'IN_TRANSIT' | 'NEAR_DESTINATION' | 'DELIVERED';
  transporterName: string;
  currentLocation: string;
  progressPercent: number;
}

export const FarmerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, appUser, token, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    'add-crop' | 'advisor' | 'buyers' | 'storage' | 'fpo' | 'demands' | 'map' | 'delivery'
  >('add-crop');

  // Listen for voice assistant tab navigation events
  useEffect(() => {
    const handleVoiceNav = (e: any) => {
      const target = e.detail?.tab;
      if (target && ['add-crop', 'advisor', 'buyers', 'storage', 'fpo', 'demands', 'map', 'delivery'].includes(target)) {
        setActiveTab(target);
      }
    };
    window.addEventListener('farmora_voice_tab_navigate', handleVoiceNav);
    return () => window.removeEventListener('farmora_voice_tab_navigate', handleVoiceNav);
  }, []);

  // Form State
  const [cropName, setCropName] = useState('Tomato');
  const [cropImage, setCropImage] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80');
  const [quantity, setQuantity] = useState('5000');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('32');
  const [quality, setQuality] = useState('Grade A Fresh');
  const [location, setLocation] = useState('Nashik, Maharashtra');
  const [harvestDate, setHarvestDate] = useState('2026-09-10');
  const [description, setDescription] = useState('Fresh field-picked hybrid tomatoes, Grade A sorted for wholesale procurement.');
  const [successMsg, setSuccessMsg] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState({ id: 2, name: 'Reliance Fresh Agro Procurement' });
  const [mockPaymentSuccess, setMockPaymentSuccess] = useState('');
  const [notification, setNotification] = useState('');
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [razorpayPaymentData, setRazorpayPaymentData] = useState<{ amount: number; description: string; cropName: string } | null>(null);

  // Active delivery dynamic state
  const [activeDelivery, setActiveDelivery] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('farmora_active_delivery');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // Single realistic sample example: Tomato | Grade A | 5000 kg | ₹32/kg | Nashik, Maharashtra
  const [crops, setCrops] = useState<Crop[]>([
    {
      id: 1,
      name: 'Tomato',
      quantity: 5000,
      unit: 'kg',
      pricePerUnit: 32,
      location: 'Nashik, Maharashtra',
      harvestDate: '2026-09-10',
      description: 'Fresh field-picked hybrid tomatoes, Grade A sorted for wholesale procurement.',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80',
      quality: 'Grade A Fresh'
    }
  ]);

  useEffect(() => {
    try {
      const buyerFormatted = crops.map(c => ({
        id: c.id,
        name: c.name,
        farmerName: appUser?.name || 'Ganesh (Farmer)',
        farmerLocation: c.location,
        quantity: c.quantity,
        unit: c.unit,
        pricePerUnit: c.pricePerUnit,
        description: c.description,
        imageUrl: c.imageUrl,
        quality: c.quality || 'Grade A Fresh'
      }));
      localStorage.setItem('farmora_crops', JSON.stringify(buyerFormatted));
    } catch (e) {}
  }, [crops, appUser]);

  // Single Realistic sample offers (loaded from localStorage)
  const [offers, setOffers] = useState<Offer[]>(() => {
    try {
      const saved = localStorage.getItem('farmora_offers');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 101,
        cropId: 1,
        buyerName: 'Reliance Fresh Agro Procurement',
        cropName: 'Tomato',
        offeredQuantity: 5000,
        offeredPrice: 170000, // ₹34/kg
        date: '2026-09-04',
        status: 'PENDING'
      }
    ];
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'farmora_offers') {
        try {
          if (e.newValue) {
            setOffers(JSON.parse(e.newValue));
            
            if (e.oldValue !== e.newValue && e.newValue.includes('PENDING')) {
              setNotification('New Buy Offer Received!');
              setTimeout(() => setNotification(''), 3500);
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
        setNotification('New Message Received from Buyer!');
        setTimeout(() => setNotification(''), 3500);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName || !quantity || !price) return;

    const newCropObj: Crop = {
      id: Date.now(),
      name: cropName,
      quantity: parseFloat(quantity),
      unit,
      pricePerUnit: parseFloat(price),
      location,
      harvestDate: harvestDate || '2026-09-10',
      description,
      imageUrl: cropImage || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80',
      quality
    };

    setCrops([newCropObj]);
    setSuccessMsg('Produce Listed Successfully! Running AI Market Analysis...');
    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('advisor');
    }, 1200);
  };

  const handleOfferAction = (offerId: number, newStatus: 'ACCEPTED' | 'REJECTED') => {
    const updatedOffers = offers.map(o => o.id === offerId ? { ...o, status: newStatus } : o);
    setOffers(updatedOffers);
    try {
      localStorage.setItem('farmora_offers', JSON.stringify(updatedOffers));
      
      if (newStatus === 'ACCEPTED') {
        const targetOffer = offers.find(o => o.id === offerId);
        const savedOrders = JSON.parse(localStorage.getItem('farmora_buyer_orders') || '[]');
        const updatedOrders = savedOrders.map((order: any) => 
          order.id === offerId ? { ...order, status: 'IN_TRANSIT' } : order
        );
        localStorage.setItem('farmora_buyer_orders', JSON.stringify(updatedOrders));

        const newDeliveryRequest = {
          id: Date.now(),
          cropName: targetOffer?.cropName || crops[0]?.name || 'Tomato',
          quantity: targetOffer?.offeredQuantity || 5000,
          unit: 'kg',
          farmerName: appUser?.name || 'Ganesh (Farmer)',
          farmerLocation: crops[0]?.location || 'Central Agro Zone, Nashik, Maharashtra',
          buyerName: targetOffer?.buyerName || 'Reliance Wholesale Agro Depot',
          buyerLocation: 'Mumbai Central Wholesale Depot, Maharashtra',
          pathType: 'Farmer → Buyer' as const,
          distanceKm: 165,
          farePayout: 18500,
          status: 'AVAILABLE' as const,
          isAccepted: false
        };

        const existingRequests = JSON.parse(localStorage.getItem('farmora_delivery_requests') || '[]');
        localStorage.setItem('farmora_delivery_requests', JSON.stringify([newDeliveryRequest, ...existingRequests]));

        if (token) {
          fetch('/api/transport/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(newDeliveryRequest)
          }).catch(() => {});
        }
      }
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  };

  const currentCropObj: AppCrop = {
    id: crops[0]?.id || 1,
    farmerId: appUser?.id || 1,
    name: crops[0]?.name || 'Tomato',
    variety: 'Hybrid Grade A',
    quantity: crops[0]?.quantity || 5000,
    unit: crops[0]?.unit || 'kg',
    expectedPrice: crops[0]?.pricePerUnit || 32,
    minPrice: (crops[0]?.pricePerUnit || 32) * 0.9,
    quality: crops[0]?.quality || 'Grade A Fresh',
    harvestDate: crops[0]?.harvestDate || '2026-09-10',
    pickupLocation: crops[0]?.location || 'Nashik, Maharashtra',
    lat: 20.0100,
    lng: 73.7900,
    deliveryAvailable: true,
    status: 'ACTIVE',
    createdAt: '2026-09-05'
  };

  const navItems = [
    { id: 'add-crop', label: t('farmer.tabAddCrop', '1. Add Harvest'), icon: PlusCircle },
    { id: 'advisor', label: t('farmer.tabAdvisor', '2. AI Market Advisor'), icon: Sparkles },
    { id: 'buyers', label: `${t('farmer.tabBuyers', '3. Direct Buyers')} (${offers.length})`, icon: FileText },
    { id: 'storage', label: t('farmer.tabStorage', '4. Cold Storage'), icon: Archive },
    { id: 'fpo', label: t('farmer.tabFpo', '5. FPO Aggregation'), icon: Users },
    { id: 'demands', label: t('farmer.tabDemands', '6. Buyer Demand'), icon: Target },
    { id: 'map', label: t('farmer.tabMaps', '7. Ecosystem Map'), icon: MapPin },
    { id: 'delivery', label: t('farmer.tabTransport', '8. Freight Tracking'), icon: Truck }
  ];

  return (
    <div className="relative min-h-screen bg-[#f6faf6] text-[#101e17] pt-5 pb-24 px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      
      {/* 3D Botanical Parallax overlay */}
      <BotanicalParallaxBackground />

      {/* Cross-Tab Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-[#10b981] text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-white" />
          <span className="text-sm font-black">{notification}</span>
        </div>
      )}

      <div className="relative z-20 max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Bar */}
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
                  {t('farmer.portalBadge', 'FARMORA FARMER PORTAL')}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                  {t('farmer.verifiedBadge', 'Verified Producer')}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#022c22] mt-0.5">
                {t('farmer.portalTitle', 'Farmer Intelligence & Trade Hub')}
              </h1>
            </div>
          </div>

          {/* User Profile Pill & Global Language Selector */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <LanguageSelector />

            {appUser || user ? (
              <div className="flex items-center gap-2 bg-[#e1f2e6] px-3 py-1.5 rounded-2xl border border-[#10b981]/30 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {(appUser?.name || user?.displayName || user?.email || 'F')[0].toUpperCase()}
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <span className="text-xs font-bold text-[#022c22] block max-w-[140px] truncate">
                    {appUser?.name || user?.displayName || user?.email}
                  </span>
                  <span className="text-[10px] font-bold text-[#065f46] uppercase tracking-wider">{t('farmer.accountLabel', 'Farmer Account')}</span>
                </div>
                <button
                  onClick={async () => { await logout(); navigate('/auth'); }}
                  title="Sign Out"
                  className="p-1.5 rounded-xl text-[#065f46] hover:bg-rose-100 hover:text-rose-600 transition-colors ml-1 flex items-center gap-1 font-bold text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">{t('common.logout', 'Logout')}</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* 8 Module Navigation Bar */}
        <div className="bg-white/95 backdrop-blur-xl p-2 rounded-3xl border-1.5 border-[#10b981]/35 shadow-md">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#065f46] text-white shadow-md shadow-[#065f46]/20'
                      : 'text-[#065f46] hover:bg-[#e1f2e6] hover:text-[#022c22]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#10b981]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PAGE 1: ADD CROP FORM */}
        {activeTab === 'add-crop' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border-1.5 border-[#10b981]/35 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#10b981]/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 flex items-center justify-center text-[#065f46]">
                    <Sprout className="w-6 h-6 text-[#10b981]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#022c22]">{t('farmer.addCropHeading', 'List Produce for Market AI Analysis')}</h2>
                    <p className="text-xs text-[#065f46] font-semibold">{t('farmer.addCropSubheading', 'Enter your harvest parameters to trigger instant AGMARKNET price matching and AI Sell/Store decisions.')}</p>
                  </div>
                </div>

                <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
                  {t('farmer.sampleLabel', 'Sample: Tomato')}
                </span>
              </div>

              {successMsg && (
                <div className="p-4 rounded-2xl bg-[#065f46] text-white font-extrabold text-xs flex items-center gap-2 shadow-md animate-in fade-in duration-200">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleAddCrop} className="space-y-5">
                
                {/* Crop Name & Quality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1.5">{t('farmer.cropNameLabel', 'Select Crop')} *</label>
                    <select
                      value={cropName}
                      onChange={(e) => setCropName(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    >
                      <option value="Tomato">{t('common.cropTomato', 'Tomato')}</option>
                      <option value="Wheat">{t('common.cropWheat', 'Wheat')}</option>
                      <option value="Onion">{t('common.cropOnion', 'Onion')}</option>
                      <option value="Potato">{t('common.cropPotato', 'Potato')}</option>
                      <option value="Rice">{t('common.cropRice', 'Rice')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1.5">{t('farmer.qualityGradeLabel', 'Quality / Grade')} *</label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    >
                      <option value="Grade A Fresh">{t('common.gradeAFresh', 'Grade A Fresh (Wholesale Standard)')}</option>
                      <option value="Grade A Organic">{t('common.gradeAOrganic', 'Grade A Organic (Certified)')}</option>
                      <option value="Export Grade (55mm+)">{t('common.gradeExport', 'Export Grade (55mm+)')}</option>
                      <option value="Standard Grade B">{t('common.gradeB', 'Standard Grade B')}</option>
                    </select>
                  </div>
                </div>

                {/* Quantity, Unit & Expected Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1.5">{t('farmer.quantityLabel', 'Quantity')} *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1.5">{t('farmer.unitLabel', 'Unit')} *</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    >
                      <option value="kg">{t('common.unitKg', 'Kilograms (kg)')}</option>
                      <option value="Quintal">{t('common.unitQuintal', 'Quintals (100 kg)')}</option>
                      <option value="Tonnes">{t('common.unitTonnes', 'Tonnes (1000 kg)')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1.5">{t('farmer.expectedPriceLabel', 'Cost per Unit (₹)')} *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 32"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Total Calculated Cost */}
                <div className="p-4 bg-[#e1f2e6] rounded-2xl border border-[#10b981]/40 flex justify-between items-center shadow-inner">
                  <span className="text-sm font-bold text-[#065f46]">{t('farmer.estimatedValue', 'Estimated Total Value')}</span>
                  <span className="text-lg font-black text-[#022c22]">
                    ₹{(parseFloat(quantity || '0') * parseFloat(price || '0')).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Location & Harvest Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1.5">{t('farmer.farmLocationLabel', 'Farm Pickup Location & District')} *</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1.5">{t('farmer.harvestDateLabel', 'Harvest / Readiness Date')} *</label>
                    <input
                      type="date"
                      required
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-black text-[#022c22] mb-1.5">{t('farmer.produceDescriptionLabel', 'Produce Description & Special Notes')}</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white resize-none"
                  />
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl bg-[#065f46] hover:bg-[#10b981] text-white text-sm font-black transition-all shadow-xl hover:shadow-[#10b981]/30 flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <Sprout className="w-5 h-5 text-[#a7f3d0]" />
                    <span>{t('farmer.submitCropBtn', 'List Produce & Run AI Market Decision Check')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PAGE 2: AI ADVISOR */}
        {activeTab === 'advisor' && (
          <AiMarketAdvisorCard 
            crop={currentCropObj}
            mandiPrices={BENCHMARK_MANDI_PRICES}
            warehouses={BENCHMARK_WAREHOUSES}
            demands={BENCHMARK_BUYER_DEMANDS}
            onExecuteAction={(act) => {
              if (act === 'SELL_NOW') setActiveTab('buyers');
              else if (act === 'STORE') setActiveTab('storage');
              else if (act === 'AGGREGATE') setActiveTab('fpo');
            }}
          />
        )}

        {/* PAGE 3: BUYERS (CROP UPLOAD TO BUYER PORTAL, LISTINGS & OFFERS) */}
        {activeTab === 'buyers' && (
          <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/95 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md">
              <div>
                <span className="text-[10px] font-black text-white bg-[#065f46] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {t('farmer.directMarketplaceBadge', 'DIRECT WHOLESALE MARKETPLACE')}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#022c22] mt-1">{t('farmer.marketplaceTitle', 'Farmer-to-Buyer Marketplace & Crop Upload')}</h2>
                <p className="text-xs text-[#065f46] font-semibold">{t('farmer.marketplaceDesc', 'Upload your crop details below to publish them directly to the Buyer Portal for wholesale procurement.')}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-300">
                  {crops.length} {t('farmer.cropListingsPublished', 'Crop Listing(s) Published')}
                </span>
                <span className="px-3.5 py-1.5 rounded-2xl bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
                  {offers.length} {t('farmer.buyerOffersReceived', 'Buyer Offer(s) Received')}
                </span>
              </div>
            </div>

            {/* SECTION 1: CROP UPLOAD FORM FOR BUYERS */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border-1.5 border-[#10b981]/35 shadow-xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#10b981]/20">
                <div className="w-10 h-10 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 flex items-center justify-center text-[#065f46]">
                  <PlusCircle className="w-5 h-5 text-[#10b981]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#022c22]">Upload & Publish Crop Details for Buyers</h3>
                  <p className="text-xs text-[#065f46] font-semibold">Crops submitted here become instantly visible to verified buyers on the Buyer Dashboard.</p>
                </div>
              </div>

              {successMsg && (
                <div className="p-4 rounded-2xl bg-[#065f46] text-white font-extrabold text-xs flex items-center gap-2 shadow-md animate-in fade-in duration-200">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleAddCrop} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1">Select Crop *</label>
                    <select
                      value={cropName}
                      onChange={(e) => setCropName(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    >
                      <option value="Tomato">Tomato</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Onion">Onion</option>
                      <option value="Potato">Potato</option>
                      <option value="Rice">Rice</option>
                      <option value="Grapes">Grapes</option>
                      <option value="Chili">Chili</option>
                      <option value="Soybean">Soybean</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1">Quality Grade *</label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    >
                      <option value="Grade A Fresh">Grade A Fresh (Wholesale Standard)</option>
                      <option value="Grade A Organic">Grade A Organic (Certified)</option>
                      <option value="Export Grade (55mm+)">Export Grade (55mm+)</option>
                      <option value="Standard Grade B">Standard Grade B</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1">Quantity *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1">Unit *</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="Quintal">Quintals (100 kg)</option>
                      <option value="Tonnes">Tonnes (1000 kg)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1">Asking Price per Unit (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 32"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#e1f2e6] rounded-2xl border border-[#10b981]/40 flex justify-between items-center">
                  <span className="text-xs font-bold text-[#065f46]">Total Listing Valuation for Buyers</span>
                  <span className="text-base font-black text-[#022c22]">
                    ₹{(parseFloat(quantity || '0') * parseFloat(price || '0')).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1">Farm Pickup Location & District *</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1">Harvest / Availability Date *</label>
                    <input
                      type="date"
                      required
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#022c22] mb-1">Produce Description & Buyer Instructions</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black transition-all shadow-xl hover:shadow-[#10b981]/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-300" />
                  <span>PUBLISH CROP DETAILS TO BUYER PORTAL</span>
                </button>
              </form>
            </div>

            {/* SECTION 2: PUBLISHED CROPS VISIBLE TO BUYERS */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#022c22]">Your Active Crop Listings (Visible on Buyer Portal)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {crops.map((c) => (
                  <div key={c.id} className="p-5 rounded-3xl bg-white/95 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md space-y-3">
                    <div className="flex items-start gap-4">
                      <img src={c.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80'} alt={c.name} className="w-20 h-20 rounded-2xl object-cover border border-[#10b981]/30 shadow-xs" />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            LIVE ON BUYER PORTAL
                          </span>
                          <span className="text-xs font-extrabold text-[#065f46]">₹{c.pricePerUnit}/{c.unit}</span>
                        </div>
                        <h4 className="text-base font-black text-[#022c22]">{c.name}</h4>
                        <p className="text-xs text-slate-600 font-semibold">
                          Grade: <span className="font-bold text-[#022c22]">{c.quality || 'Grade A Fresh'}</span> • Qty: <span className="font-bold text-[#022c22]">{c.quantity} {c.unit}</span>
                        </p>
                        <p className="text-xs text-slate-500 font-medium">{c.location}</p>
                      </div>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-900">Total Lot Valuation:</span>
                      <span className="font-black text-emerald-950">₹{(c.quantity * c.pricePerUnit).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: BUYER OFFERS RECEIVED & CHAT */}
            <div className="space-y-4 pt-4 border-t border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#022c22]">Buyer Offers Received for Your Crops</h3>
                  <p className="text-xs text-[#065f46] font-semibold">Offers and bids submitted by wholesale buyers viewing your published crop details.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                  {offers.length} Offer(s)
                </span>
              </div>

              {offers.map((offer) => (
                <div key={offer.id} className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-[#10b981] bg-[#e1f2e6] px-2 py-0.5 rounded border border-[#10b981]/30">
                        OFFER #{offer.id}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500">{offer.date}</span>
                    </div>
                    <h4 className="text-base font-black text-[#022c22]">{offer.buyerName}</h4>
                    <p className="text-xs text-[#065f46] font-semibold">
                      Commodity: <span className="font-bold text-[#022c22]">{offer.cropName}</span> • Offered Qty: <span className="font-bold text-[#022c22]">{offer.offeredQuantity} kg</span>
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500 font-bold block sm:text-right">Offered Deal Value</span>
                      <span className="text-xl font-black text-[#065f46]">₹{offer.offeredPrice.toLocaleString('en-IN')}</span>
                    </div>

                    {offer.status === 'PENDING' ? (
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => {
                            setChatRecipient({ id: offer.id, name: offer.buyerName });
                            setChatOpen(true);
                          }} 
                          className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          💬 Chat with Buyer
                        </button>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOfferAction(offer.id, 'ACCEPTED')} 
                            className="px-4 py-2 rounded-xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black transition-all shadow-xs flex-1 cursor-pointer"
                          >
                            Accept Offer
                          </button>
                          <button 
                            onClick={() => handleOfferAction(offer.id, 'REJECTED')} 
                            className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-700 text-xs font-bold transition-all flex-1 cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                        {offer.status === 'ACCEPTED' ? '✓ Accepted & Order Generated' : 'Declined'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* PAGE 4: STORAGE & PAYMENT */}
        {activeTab === 'storage' && (
          <div className="space-y-4">
            {mockPaymentSuccess === 'storage' && (
              <div className="p-4 rounded-2xl bg-[#065f46] text-white font-extrabold text-xs flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                  <span>Payment Successful! Storage space reserved.</span>
                </div>
                <button onClick={() => setMockPaymentSuccess('')} className="text-[#a7f3d0]">✕</button>
              </div>
            )}
            <div className="bg-white/95 backdrop-blur-xl p-4 rounded-3xl border-1.5 border-[#10b981]/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div>
                <span className="text-xs font-black text-[#10b981] uppercase tracking-wider block">RESERVE WAREHOUSE</span>
                <span className="text-sm font-black text-[#022c22]">Reserve storage for your {quantity} {unit} of {cropName}</span>
              </div>
              <button 
                onClick={() => {
                  setRazorpayPaymentData({
                    amount: 2500,
                    description: `Cold Storage Space Booking (${quantity} ${unit} ${cropName})`,
                    cropName: cropName || 'Tomato'
                  });
                  setRazorpayModalOpen(true);
                }}
                className="px-5 py-2.5 bg-[#065f46] text-white font-black text-xs rounded-xl shadow-md hover:bg-[#10b981] transition-all flex items-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay & Reserve Storage</span>
              </button>
            </div>
            <StorageDiscoveryModule userFarmerId={appUser?.id || 1} />
          </div>
        )}

        {/* PAGE 5: FPO BATCHING & FEES PAYMENT */}
        {activeTab === 'fpo' && (
          <div className="space-y-4">
            {mockPaymentSuccess === 'fpo' && (
              <div className="p-4 rounded-2xl bg-[#065f46] text-white font-extrabold text-xs flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                  <span>Payment Successful! Crops added to FPO pool.</span>
                </div>
                <button onClick={() => setMockPaymentSuccess('')} className="text-[#a7f3d0]">✕</button>
              </div>
            )}
            <div className="bg-white/95 backdrop-blur-xl p-4 rounded-3xl border-1.5 border-[#10b981]/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div>
                <span className="text-xs font-black text-[#10b981] uppercase tracking-wider block">FPO POOLING</span>
                <span className="text-sm font-black text-[#022c22]">Contribute {quantity} {unit} of {cropName} to regional FPO</span>
              </div>
              <button 
                onClick={() => {
                  setRazorpayPaymentData({
                    amount: 500,
                    description: `FPO Membership & Aggregation Fee (${cropName})`,
                    cropName: cropName || 'Tomato'
                  });
                  setRazorpayModalOpen(true);
                }}
                className="px-5 py-2.5 bg-[#065f46] text-white font-black text-xs rounded-xl shadow-md hover:bg-[#10b981] transition-all flex items-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay FPO Fees & Add Crop</span>
              </button>
            </div>
            <FpoManagementModule userCrops={crops.map(c => ({
              id: c.id,
              farmerId: appUser?.id || 1,
              name: c.name,
              variety: 'Hybrid Grade A',
              quantity: c.quantity,
              unit: c.unit,
              expectedPrice: c.pricePerUnit,
              minPrice: c.pricePerUnit * 0.9,
              quality: c.quality || 'Grade A Fresh',
              harvestDate: c.harvestDate,
              pickupLocation: c.location,
              lat: 20.0100,
              lng: 73.7900,
              deliveryAvailable: true,
              status: 'ACTIVE',
              createdAt: '2026-09-05'
            }))} />
          </div>
        )}

        {/* PAGE 6: BUYER DEMANDS (STRICTLY VIEW-ONLY / INFORMATIONAL) */}
        {activeTab === 'demands' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-emerald-800" />
                <div>
                  <h3 className="text-sm font-black text-[#022c22]">Live Market Buyer Demands (Informational View)</h3>
                  <p className="text-xs text-[#065f46]">Explore demand trends broadcasted by wholesale buyers to plan your harvests.</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Lock className="w-3 h-3" /> View Only
              </span>
            </div>

            {/* Smart Matching Widget without onSelectDemand (making it view-only without selling action buttons) */}
            <SmartMatchingWidget 
              crop={currentCropObj}
              demands={BENCHMARK_BUYER_DEMANDS}
            />
          </div>
        )}

        {/* PAGE 7: ECOSYSTEM MAP */}
        {activeTab === 'map' && (
          <EcosystemMapView />
        )}

        {/* PAGE 8: TRANSPORTATION & GPS TRACKING */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#022c22]">Transportation & Crop Delivery GPS</h2>
                <p className="text-xs text-[#065f46] font-semibold">Live driver tracking for accepted orders in delivery phase.</p>
              </div>
            </div>

            {/* Pickup OTP Code Banner */}
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-700" />
                <div>
                  <span className="text-xs font-black text-amber-900 uppercase block">{t('otp.pickupOtp', 'Farm Pickup OTP Code')}</span>
                  <span className="text-xs font-semibold text-amber-800">Provide this 4-digit code to your transport driver upon cargo pickup to verify handover.</span>
                </div>
              </div>
              <div className="px-4 py-2 bg-amber-950 text-amber-200 rounded-xl font-mono text-xl font-black tracking-widest border border-amber-400 shadow-inner">
                {activeDelivery?.pickupOtp || '8492'}
              </div>
            </div>

            {/* Quality Verification Audit Badge if verified by driver */}
            {activeDelivery?.qualityVerification && (
              <div className="p-4 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 text-xs font-semibold text-[#065f46] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={activeDelivery.qualityVerification.photoUrl} alt="Verified Crop Inspection" className="w-14 h-14 rounded-xl object-cover border border-[#10b981]/30 shadow-xs" />
                  <div>
                    <span className="font-black text-[#022c22] text-sm block flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                      Driver Crop Quality Inspection Completed ({activeDelivery.qualityVerification.inspectedAt})
                    </span>
                    <span className="text-[11px] text-[#065f46] block mt-0.5">
                      Grade A Freshness: Approved • Temperature & Moisture: Compliant • Photo Audit Attached.
                    </span>
                  </div>
                </div>
              </div>
            )}

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

      </div>

      {/* Persistent Market Intelligence Footer (Crop price details, previous rates & trends) */}
      <div className="max-w-7xl mx-auto mt-8 relative z-20">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#10b981]/30 shadow-xl mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-black text-[#022c22]">Live Market Intelligence & Historical Trends</h3>
          </div>
          <MarketIntelligenceModule selectedCrop={cropName || 'Tomato'} />
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        buyerName={chatRecipient.name}
        currentUserId={appUser?.id || 1}
        recipientId={chatRecipient.id}
      />

      {/* Razorpay Payment Modal */}
      {razorpayModalOpen && razorpayPaymentData && (
        <RazorpayPaymentModal
          isOpen={razorpayModalOpen}
          onClose={() => setRazorpayModalOpen(false)}
          amount={razorpayPaymentData.amount}
          itemTitle={razorpayPaymentData.description}
          onSuccess={() => {
            setRazorpayModalOpen(false);
            setMockPaymentSuccess(razorpayPaymentData.amount > 1000 ? 'storage' : 'fpo');
            setTimeout(() => setMockPaymentSuccess(''), 5000);
          }}
        />
      )}

    </div>
  );
};
