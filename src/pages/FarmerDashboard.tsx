import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
  Sprout, 
  PlusCircle, 
  FileText, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import { LiveTrackingMap } from '../components/LiveTrackingMap.tsx';
import { BotanicalParallaxBackground } from '../components/BotanicalParallaxBackground.tsx';

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
  const { appUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'add-crop' | 'my-offers' | 'delivery'>('add-crop');

  // Form State
  const [cropName, setCropName] = useState('');
  const [cropImage, setCropImage] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('Central Valley Farm, CA');
  const [harvestDate, setHarvestDate] = useState('');
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sample data states
  const [crops, setCrops] = useState<Crop[]>(() => {
    try {
      const saved = localStorage.getItem('farmora_crops');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit || 'kg',
          pricePerUnit: item.pricePerUnit,
          location: item.farmerLocation || item.location || 'Central Valley Farm',
          harvestDate: item.harvestDate || '2026-09-10',
          description: item.description || '',
          imageUrl: item.imageUrl
        }));
      }
    } catch (e) {}
    return [
      {
        id: 1,
        name: 'Organic Wheat',
        quantity: 500,
        unit: 'kg',
        pricePerUnit: 15,
        location: 'Green Acres Farm, Oregon',
        harvestDate: '2026-09-10',
        description: 'Premium organic golden wheat harvested fresh.',
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80'
      }
    ];
  });

  useEffect(() => {
    try {
      // Map to buyer format when syncing
      const buyerFormatted = crops.map(c => ({
        id: c.id,
        name: c.name,
        farmerName: 'Farmer Central',
        farmerLocation: c.location,
        quantity: c.quantity,
        unit: c.unit,
        pricePerUnit: c.pricePerUnit,
        description: c.description,
        imageUrl: c.imageUrl || 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&q=80'
      }));
      localStorage.setItem('farmora_crops', JSON.stringify(buyerFormatted));
    } catch (e) {}
  }, [crops]);

  const [offers, setOffers] = useState<Offer[]>([
    {
      id: 101,
      cropId: 1,
      buyerName: 'Apex Wholesale Produce',
      cropName: 'Organic Wheat',
      offeredQuantity: 500,
      offeredPrice: 7500,
      date: '2026-09-03',
      status: 'PENDING'
    }
  ]);

  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([
    {
      id: 201,
      cropName: 'Organic Wheat',
      buyerName: 'Apex Wholesale Produce',
      quantity: 500,
      unit: 'kg',
      status: 'IN_TRANSIT',
      transporterName: 'Express Logistics (Driver: Mark)',
      currentLocation: 'Interstate 95 - Mile 42',
      progressPercent: 65
    }
  ]);

  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName || !quantity || !price) return;

    const newCrop: Crop = {
      id: Date.now(),
      name: cropName,
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(price),
      location,
      harvestDate: harvestDate || new Date().toISOString().split('T')[0],
      description,
      imageUrl: cropImage || 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&q=80'
    };

    setCrops([newCrop, ...crops]);
    setSuccessMsg('Crop added successfully! Available for buyers now.');

    // Clear form
    setCropName('');
    setCropImage('');
    setQuantity('');
    setPrice('');
    setDescription('');

    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('my-offers');
    }, 1500);
  };

  const handleOfferStatus = (offerId: number, status: 'ACCEPTED' | 'REJECTED') => {
    setOffers(prev => prev.map(off => {
      if (off.id === offerId) {
        return { ...off, status };
      }
      return off;
    }));

    if (status === 'ACCEPTED') {
      const targetOffer = offers.find(o => o.id === offerId);
      if (targetOffer) {
        const newDelivery: DeliveryOrder = {
          id: Date.now(),
          cropName: targetOffer.cropName,
          buyerName: targetOffer.buyerName,
          quantity: targetOffer.offeredQuantity,
          unit: 'kg',
          status: 'ORDER_CONFIRMED',
          transporterName: 'Pending Driver Assignment',
          currentLocation: 'Farmer Hub Pickup Point',
          progressPercent: 15
        };
        setDeliveries([newDelivery, ...deliveries]);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f6faf6] text-[#101e17] pt-6 pb-20 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      
      {/* 3D Botanical Parallax overlay */}
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
              <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block">PRODUCER PORTAL</span>
              <h1 className="text-3xl font-black text-[#022c22]">Farmer Dashboard</h1>
            </div>
          </div>

          {/* Quick Tab Switcher Cards */}
          <div className="flex items-center gap-2 bg-white/85 backdrop-blur-xl p-1.5 rounded-2xl border-1.5 border-[#10b981]/35 shadow-md">
            <button
              onClick={() => setActiveTab('add-crop')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'add-crop' 
                  ? 'bg-[#065f46] text-white shadow-md' 
                  : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>1. ADD CROP</span>
            </button>

            <button
              onClick={() => setActiveTab('my-offers')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'my-offers' 
                  ? 'bg-[#065f46] text-white shadow-md' 
                  : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>2. MY OFFERS ({offers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('delivery')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'delivery' 
                  ? 'bg-[#065f46] text-white shadow-md' 
                  : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>3. DELIVERY ({deliveries.length})</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: ADD CROP */}
        {activeTab === 'add-crop' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border-1.5 border-[#10b981]/35 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#10b981]/20">
                <div className="w-11 h-11 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30 flex items-center justify-center text-[#065f46]">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#022c22]">List a New Crop</h2>
                  <p className="text-xs text-[#065f46]/90 font-semibold">Fill in details to make your harvest available to wholesale buyers.</p>
                </div>
              </div>

              {successMsg && (
                <div className="p-4 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/50 text-[#065f46] text-sm font-extrabold flex items-center gap-2 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleAddCrop} className="space-y-5">
                <div>
                  <label className="block text-xs font-extrabold text-[#065f46] uppercase mb-1">Crop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fresh Organic Tomatoes, Golden Wheat"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/90 border-1.5 border-[#10b981]/35 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 outline-none text-sm font-semibold text-[#022c22]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[#065f46] uppercase mb-1">Quantity *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 500"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/90 border-1.5 border-[#10b981]/35 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 outline-none text-sm font-semibold text-[#022c22]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#065f46] uppercase mb-1">Unit *</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/90 border-1.5 border-[#10b981]/35 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 outline-none text-sm font-semibold text-[#022c22]"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="tons">Tons</option>
                      <option value="quintals">Quintals</option>
                      <option value="crates">Crates</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[#065f46] uppercase mb-1">Expected Price ($ / unit) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 15"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/90 border-1.5 border-[#10b981]/35 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 outline-none text-sm font-semibold text-[#022c22]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#065f46] uppercase mb-1">Harvest Date</label>
                    <input
                      type="date"
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/90 border-1.5 border-[#10b981]/35 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 outline-none text-sm font-semibold text-[#022c22]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#065f46] uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/90 border-1.5 border-[#10b981]/35 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 outline-none text-sm font-semibold text-[#022c22]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#065f46] uppercase mb-1">Crop Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={cropImage}
                    onChange={(e) => setCropImage(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/90 border-1.5 border-[#10b981]/35 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 outline-none text-sm font-semibold text-[#022c22]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#065f46] uppercase mb-1">Crop Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe crop quality, organic status, moisture content..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/90 border-1.5 border-[#10b981]/35 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 outline-none text-sm font-semibold text-[#022c22]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-[#065f46] hover:bg-[#047857] text-white font-black text-base shadow-xl shadow-[#065f46]/20 transition-all flex items-center justify-center gap-2 border-1.5 border-[#10b981]/50"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>ADD CROP</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SECTION 2: MY OFFERS */}
        {activeTab === 'my-offers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#022c22]">Buyer Offers Received</h2>
              <span className="text-xs font-bold text-[#065f46] bg-[#e1f2e6] px-3 py-1 rounded-full border border-[#10b981]/30">
                {offers.length} Offer(s)
              </span>
            </div>

            {offers.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white/80 border-1.5 border-[#10b981]/30 shadow-md">
                <FileText className="w-12 h-12 text-[#10b981]/50 mx-auto mb-3" />
                <p className="text-sm font-extrabold text-[#065f46]">No offers received yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {offers.map(offer => (
                  <div key={offer.id} className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#10b981] uppercase tracking-wider bg-[#e1f2e6] px-2.5 py-0.5 rounded-md border border-[#10b981]/30">
                          OFFER #{offer.id}
                        </span>
                        <span className="text-xs text-[#065f46]/70 font-semibold">{offer.date}</span>
                      </div>

                      <h3 className="text-lg font-black text-[#022c22]">{offer.cropName}</h3>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-[#065f46]">
                        <div>
                          <span className="text-[#065f46]/70 block text-[10px] uppercase font-bold">BUYER</span>
                          <span className="font-extrabold text-[#022c22]">{offer.buyerName}</span>
                        </div>
                        <div>
                          <span className="text-[#065f46]/70 block text-[10px] uppercase font-bold">QUANTITY</span>
                          <span className="font-extrabold text-[#022c22]">{offer.offeredQuantity} kg</span>
                        </div>
                        <div>
                          <span className="text-[#065f46]/70 block text-[10px] uppercase font-bold">TOTAL OFFER</span>
                          <span className="font-black text-[#10b981]">${offer.offeredPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {offer.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleOfferStatus(offer.id, 'ACCEPTED')}
                            className="px-5 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#047857] text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 border border-white/30"
                          >
                            <Check className="w-4 h-4" />
                            <span>ACCEPT</span>
                          </button>
                          <button
                            onClick={() => handleOfferStatus(offer.id, 'REJECTED')}
                            className="px-5 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-black transition-all flex items-center gap-1.5 border border-rose-300"
                          >
                            <X className="w-4 h-4" />
                            <span>REJECT</span>
                          </button>
                        </>
                      )}

                      {offer.status === 'ACCEPTED' && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e1f2e6] text-[#065f46] font-black text-xs border border-[#10b981]/40">
                          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                          <span>ACCEPTED (ORDER IN DELIVERY)</span>
                        </div>
                      )}

                      {offer.status === 'REJECTED' && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-black text-xs border border-rose-200">
                          <XCircle className="w-4 h-4" />
                          <span>REJECTED</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: DELIVERY TRACKING */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#022c22]">Active Order Deliveries</h2>
              <span className="text-xs font-bold text-[#065f46] bg-[#e1f2e6] px-3 py-1 rounded-full border border-[#10b981]/30">
                {deliveries.length} Active Dispatch(es)
              </span>
            </div>

            {deliveries.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white/80 border-1.5 border-[#10b981]/30 shadow-md">
                <Truck className="w-12 h-12 text-[#10b981]/50 mx-auto mb-3" />
                <p className="text-sm font-extrabold text-[#065f46]">No active deliveries at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {deliveries.map(del => (
                  <div key={del.id} className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-lg space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#10b981]/20 pb-4">
                      <div>
                        <span className="text-[10px] font-black text-[#10b981] uppercase tracking-wider block">DISPATCH ORDER #{del.id}</span>
                        <h3 className="text-lg font-black text-[#022c22]">{del.cropName} ({del.quantity} {del.unit})</h3>
                        <p className="text-xs text-[#065f46]/90 font-semibold">Buyer: <strong>{del.buyerName}</strong></p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-[#10b981]/20 text-[#065f46] text-xs font-black border border-[#10b981]/40">
                          STATUS: {del.status}
                        </span>
                        <button
                          onClick={() => setSelectedDelivery(del)}
                          className="px-4 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md border border-[#10b981]/40"
                        >
                          <Truck className="w-4 h-4" />
                          <span>TRACK DELIVERY</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-[#065f46]">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#10b981]" />
                        <span>Transporter: <strong>{del.transporterName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#10b981]" />
                        <span>Current Location: <strong>{del.currentLocation}</strong></span>
                      </div>
                    </div>

                    {/* Interactive Leaflet Map Visual directly in card */}
                    <div className="pt-2">
                      <LiveTrackingMap 
                        farmerLocationName="Farmer Central Hub"
                        buyerLocationName={del.buyerName}
                        transporterName={del.transporterName}
                        status={del.status}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TRACKING MODAL */}
            {selectedDelivery && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white/95 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-1.5 border-[#10b981]/40 space-y-5">
                  <div className="flex items-center justify-between border-b border-[#10b981]/20 pb-4">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#10b981]" />
                      <h3 className="font-black text-lg text-[#022c22]">Live Delivery Telemetry Map</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedDelivery(null)}
                      className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Leaflet Live Tracking Map */}
                  <LiveTrackingMap 
                    farmerLocationName="Farmer Central Farm"
                    buyerLocationName={selectedDelivery.buyerName}
                    transporterName={selectedDelivery.transporterName}
                    status={selectedDelivery.status}
                  />

                  <button
                    onClick={() => setSelectedDelivery(null)}
                    className="w-full py-3.5 rounded-2xl bg-[#065f46] text-white font-black text-sm border border-[#10b981]/40"
                  >
                    CLOSE TRACKER
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
