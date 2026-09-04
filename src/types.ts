export interface User {
  id: number;
  uid: string;
  email: string;
  name: string;
  role: 'farmer' | 'buyer' | 'transporter' | 'admin';
  phone?: string | null;
  address?: string | null;
}

export interface Crop {
  id: number;
  farmerId: number;
  name: string;
  variety: string;
  quantity: number;
  unit: string;
  expectedPrice: number;
  minPrice: number;
  quality: string;
  harvestDate: string;
  imageUrl?: string | null;
  pickupLocation: string;
  lat?: number | null;
  lng?: number | null;
  description?: string | null;
  deliveryAvailable: boolean;
  status: 'ACTIVE' | 'PAUSED' | 'SOLD';
  createdAt: string;
}

export interface BuyerRequest {
  id: number;
  buyerId: number;
  cropId: number;
  quantity: number;
  offeredPrice: number;
  deliveryRequired: boolean;
  deliveryLocation?: string | null;
  lat?: number | null;
  lng?: number | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface Transaction {
  id: number;
  buyerRequestId: number;
  farmerId: number;
  buyerId: number;
  cropId: number;
  agreedPrice: number;
  agreedQuantity: number;
  fulfillmentMethod: 'DELIVERY' | 'DIRECT_EXCHANGE';
  status: 'FARMER_SELECTED' | 'BUYER_ACCEPTED' | 'FULFILLMENT_SELECTED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}
