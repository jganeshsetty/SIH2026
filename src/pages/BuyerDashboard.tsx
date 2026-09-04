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
  X
} from 'lucide-react';
import { LiveTrackingMap } from '../components/LiveTrackingMap.tsx';
import { BotanicalParallaxBackground } from '../components/BotanicalParallaxBackground.tsx';

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
    name: 'Organic Wheat',
    farmerName: 'John Green (Green Acres)',
    farmerLocation: 'Willamette Valley, Oregon',
    quantity: 500,
    unit: 'kg',
    pricePerUnit: 15,
    description: 'Single-estate organic golden wheat. Certified non-GMO.',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80'
  },
  {
    id: 2,
    name: 'Fresh Harvest Tomatoes',
    farmerName: 'Maria Silva (Valley Organics)',
    farmerLocation: 'Central Valley, California',
    quantity: 1200,
    unit: 'kg',
    pricePerUnit: 4,
    description: 'Vine-ripened roma tomatoes ready for immediate wholesale dispatch.',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80'
  },
  {
    id: 3,
    name: 'Sweet Yellow Corn',
    farmerName: 'Robert Vance (Vance Farms)',
    farmerLocation: 'Des Moines, Iowa',
    quantity: 800,
    unit: 'kg',
    pricePerUnit: 6,
    description: 'High-grade sweet corn, harvested at peak sweetness.',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&q=80'
  }
];

const INITIAL_ORDERS: BuyerOrder[] = [
  {
    id: 501,
    cropName: 'Organic Wheat',
    farmerName: 'John Green (Green Acres)',
    farmerLocation: 'Willamette Valley, Oregon',
    quantity: 500,
    totalPrice: 7500,
    status: 'IN_TRANSIT',
    transporterName: 'Express Highway Logistics (Driver: Mark)',
    currentLocation: 'Highway 101 North - Mile 88',
    estimatedArrival: 'Today, 4:30 PM',
    buyerDestination: 'Wholesale Depot Hub #4, Seattle'
  }
];

