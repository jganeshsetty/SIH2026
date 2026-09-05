import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
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
  Info
} from 'lucide-react';
import { LiveTrackingMap } from '../components/LiveTrackingMap.tsx';
import { BotanicalParallaxBackground } from '../components/BotanicalParallaxBackground.tsx';
import { MarketIntelligenceModule } from '../components/MarketIntelligenceModule.tsx';
import { SmartMatchingWidget } from '../components/SmartMatchingWidget.tsx';
import { AiMarketAdvisorCard } from '../components/AiMarketAdvisorCard.tsx';
import { FpoManagementModule } from '../components/FpoManagementModule.tsx';
import { StorageDiscoveryModule } from '../components/StorageDiscoveryModule.tsx';
import { EcosystemMapView } from '../components/EcosystemMapView.tsx';
import { BENCHMARK_MANDI_PRICES, BENCHMARK_WAREHOUSES, BENCHMARK_BUYER_DEMANDS } from '../services/marketData.ts';
import { Crop as AppCrop } from '../types.ts';

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
  const { user, appUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'add-crop' | 'market-intel' | 'advisor' | 'smart-match' | 'fpo' | 'storage' | 'map' | 'my-offers' | 'delivery'
  >('add-crop');

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
        quality: c.quality || 'Grade A'
      }));
      localStorage.setItem('farmora_crops', JSON.stringify(buyerFormatted));
    } catch (e) {}
  }, [crops, appUser]);

  // Single realistic sample offer
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: 101,
      cropId: 1,
      buyerName: 'Fresh Basket Agro Procurement',
      cropName: 'Tomato',
      offeredQuantity: 5000,
      offeredPrice: 170000, // ₹34/kg
      date: '2026-09-05',
      status: 'PENDING'
    }
  ]);

  // Single realistic active delivery order
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([
    {
      id: 201,
      cropName: 'Tomato',
      buyerName: 'Fresh Basket Agro Procurement',
      quantity: 5000,
      unit: 'kg',
      status: 'IN_TRANSIT',
      transporterName: 'Kisan Express Logistics (Driver: Ramesh Shinde)',
      currentLocation: 'Mumbai-Nashik Express Highway - Mile 42',
      progressPercent: 60
    }
  ]);

  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);

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
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: newStatus } : o));

    if (newStatus === 'ACCEPTED') {
      const targetOffer = offers.find(o => o.id === offerId);
      if (targetOffer) {
        const newDelivery: DeliveryOrder = {
          id: Date.now(),
          cropName: targetOffer.cropName,
          buyerName: targetOffer.buyerName,
          quantity: targetOffer.offeredQuantity,
          unit: 'kg',
          status: 'ORDER_CONFIRMED',
          transporterName: 'Kisan Express Logistics (Driver: Ramesh Shinde)',
          currentLocation: 'Nashik Farmer Hub Pickup Point',
          progressPercent: 15
        };
        setDeliveries([newDelivery]);
      }
    }
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
    { id: 'add-crop', label: '1. Add Crop', icon: PlusCircle },
    { id: 'market-intel', label: '2. Mandi Rates', icon: BarChart3 },
    { id: 'advisor', label: '3. AI Advisor', icon: Sparkles },
    { id: 'smart-match', label: '4. Smart Match', icon: Target },
    { id: 'fpo', label: '5. FPO Hub', icon: Users },
    { id: 'storage', label: '6. Storage', icon: Archive },
    { id: 'map', label: '7. Ecosystem Map', icon: Layers },
    { id: 'my-offers', label: `8. Offers (${offers.length})`, icon: FileText },
    { id: 'delivery', label: `9. GPS Tracking (${deliveries.length})`, icon: Truck }
  ];

  return (
    <div className="relative min-h-screen bg-[#f6faf6] text-[#101e17] pt-5 pb-24 px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      
      {/* 3D Botanical Parallax overlay */}
      <BotanicalParallaxBackground />

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
                <span className="text-[10px] font-black text-white bg-[#065f46] px-2 py-0.5 rounded-md uppercase tracking-wider">
                  SIH26132 FARMER PORTAL
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                  Demo Sample Data
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#022c22] mt-0.5">Farmer Intelligence & Trade Hub</h1>
            </div>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {user ? (
              <div className="flex items-center gap-2 bg-[#e1f2e6] px-3 py-1.5 rounded-2xl border border-[#10b981]/30 shadow-xs">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full border border-[#10b981]" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#10b981] text-white flex items-center justify-center text-xs font-bold">
                    {(user.displayName || user.email || 'F')[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left leading-tight hidden sm:block">
                  <span className="text-xs font-bold text-[#022c22] block max-w-[120px] truncate">{user.displayName || user.email}</span>
                  <span className="text-[10px] font-bold text-[#065f46]">Farmer Account</span>
                </div>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  title="Sign Out"
                  className="p-1.5 rounded-xl text-[#065f46] hover:bg-rose-100 hover:text-rose-600 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Organized Module Navigation Bar */}
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

        {/* TAB 1: ADD CROP FORM */}
        {activeTab === 'add-crop' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border-1.5 border-[#10b981]/35 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#10b981]/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/40 flex items-center justify-center text-[#065f46]">
                    <Sprout className="w-6 h-6 text-[#10b981]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#022c22]">List Produce for Market AI Analysis</h2>
                    <p className="text-xs text-[#065f46] font-semibold">Enter your harvest parameters to trigger instant AGMARKNET price matching and AI Sell/Store decisions.</p>
                  </div>
                </div>

                <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
                  Sample: Tomato
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
                    <label className="block text-xs font-black text-[#022c22] mb-1.5">Crop Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tomato, Wheat, Onion"
                      value={cropName}
                      onChange={(e) => setCropName(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1.5">Quality / Grade *</label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    >
                      <option value="Grade A Fresh">Grade A Fresh (Wholesale Standard)</option>
                      <option value="Grade A Organic">Grade A Organic (Certified)</option>
                      <option value="Export Grade (55mm+)">Export Grade (55mm+)</option>
                      <option value="Standard Grade B">Standard Grade B</option>
                    </select>
                  </div>
                </div>

                {/* Quantity, Unit & Expected Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1.5">Quantity *</label>
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
                    <label className="block text-xs font-black text-[#022c22] mb-1.5">Unit *</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="Quintal">Quintals (100 kg)</option>
                      <option value="Tonnes">Tonnes (1000 kg)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1.5">Expected Price (₹/unit) *</label>
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

                {/* Location & Harvest Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1.5">Farm Pickup Location & District *</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-[#10b981]/30 text-xs font-bold bg-[#f6faf6] text-[#022c22] focus:outline-none focus:border-[#10b981] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#022c22] mb-1.5">Harvest / Readiness Date *</label>
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
                  <label className="block text-xs font-black text-[#022c22] mb-1.5">Produce Description & Special Notes</label>
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
                    <span>List Produce & Run AI Market Decision Check</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: MARKET INTELLIGENCE */}
        {activeTab === 'market-intel' && (
          <MarketIntelligenceModule 
            selectedCrop={crops[0]?.name || 'Tomato'} 
          />
        )}

        {/* TAB 3: AI ADVISOR */}
        {activeTab === 'advisor' && (
          <AiMarketAdvisorCard 
            crop={currentCropObj}
            mandiPrices={BENCHMARK_MANDI_PRICES}
            warehouses={BENCHMARK_WAREHOUSES}
            demands={BENCHMARK_BUYER_DEMANDS}
            onExecuteAction={(act) => {
              if (act === 'SELL_NOW') setActiveTab('smart-match');
              else if (act === 'STORE') setActiveTab('storage');
              else if (act === 'AGGREGATE') setActiveTab('fpo');
            }}
          />
        )}

        {/* TAB 4: SMART MATCHING */}
        {activeTab === 'smart-match' && (
          <SmartMatchingWidget 
            crop={currentCropObj}
            demands={BENCHMARK_BUYER_DEMANDS}
            onSelectDemand={(demand, match) => {
              setActiveTab('my-offers');
            }}
          />
        )}

        {/* TAB 5: FPO */}
        {activeTab === 'fpo' && (
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
        )}

        {/* TAB 6: STORAGE */}
        {activeTab === 'storage' && (
          <StorageDiscoveryModule userFarmerId={appUser?.id || 1} />
        )}

        {/* TAB 7: ECOSYSTEM MAP */}
        {activeTab === 'map' && (
          <EcosystemMapView />
        )}

        {/* TAB 8: MY OFFERS */}
        {activeTab === 'my-offers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#022c22]">Buyer Offers & Pending Transactions</h2>
                <p className="text-xs text-[#065f46] font-semibold">Incoming offers matching your Tomato harvest listing.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                1 Active Offer
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
                    Commodity: <span className="font-bold text-[#022c22]">{offer.cropName}</span> • Requested: <span className="font-bold text-[#022c22]">{offer.offeredQuantity} kg</span> (@ ₹34/kg)
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500 font-bold block sm:text-right">Total Deal Value</span>
                    <span className="text-xl font-black text-[#065f46]">₹{offer.offeredPrice.toLocaleString('en-IN')}</span>
                  </div>

                  {offer.status === 'PENDING' ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOfferAction(offer.id, 'ACCEPTED')} 
                        className="px-4 py-2 rounded-xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black transition-all shadow-xs"
                      >
                        Accept & Dispatch
                      </button>
                      <button 
                        onClick={() => handleOfferAction(offer.id, 'REJECTED')} 
                        className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-700 text-xs font-bold transition-all"
                      >
                        Decline
                      </button>
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
        )}

        {/* TAB 9: GPS DELIVERY TRACKING */}
        {activeTab === 'delivery' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#022c22]">Active Deliveries & GPS Telemetry</h2>
                <p className="text-xs text-[#065f46] font-semibold">Live GPS telematics tracking for orders in freight transit.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black border border-indigo-300">
                1 Active Shipment
              </span>
            </div>

            {deliveries.map((del) => (
              <div key={del.id} className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border-1.5 border-[#10b981]/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      SHIPMENT #{del.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black animate-pulse">
                      ● Live In-Transit
                    </span>
                  </div>
                  <h4 className="text-base font-black text-[#022c22]">{del.cropName} ({del.quantity} kg) → {del.buyerName}</h4>
                  <p className="text-xs text-[#065f46] font-semibold">{del.transporterName} • Current Checkpoint: {del.currentLocation}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full sm:w-72 bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
                    <div className="bg-[#10b981] h-2 rounded-full transition-all duration-500" style={{ width: `${del.progressPercent}%` }}></div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDelivery(del)}
                  className="px-5 py-3 rounded-2xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md self-start sm:self-auto"
                >
                  <Truck className="w-4 h-4" />
                  <span>Open Live GPS Telemetry</span>
                </button>
              </div>
            ))}

            {selectedDelivery && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 max-w-3xl w-full border-2 border-[#10b981] shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="font-black text-lg text-[#022c22]">Live Delivery Telemetry Map</h3>
                      <p className="text-xs text-[#065f46] font-bold">Route: Nashik Farmer Hub → Mumbai Central Agro Depot</p>
                    </div>
                    <button 
                      onClick={() => setSelectedDelivery(null)} 
                      className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <LiveTrackingMap 
                    farmerLocationName="Nashik Central Farm Hub"
                    buyerLocationName="Mumbai Wholesale Agro Depot"
                    transporterName={selectedDelivery.transporterName}
                    status={selectedDelivery.status}
                  />
                  <button onClick={() => setSelectedDelivery(null)} className="w-full py-3 rounded-2xl bg-[#065f46] text-white font-black text-xs">
                    Close Tracker
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

