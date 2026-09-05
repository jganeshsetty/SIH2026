import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Layers, MapPin, Building2, Archive, Users, Truck } from 'lucide-react';

interface Props {
  centerLat?: number;
  centerLng?: number;
}

interface AssetDetail {
  id: string;
  type: 'FARM' | 'MANDI' | 'WAREHOUSE' | 'FPO' | 'LOGISTICS';
  title: string;
  category: string;
  distance: string;
  address: string;
  lat: number;
  lng: number;
  highlightText: string;
  stats: { label: string; value: string }[];
  contact?: string;
  actionLabel?: string;
}

export const EcosystemMapView: React.FC<Props> = ({ centerLat = 20.0059, centerLng = 73.7898 }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MANDI' | 'WAREHOUSE' | 'FPO' | 'LOGISTICS'>('ALL');
  
  // Single realistic sample asset ecosystem around Nashik, Maharashtra
  const assets: AssetDetail[] = [
    {
      id: 'farm-1',
      type: 'FARM',
      title: 'Your Farm Hub (Origin)',
      category: 'Farmer Origin',
      distance: '0 km (Origin)',
      address: 'Central Agro Zone, Nashik, Maharashtra 422001',
      lat: 20.0100,
      lng: 73.7900,
      highlightText: 'Current Active Listing: 5,000 kg Tomato (Grade A @ ₹32/kg)',
      stats: [
        { label: 'Crop Produce', value: 'Tomato (Grade A)' },
        { label: 'Lot Quantity', value: '5,000 kg' },
        { label: 'Expected Price', value: '₹32/kg' },
        { label: 'Status', value: 'Ready for Pickup' }
      ],
      actionLabel: 'View Produce Details'
    },
    {
      id: 'mandi-1',
      type: 'MANDI',
      title: 'Nashik APMC Market Yard',
      category: 'Regulated Agricultural Mandi',
      distance: '4.2 km East',
      address: 'Panchavati APMC Complex, Nashik, Maharashtra 422003',
      lat: 20.0150,
      lng: 73.8100,
      highlightText: 'Today Modal Rate: ₹32/kg | Arrival: 420 Tonnes',
      stats: [
        { label: 'Modal Price', value: '₹3,200/Qtl (₹32/kg)' },
        { label: 'Price Range', value: '₹28 - ₹36/kg' },
        { label: 'Arrival Volume', value: '420 Tonnes / Day' },
        { label: 'Source', value: 'AGMARKNET Benchmark' }
      ],
      contact: '+91 253 251 2233',
      actionLabel: 'Compare Mandi Rates'
    },
    {
      id: 'warehouse-1',
      type: 'WAREHOUSE',
      title: 'Nashik Agro Cold Storage',
      category: 'Cold Chain & Warehousing',
      distance: '5.8 km South-West',
      address: 'Plot 42, Ambad Industrial Area, Nashik, Maharashtra 422010',
      lat: 19.9850,
      lng: 73.7600,
      highlightText: 'Available Space: 450 MT | Rate: ₹1.50/kg per month',
      stats: [
        { label: 'Total Capacity', value: '1,200 Tonnes' },
        { label: 'Available Space', value: '450 Tonnes' },
        { label: 'Storage Fee', value: '₹1.50 / kg / month' },
        { label: 'Supported Crops', value: 'Tomato, Onion, Fruits' }
      ],
      contact: '+91 98220 11234',
      actionLabel: 'Book Storage Space'
    },
    {
      id: 'fpo-1',
      type: 'FPO',
      title: 'Sahyadri Farmer Producer Co. Ltd',
      category: 'FPO Aggregation Hub',
      distance: '6.4 km North-West',
      address: 'Dindori Road Agri Cluster, Nashik, Maharashtra 422004',
      lat: 20.0400,
      lng: 73.7500,
      highlightText: '150 Member Farmers | 25,000 kg Tomato Pooled for Bulk Sale',
      stats: [
        { label: 'Total Members', value: '150 Farmers' },
        { label: 'Pooled Volume', value: '25,000 kg (Tomato)' },
        { label: 'Negotiated Premium', value: '+₹2.50/kg vs Mandi' },
        { label: 'FPO Chairman', value: 'Ramesh Patil' }
      ],
      contact: '+91 94230 77112',
      actionLabel: 'Join FPO Pool'
    },
    {
      id: 'logistics-1',
      type: 'LOGISTICS',
      title: 'Farmora Transit Hub & Freight Yard',
      category: 'Logistics & GPS Tracking Point',
      distance: '6.1 km South-East',
      address: 'Mumbai-Nashik Highway Express Junction, MH 422009',
      lat: 19.9700,
      lng: 73.8300,
      highlightText: '1 Active Shipment In-Transit to Mumbai Wholesale Depot (60% Completed)',
      stats: [
        { label: 'Active Carrier', value: 'Kisan Express Logistics' },
        { label: 'Driver Assigned', value: 'Ramesh Shinde' },
        { label: 'Destination', value: 'Mumbai Central Agro Depot' },
        { label: 'Live GPS Status', value: 'In-Transit (60%)' }
      ],
      contact: '+91 99880 33441',
      actionLabel: 'Track GPS Live'
    }
  ];

  const [selectedAsset, setSelectedAsset] = useState<AssetDetail>(assets[0]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const filteredAssets = assets.filter(item => {
      if (activeFilter === 'ALL') return true;
      return item.type === activeFilter;
    });

    filteredAssets.forEach(item => {
      let iconColor = '#10b981';
      let iconEmoji = '🚜';
      let bgColor = '#065f46';

      if (item.type === 'MANDI') {
        iconColor = '#f59e0b';
        iconEmoji = '🏛️';
        bgColor = '#b45309';
      } else if (item.type === 'WAREHOUSE') {
        iconColor = '#3b82f6';
        iconEmoji = '❄️';
        bgColor = '#1d4ed8';
      } else if (item.type === 'FPO') {
        iconColor = '#10b981';
        iconEmoji = '👥';
        bgColor = '#047857';
      } else if (item.type === 'LOGISTICS') {
        iconColor = '#8b5cf6';
        iconEmoji = '🚚';
        bgColor = '#6d28d9';
      }

      const isSelected = selectedAsset.id === item.id;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: ${bgColor}; 
            color: white; 
            border: 2.5px solid ${isSelected ? '#ffffff' : iconColor}; 
            box-shadow: 0 4px 14px rgba(0,0,0,0.35)${isSelected ? ', 0 0 16px ' + iconColor : ''}; 
            border-radius: 50%; 
            width: ${isSelected ? '38px' : '32px'}; 
            height: ${isSelected ? '38px' : '32px'}; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: ${isSelected ? '16px' : '14px'};
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            ${iconEmoji}
          </div>
        `,
        iconSize: isSelected ? [38, 38] : [32, 32],
        iconAnchor: isSelected ? [19, 19] : [16, 16]
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedAsset(item);
      });

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px;">
          <div style="font-weight: 800; font-size: 13px; color: #022c22; margin-bottom: 2px;">${item.title}</div>
          <div style="font-size: 11px; color: #065f46; font-weight: 600; margin-bottom: 4px;">${item.category} (${item.distance})</div>
          <div style="font-size: 11px; color: #374151;">${item.highlightText}</div>
        </div>
      `);

      markersGroup.addLayer(marker);
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [activeFilter, selectedAsset.id, centerLat, centerLng]);

  return (
    <div className="rounded-3xl bg-white/95 backdrop-blur-xl border-1.5 border-[#10b981]/35 shadow-xl p-5 sm:p-7 space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#10b981]/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#e1f2e6] text-[#065f46] font-bold">
              <Layers className="w-5 h-5 text-[#10b981]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-[#022c22]">Agricultural Ecosystem Map</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                  Demo Sample Data
                </span>
              </div>
              <p className="text-xs text-[#065f46] font-semibold mt-0.5">
                Nashik Regional Agricultural Network • APMC Mandis, Cold Storages, FPOs & Transport Hubs
              </p>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeFilter === 'ALL'
                ? 'bg-[#065f46] text-white border-[#065f46] shadow-sm'
                : 'bg-white text-[#065f46] border-[#10b981]/30 hover:bg-[#e1f2e6]'
            }`}
          >
            <span>All ({assets.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('MANDI')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeFilter === 'MANDI'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Mandi (1)</span>
          </button>

          <button
            onClick={() => setActiveFilter('WAREHOUSE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeFilter === 'WAREHOUSE'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Cold Storage (1)</span>
          </button>

          <button
            onClick={() => setActiveFilter('FPO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeFilter === 'FPO'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>FPO Hub (1)</span>
          </button>

          <button
            onClick={() => setActiveFilter('LOGISTICS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeFilter === 'LOGISTICS'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Logistics (1)</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Visual Box */}
      <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border-2 border-[#10b981]/30 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '460px' }} />
        
        {/* Floating Quick Legend */}
        <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-[#10b981]/40 shadow-md text-[11px] font-bold text-[#022c22] space-y-1 hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#065f46]"></span>
            <span>🚜 Demo Farm Hub (Origin)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>🏛️ APMC Mandi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>❄️ Cold Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>👥 FPO Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>🚚 Transit Logistics</span>
          </div>
        </div>
      </div>

      {/* Selected Asset Details Panel */}
      {selectedAsset && (
        <div className="p-5 rounded-2xl bg-[#e1f2e6]/50 border border-[#10b981]/30 shadow-sm transition-all space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#10b981]/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white shadow-sm border border-[#10b981]/30">
                <MapPin className="w-6 h-6 text-[#10b981]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black text-[#022c22]">{selectedAsset.title}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-[#065f46] text-white text-[10px] font-bold">
                    {selectedAsset.category}
                  </span>
                </div>
                <p className="text-xs text-[#065f46] font-semibold mt-0.5">{selectedAsset.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="px-3 py-1.5 rounded-xl bg-white text-xs font-black text-[#022c22] border border-[#10b981]/30 shadow-xs">
                Distance: {selectedAsset.distance}
              </span>
              {selectedAsset.contact && (
                <a
                  href={`tel:${selectedAsset.contact}`}
                  className="px-3 py-1.5 rounded-xl bg-[#065f46] hover:bg-[#10b981] text-white text-xs font-black transition-all shadow-xs"
                >
                  Call Contact
                </a>
              )}
            </div>
          </div>

          <p className="text-xs font-bold text-[#065f46] bg-white/80 p-2.5 rounded-xl border border-[#10b981]/20">
            📌 <span className="text-[#022c22]">{selectedAsset.highlightText}</span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {selectedAsset.stats.map((stat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white border border-[#10b981]/20 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-[#065f46] block">{stat.label}</span>
                <span className="text-xs font-black text-[#022c22] mt-0.5 block">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