export const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'available-crops' | 'my-orders' | 'live-tracking'>('available-crops');

  // Persistent crops list
  const [crops, setCrops] = useState<AvailableCrop[]>(() => {
    try {
      const saved = localStorage.getItem('farmora_crops');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CROPS;
  });

  // Accepted crop IDs
  const [acceptedCropIds, setAcceptedCropIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('farmora_accepted_crops');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Persistent Orders for Buyer
  const [myOrders, setMyOrders] = useState<BuyerOrder[]>(() => {
    try {
      const saved = localStorage.getItem('farmora_buyer_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_ORDERS;
  });

  // Modal & Payment State
  const [selectedCrop, setSelectedCrop] = useState<AvailableCrop | null>(null);
  const [paymentStep, setPaymentStep] = useState<'review' | 'payment' | 'success'>('review');
  const [trackingOrder, setTrackingOrder] = useState<BuyerOrder | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('farmora_crops', JSON.stringify(crops));
    } catch (e) {}
  }, [crops]);

  useEffect(() => {
    try {
      localStorage.setItem('farmora_buyer_orders', JSON.stringify(myOrders));
    } catch (e) {}
  }, [myOrders]);

  useEffect(() => {
    try {
      localStorage.setItem('farmora_accepted_crops', JSON.stringify(acceptedCropIds));
    } catch (e) {}
  }, [acceptedCropIds]);

  // Core function to accept farmer offer and create order
  const processAcceptFarmerOffer = (cropToAccept: AvailableCrop): BuyerOrder => {
    const newOrder: BuyerOrder = {
      id: Date.now(),
      cropName: cropToAccept.name,
      farmerName: cropToAccept.farmerName,
      farmerLocation: cropToAccept.farmerLocation,
      quantity: cropToAccept.quantity,
      totalPrice: cropToAccept.quantity * cropToAccept.pricePerUnit,
      status: 'ORDER_CONFIRMED',
      transporterName: 'Express Highway Logistics',
      currentLocation: cropToAccept.farmerLocation,
      estimatedArrival: 'Tomorrow, 11:00 AM',
      buyerDestination: 'Primary Distribution Center'
    };

    // Update orders list
    const updatedOrders = [newOrder, ...myOrders];
    setMyOrders(updatedOrders);

    // Track accepted IDs
    const updatedAcceptedIds = [...acceptedCropIds, cropToAccept.id];
    setAcceptedCropIds(updatedAcceptedIds);

    // Mark crop status as ACCEPTED
    setCrops(prevCrops => 
      prevCrops.map(c => c.id === cropToAccept.id ? { ...c, status: 'ACCEPTED' } : c)
    );

    // Show toast message
    setToastMsg(`Farmer Offer for "${cropToAccept.name}" Accepted Successfully! Order created & Escrow locked.`);
    setTimeout(() => setToastMsg(null), 4000);

    return newOrder;
  };

  const handleDirectAcceptOffer = (crop: AvailableCrop) => {
    const newOrder = processAcceptFarmerOffer(crop);
    setTrackingOrder(newOrder);
  };

  const handleAcceptOfferModalNext = () => {
    setPaymentStep('payment');
  };

  const handleMakePaymentModal = () => {
    if (!selectedCrop) return;
    const newOrder = processAcceptFarmerOffer(selectedCrop);
    setPaymentStep('success');

    setTimeout(() => {
      setSelectedCrop(null);
      setPaymentStep('review');
      setActiveTab('live-tracking');
      setTrackingOrder(newOrder);
    }, 1800);
  };

  const activeTracking = trackingOrder || (myOrders.length > 0 ? myOrders[0] : null);

  return (
    <div className="relative min-h-screen bg-[#f6faf6] text-[#101e17] pt-6 pb-20 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      
      {/* 3D Botanical Parallax Background */}
      <BotanicalParallaxBackground />

      {/* Global Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#065f46] text-white px-6 py-4 rounded-2xl shadow-2xl border border-[#10b981]/50 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
          <span className="text-xs font-black">{toastMsg}</span>
        </div>
      )}

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
              <span className="text-xs font-black text-[#10b981] uppercase tracking-widest block">WHOLESALE PURCHASER</span>
              <h1 className="text-3xl font-black text-[#022c22]">Buyer Dashboard</h1>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-white/85 backdrop-blur-xl p-1.5 rounded-2xl border-1.5 border-[#10b981]/35 shadow-md">
            <button
              onClick={() => setActiveTab('available-crops')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'available-crops' 
                  ? 'bg-[#065f46] text-white shadow-md' 
                  : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>1. FARMER OFFERS ({crops.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('my-orders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'my-orders' 
                  ? 'bg-[#065f46] text-white shadow-md' 
                  : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>2. MY ORDERS ({myOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('live-tracking')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'live-tracking' 
                  ? 'bg-[#065f46] text-white shadow-md' 
                  : 'text-[#065f46] hover:bg-[#e1f2e6]'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>3. LIVE TRACKING</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: AVAILABLE CROPS & FARMER OFFERS */}
        {activeTab === 'available-crops' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#022c22]">Farmer Offers & Listings</h2>
                <p className="text-xs text-[#065f46] font-semibold">Review farmer prices and click "Accept Offer" to lock escrow and start dispatch.</p>
              </div>
              <span className="text-xs font-bold text-[#065f46] bg-[#e1f2e6] px-3 py-1 rounded-full border border-[#10b981]/30 shrink-0">
                {crops.length} Offer(s) Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {crops.map(crop => {
                const isAccepted = acceptedCropIds.includes(crop.id) || crop.status === 'ACCEPTED';
                const totalPrice = crop.quantity * crop.pricePerUnit;

                return (
                  <div key={crop.id} className="rounded-3xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/35 overflow-hidden shadow-lg hover:shadow-2xl hover:border-[#10b981]/60 transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="h-48 relative overflow-hidden bg-gray-100">
                        <img 
                          src={crop.imageUrl} 
                          alt={crop.name}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#065f46] font-black text-xs shadow-md border border-[#10b981]/30">
                          ${crop.pricePerUnit} / {crop.unit}
                        </div>
                        {isAccepted && (
                          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#10b981] text-white font-black text-xs shadow-md border border-white/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ACCEPTED</span>
                          </div>
                        )}
                      </div>

                      <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-lg text-[#022c22]">{crop.name}</h3>
                          <span className="text-xs font-black text-[#10b981] bg-[#e1f2e6] px-2.5 py-0.5 rounded-md border border-[#10b981]/30">
                            ${totalPrice} Total
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-[#065f46]/90 space-y-1">
                          <p className="flex items-center gap-1.5">
                            <span className="text-[#065f46]/70">Farmer:</span>
                            <strong className="text-[#022c22]">{crop.farmerName}</strong>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#10b981]" />
                            <span>{crop.farmerLocation}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <span className="text-[#065f46]/70">Available Lot:</span>
                            <strong className="text-[#10b981]">{crop.quantity} {crop.unit}</strong>
                          </p>
                        </div>

                        <p className="text-xs text-gray-600 font-medium line-clamp-2">{crop.description}</p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 space-y-2">
                      {isAccepted ? (
                        <button
                          onClick={() => {
                            setActiveTab('live-tracking');
                          }}
                          className="w-full py-3.5 rounded-2xl bg-[#e1f2e6] text-[#065f46] font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2 border border-[#10b981]/40"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                          <span>OFFER ACCEPTED • TRACK ORDER</span>
                        </button>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <button
                            onClick={() => handleDirectAcceptOffer(crop)}
                            className="w-full py-3 rounded-2xl bg-[#10b981] hover:bg-[#047857] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 border border-white/30"
                          >
                            <Check className="w-4 h-4" />
                            <span>ACCEPT OFFER</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedCrop(crop);
                              setPaymentStep('review');
                            }}
                            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/90 hover:bg-[#e1f2e6] text-[#065f46] font-black text-xs shadow-sm transition-all flex items-center justify-center gap-1 border border-[#10b981]/40 shrink-0"
                          >
                            <span>DETAILS</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL: ACCEPT OFFER & PAYMENT SCREEN */}
        {selectedCrop && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white/95 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-1.5 border-[#10b981]/40 space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#10b981]/20 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#10b981]" />
                  <h3 className="font-black text-lg text-[#022c22]">
                    {paymentStep === 'review' && 'Accept Farmer Offer'}
                    {paymentStep === 'payment' && 'Escrow Payment'}
                    {paymentStep === 'success' && 'Order Confirmed!'}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedCrop(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* STEP 1: REVIEW OFFER */}
              {paymentStep === 'review' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#e1f2e6]/70 border border-[#10b981]/30 space-y-2 text-sm text-[#065f46]">
                    <div className="flex justify-between">
                      <span className="text-xs text-[#065f46]/70 uppercase font-bold">Crop</span>
                      <strong className="text-[#022c22]">{selectedCrop.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[#065f46]/70 uppercase font-bold">Farmer</span>
                      <strong>{selectedCrop.farmerName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[#065f46]/70 uppercase font-bold">Origin Location</span>
                      <span>{selectedCrop.farmerLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[#065f46]/70 uppercase font-bold">Quantity</span>
                      <strong>{selectedCrop.quantity} {selectedCrop.unit}</strong>
                    </div>
                    <div className="flex justify-between border-t border-[#10b981]/20 pt-2 text-base">
                      <span className="font-black text-[#022c22]">Total Agreed Price</span>
                      <strong className="text-[#10b981]">${selectedCrop.quantity * selectedCrop.pricePerUnit}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Funds will be placed in secure escrow and released upon delivery receipt.</span>
                  </div>

                  <button
                    onClick={handleAcceptOfferModalNext}
                    className="w-full py-4 rounded-2xl bg-[#065f46] hover:bg-[#047857] text-white font-black text-sm shadow-xl shadow-[#065f46]/20 transition-all flex items-center justify-center gap-2 border border-[#10b981]/40"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>ACCEPT OFFER & PROCEED TO ESCROW</span>
                  </button>
                </div>
              )}

              {/* STEP 2: PAYMENT */}
              {paymentStep === 'payment' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-3">
                    <div className="flex justify-between font-black text-sm text-[#022c22]">
                      <span>Amount Due:</span>
                      <span className="text-[#10b981]">${selectedCrop.quantity * selectedCrop.pricePerUnit}</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-500 mb-1">Select Payment Method</label>
                      <select className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#022c22] outline-none">
                        <option>Direct Bank Escrow Transfer</option>
                        <option>Corporate Line of Credit</option>
                        <option>Instant Digital Wire</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-500 mb-1">Reference Account ID</label>
                      <input 
                        type="text" 
                        defaultValue="ESCROW-BUYER-88492"
                        className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-mono font-bold text-[#022c22] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleMakePaymentModal}
                    className="w-full py-4 rounded-2xl bg-[#10b981] hover:bg-[#047857] text-white font-black text-sm shadow-xl shadow-[#10b981]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>CONFIRM ACCEPTANCE & PAY</span>
                  </button>
                </div>
              )}

              {/* STEP 3: SUCCESS */}
              {paymentStep === 'success' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#e1f2e6] text-[#10b981] flex items-center justify-center mx-auto border border-[#10b981]/40">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-[#022c22]">Offer Accepted & Paid!</h4>
                  <p className="text-xs text-[#065f46] font-bold">Order created & dispatched to highway transporter network.</p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* SECTION 2: MY ORDERS */}
        {activeTab === 'my-orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#022c22]">Purchased Orders</h2>
              <span className="text-xs font-bold text-[#065f46] bg-[#e1f2e6] px-3 py-1 rounded-full border border-[#10b981]/30">
                {myOrders.length} Order(s)
              </span>
            </div>

            {myOrders.map(ord => (
              <div key={ord.id} className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#10b981] uppercase tracking-wider">ORDER #{ord.id}</span>
                  <h3 className="text-lg font-black text-[#022c22]">{ord.cropName} ({ord.quantity} kg)</h3>
                  <p className="text-xs text-[#065f46]/90 font-semibold">Farmer: <strong>{ord.farmerName}</strong></p>
                  <p className="text-xs text-[#10b981] font-black">Total Paid: ${ord.totalPrice}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-[#e1f2e6] text-[#065f46] text-xs font-black border border-[#10b981]/30">
                    {ord.status}
                  </span>
                  <button
                    onClick={() => {
                      setTrackingOrder(ord);
                      setActiveTab('live-tracking');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md border border-[#10b981]/30"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>TRACK LIVE</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION 3: LIVE TRACKING (REAL LEAFLET INTERACTIVE MAP) */}
        {activeTab === 'live-tracking' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#022c22]">Live Transportation Map</h2>
              <span className="text-xs font-bold text-[#065f46] bg-[#e1f2e6] px-3 py-1 rounded-full border border-[#10b981]/30">
                Interactive OpenStreetMap GPS
              </span>
            </div>

            {myOrders.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white/80 border-1.5 border-[#10b981]/30 shadow-md">
                <Navigation className="w-12 h-12 text-[#10b981]/50 mx-auto mb-3" />
                <p className="text-sm font-extrabold text-[#065f46]">No active order to track.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Real Interactive Leaflet Map Component */}
                <LiveTrackingMap 
                  farmerLocationName={activeTracking?.farmerLocation || myOrders[0].farmerLocation}
                  buyerLocationName={activeTracking?.buyerDestination || myOrders[0].buyerDestination}
                  transporterName={activeTracking?.transporterName || myOrders[0].transporterName}
                  status={activeTracking?.status || myOrders[0].status}
                />

                {/* Status Stepper */}
                <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-lg">
                  <h4 className="font-black text-sm text-[#022c22] mb-4">Delivery Status Progression</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    <div className="p-3 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30">
                      <span className="text-[10px] font-black text-[#10b981] block">CONFIRMED</span>
                      <span className="text-xs font-extrabold text-[#022c22]">Order Paid</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#e1f2e6] border border-[#10b981]/30">
                      <span className="text-[10px] font-black text-[#10b981] block">PICKED UP</span>
                      <span className="text-xs font-extrabold text-[#022c22]">Loaded at Farm</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#065f46] text-white shadow-md border border-[#10b981]/40">
                      <span className="text-[10px] font-black text-[#a7f3d0] block">IN TRANSIT</span>
                      <span className="text-xs font-black">On Highway</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-50 text-gray-400 border border-gray-200">
                      <span className="text-[10px] font-extrabold block">NEAR DEST</span>
                      <span className="text-xs font-bold">Approach Depot</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-50 text-gray-400 border border-gray-200">
                      <span className="text-[10px] font-extrabold block">DELIVERED</span>
                      <span className="text-xs font-bold font-mono">Final Handshake</span>
                    </div>
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
