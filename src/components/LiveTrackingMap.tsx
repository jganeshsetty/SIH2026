import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Truck, MapPin, Play, Pause, RefreshCw, Navigation, ShieldCheck } from 'lucide-react';

interface LiveTrackingMapProps {
  farmerLocationName?: string;
  buyerLocationName?: string;
  transporterName?: string;
  status?: string;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  farmerLocationName = 'Green Acres Farm, Willamette Valley, OR',
  buyerLocationName = 'Wholesale Depot Hub #4, Seattle, WA',
  transporterName = 'Express Highway Logistics (Driver: Mark)',
  status = 'IN_TRANSIT'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  const [isSimulating, setIsSimulating] = useState(true);
  const [progressIndex, setProgressIndex] = useState(0.5); // 0 to 1 along route
  const [currentSpeed, setCurrentSpeed] = useState(62); // mph

  // Route Coordinates (Willamette Valley, OR to Seattle, WA)
  const routePoints: [number, number][] = [
    [45.0, -123.0],   // Farmer Pickup (Willamette Valley, OR)
    [45.5152, -122.6784], // Portland, OR
    [46.1382, -122.9382], // Longview, WA
    [46.9654, -122.9007], // Olympia, WA
    [47.2529, -122.4443], // Tacoma, WA
    [47.6062, -122.3321]  // Buyer Depot (Seattle, WA)
  ];

  // Calculate interpolated coordinate along route
  const getInterpolatedCoord = (ratio: number): [number, number] => {
    const totalSegments = routePoints.length - 1;
    const scaledRatio = ratio * totalSegments;
    const index = Math.floor(scaledRatio);
    const remainder = scaledRatio - index;

    if (index >= totalSegments) return routePoints[totalSegments];

    const p1 = routePoints[index];
    const p2 = routePoints[index + 1];

    const lat = p1[0] + (p2[0] - p1[0]) * remainder;
    const lng = p1[1] + (p2[1] - p1[1]) * remainder;

    return [lat, lng];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [46.3, -122.7],
        zoom: 7,
        zoomControl: false
      });

      // OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
      }).addTo(map);

      // Add Zoom Control at top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Custom HTML Icons
      const farmerHtmlIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background:#065f46; color:white; padding:6px; border-radius:50%; border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3); display:flex; align-items:center; justify-center; width:34px; height:34px;">
            🌱
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const buyerHtmlIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background:#022c22; color:white; padding:6px; border-radius:50%; border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3); display:flex; align-items:center; justify-center; width:34px; height:34px;">
            🏬
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const driverHtmlIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background:#10b981; color:white; padding:6px; border-radius:50%; border:2px solid white; box-shadow:0 0 15px #10b981; display:flex; align-items:center; justify-center; width:40px; height:40px; transform: scale(1.1);">
            🚚
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      // Farmer Marker
      L.marker(routePoints[0], { icon: farmerHtmlIcon })
        .addTo(map)
        .bindPopup(`<b>🌱 Farmer Pickup</b><br/>${farmerLocationName}`);

      // Buyer Marker
      L.marker(routePoints[routePoints.length - 1], { icon: buyerHtmlIcon })
        .addTo(map)
        .bindPopup(`<b>🏬 Buyer Destination</b><br/>${buyerLocationName}`);

      // Route Polyline
      L.polyline(routePoints, {
        color: '#10b981',
        weight: 5,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(map);

      // Driver Live Marker
      const initialDriverCoord = getInterpolatedCoord(progressIndex);
      const driverMarker = L.marker(initialDriverCoord, { icon: driverHtmlIcon })
        .addTo(map)
        .bindPopup(`<b>🚚 Driver Live Telemetry</b><br/>${transporterName}`);

      driverMarkerRef.current = driverMarker;
      mapInstanceRef.current = map;
    }
  }, []);

  // Live Driver Simulation Animation Loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setProgressIndex(prev => {
        const next = prev + 0.01;
        const bounded = next > 0.95 ? 0.05 : next;

        if (driverMarkerRef.current) {
          const newCoord = getInterpolatedCoord(bounded);
          driverMarkerRef.current.setLatLng(newCoord);
        }
        return bounded;
      });

      setCurrentSpeed(Math.floor(58 + Math.random() * 8));
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#10b981]/30 bg-slate-900 w-full h-[450px]">
      
      {/* Real Interactive Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Telemetry Glass Card */}
      <div className="absolute top-4 left-4 z-20 max-w-sm bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-[#10b981]/30 shadow-lg text-xs space-y-2 text-[#022c22]">
        <div className="flex items-center justify-between border-b border-[#10b981]/20 pb-2">
          <div className="flex items-center gap-1.5 font-extrabold text-[#065f46]">
            <Navigation className="w-4 h-4 text-[#10b981]" />
            <span>LIVE GPS TELEMETRY</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#065f46] font-bold text-[10px]">
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-[#065f46]">
          <div>
            <span className="text-[#065f46]/60 block text-[9px] uppercase font-bold">Driver Speed</span>
            <strong className="text-[#10b981] font-mono text-sm">{currentSpeed} mph</strong>
          </div>
          <div>
            <span className="text-[#065f46]/60 block text-[9px] uppercase font-bold">Route Progress</span>
            <strong className="text-[#022c22] font-mono text-sm">{Math.round(progressIndex * 100)}%</strong>
          </div>
        </div>

        <div className="pt-1 border-t border-[#10b981]/15 text-[10px] text-gray-600 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
          <span>Verified IoT Freight Sensor Connected</span>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-2 bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-[#10b981]/30 shadow-lg text-xs text-[#065f46]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping"></div>
          <span className="font-bold">Live Driver Position Updating Every 1s</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="px-3 py-1.5 rounded-xl bg-[#065f46] hover:bg-[#047857] text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'PAUSE MOVEMENT' : 'RESUME MOVEMENT'}</span>
          </button>
          
          <button
            onClick={() => setProgressIndex(0.05)}
            className="p-1.5 rounded-xl bg-[#e1f2e6] text-[#065f46] hover:bg-[#a7f3d0] transition-colors"
            title="Reset to Pickup"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
