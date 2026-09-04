import React, { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface DeliveryTrackerProps {
  transactionId: number;
}

export function DeliveryTracker({ transactionId }: DeliveryTrackerProps) {
  const { token } = useAuth();
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await fetch(`/api/transactions/${transactionId}/tracking`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTrackingData(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchTracking();
  }, [transactionId, token]);

  if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin w-6 h-6 text-farmora-primary" /></div>;

  if (!trackingData || trackingData.status === 'NO_TRACKING') {
    return (
      <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200 text-center">
        <p className="text-gray-500">Live tracking has not been initiated for this delivery yet.</p>
      </div>
    );
  }

  const { transportRequest, latestUpdate } = trackingData;
  const position = latestUpdate 
    ? { lat: latestUpdate.lat, lng: latestUpdate.lng }
    : { lat: 12.2958, lng: 76.6394 }; // Default to Mysore if no update

  return (
    <div className="border border-farmora-border rounded-2xl overflow-hidden mt-4">
      <div className="p-4 bg-gray-50 border-b border-farmora-border flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-farmora-text">Delivery Status</p>
          <p className="text-xs text-farmora-subtext mt-1 uppercase tracking-wider font-bold">{transportRequest.status}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-farmora-subtext">Last Updated</p>
          <p className="text-xs text-farmora-text font-medium mt-1">
            {latestUpdate ? new Date(latestUpdate.timestamp).toLocaleTimeString() : 'N/A'}
          </p>
        </div>
      </div>
      
      {!apiKey ? (
         <div className="h-64 bg-gray-100 flex items-center justify-center p-6 text-center">
           <div>
              <p className="font-medium text-gray-700">Map unavailable</p>
              <p className="text-sm text-gray-500 mt-2">Please add your VITE_GOOGLE_MAPS_API_KEY in the environment settings to view the live tracking map.</p>
           </div>
         </div>
      ) : (
        <div className="h-64 w-full">
          <APIProvider apiKey={apiKey}>
            <Map 
              defaultZoom={13} 
              defaultCenter={position} 
              mapId="DELIVERY_TRACKER_MAP"
              disableDefaultUI={true}
            >
              {latestUpdate && (
                <AdvancedMarker position={position}>
                  <Pin background="#4ADE80" borderColor="#16A34A" glyphColor="#052E16" />
                </AdvancedMarker>
              )}
            </Map>
          </APIProvider>
        </div>
      )}
    </div>
  );
}
