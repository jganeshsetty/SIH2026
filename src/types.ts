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

export interface MandiPrice {
  id: number;
  mandiName: string;
  district: string;
  state: string;
  cropName: string;
  variety: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  prevModalPrice: number;
  arrivalVolume: number;
  unit: string;
  lat: number;
  lng: number;
  sourceType: 'LIVE_AGMARKNET' | 'VERIFIED_BENCHMARK';
  date: string;
}

export interface BuyerDemand {
  id: number;
  buyerId: number;
  buyerName: string;
  cropName: string;
  variety: string;
  requiredQuantity: number;
  unit: string;
  requiredGrade: string;
  targetMinPrice: number;
  targetMaxPrice: number;
  deliveryLocation: string;
  lat: number;
  lng: number;
  requiredByDate: string;
  status: 'OPEN' | 'FULFILLED' | 'CANCELLED';
  createdAt: string;
}

export interface FPO {
  id: number;
  name: string;
  registrationNumber: string;
  district: string;
  state: string;
  leaderId: number;
  leaderName: string;
  totalMembers: number;
  primaryCrops: string[];
  lat: number;
  lng: number;
  contactPhone: string;
  createdAt: string;
}

export interface FPOMember {
  id: number;
  fpoId: number;
  farmerId: number;
  farmerName: string;
  cropName: string;
  committedQuantity: number;
  unit: string;
  joinedDate: string;
}

export interface FPOBulkOffer {
  id: number;
  fpoId: number;
  fpoName: string;
  cropName: string;
  variety: string;
  totalQuantity: number;
  unit: string;
  grade: string;
  askingPricePerUnit: number;
  location: string;
  lat: number;
  lng: number;
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED';
  createdAt: string;
}

export interface Warehouse {
  id: number;
  name: string;
  type: 'COLD_STORAGE' | 'WAREHOUSE' | 'SILO';
  operatorName: string;
  district: string;
  state: string;
  location: string;
  lat: number;
  lng: number;
  totalCapacityTonnes: number;
  availableCapacityTonnes: number;
  costPerTonPerMonth: number;
  supportedCrops: string[];
  contactPhone: string;
  verified: boolean;
}

export interface StorageBooking {
  id: number;
  farmerId: number;
  warehouseId: number;
  warehouseName: string;
  cropName: string;
  quantityTonnes: number;
  startDate: string;
  durationMonths: number;
  totalCost: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface BuyerTrustProfile {
  id: number;
  buyerId: number;
  businessName: string;
  verificationStatus: 'UNVERIFIED' | 'SELF_VERIFIED' | 'BUSINESS_VERIFIED';
  gstinVerified: boolean;
  completedTransactionsCount: number;
  cancelledTransactionsCount: number;
  rating: number;
  reviewsCount: number;
  paymentEscrowReliabilityScore: number;
}

export interface MatchingResult {
  matchScore: number;
  cropScore: number;
  quantityScore: number;
  gradeScore: number;
  priceScore: number;
  locationScore: number;
  dateScore: number;
  distanceKm: number;
  reasons: string[];
}

export interface AiRecommendation {
  action: 'SELL_NOW' | 'STORE' | 'AGGREGATE';
  confidenceScore: number;
  headline: string;
  reasoning: string[];
  financialProjection: {
    immediateSaleRevenue: number;
    projectedStorageRevenueNet: number;
    fpoBulkPremiumPercentage: number;
  };
  suggestedActionSteps: string[];
  disclaimer: string;
}

export interface TransportRequest {
  id: number;
  transactionId?: number | null;
  transporterId?: number | null;
  cropName: string;
  quantity: number;
  unit: string;
  farmerName: string;
  buyerName: string;
  farmerId?: number | null;
  buyerId?: number | null;
  pickupLocation: string;
  dropLocation: string;
  pathType: 'Farmer → Buyer' | 'Farmer → FPO' | 'Farmer → Storehouse';
  distanceKm: number;
  farePayout: number;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropLat?: number | null;
  dropLng?: number | null;
  pickupOtp?: string | null;
  deliveryOtp?: string | null;
  pickupOtpVerified?: boolean;
  deliveryOtpVerified?: boolean;
  qualityGrade?: string | null;
  qualityQuantity?: number | null;
  visibleDamage?: string | null;
  qualityRemarks?: string | null;
  cropPhotoUrl?: string | null;
  qualityVerified?: boolean;
  verificationDetails?: string | null;
  verificationTimestamp?: string | null;
  status: 'REQUESTED' | 'AVAILABLE' | 'ACCEPTED' | 'DRIVER_ASSIGNED' | 'DRIVER_ARRIVING' | 'AT_PICKUP' | 'PICKED_UP' | 'IN_TRANSIT' | 'QUALITY_UPDATED' | 'OUT_FOR_DELIVERY' | 'AT_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface Payment {
  id: number;
  userId: number;
  orderId?: number | null;
  transactionId?: number | null;
  transportRequestId?: number | null;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'CREATED' | 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  failureReason?: string | null;
  payerName?: string | null;
  receiverName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: number;
  paymentId: number;
  transactionId?: number | null;
  invoiceNumber: string;
  gstin?: string | null;
  sellerName: string;
  sellerGstin?: string | null;
  buyerName: string;
  buyerGstin?: string | null;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  totalAmount: number;
  createdAt: string;
}

export interface AppNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
}

