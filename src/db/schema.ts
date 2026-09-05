// src/db/schema.ts
import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, doublePrecision, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').notNull().default('buyer'), // farmer, buyer, transporter, admin
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const crops = pgTable('crops', {
  id: serial('id').primaryKey(),
  farmerId: integer('farmer_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  variety: text('variety').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  unit: text('unit').notNull(),
  expectedPrice: doublePrecision('expected_price').notNull(),
  minPrice: doublePrecision('min_price').notNull(),
  quality: text('quality').notNull(),
  harvestDate: timestamp('harvest_date').notNull(),
  imageUrl: text('image_url'),
  pickupLocation: text('pickup_location').notNull(),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  description: text('description'),
  deliveryAvailable: boolean('delivery_available').default(false),
  status: text('status').default('ACTIVE'), // ACTIVE, PAUSED, SOLD
  createdAt: timestamp('created_at').defaultNow(),
});

export const buyerRequests = pgTable('buyer_requests', {
  id: serial('id').primaryKey(),
  buyerId: integer('buyer_id').references(() => users.id).notNull(),
  cropId: integer('crop_id').references(() => crops.id).notNull(),
  quantity: doublePrecision('quantity').notNull(),
  offeredPrice: doublePrecision('offered_price').notNull(),
  deliveryRequired: boolean('delivery_required').default(false),
  deliveryLocation: text('delivery_location'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  status: text('status').default('PENDING'), // PENDING, ACCEPTED, REJECTED
  createdAt: timestamp('created_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  buyerRequestId: integer('buyer_request_id').references(() => buyerRequests.id).notNull(),
  farmerId: integer('farmer_id').references(() => users.id).notNull(),
  buyerId: integer('buyer_id').references(() => users.id).notNull(),
  cropId: integer('crop_id').references(() => crops.id).notNull(),
  agreedPrice: doublePrecision('agreed_price').notNull(),
  agreedQuantity: doublePrecision('agreed_quantity').notNull(),
  fulfillmentMethod: text('fulfillment_method').notNull(), // DELIVERY, DIRECT_EXCHANGE
  status: text('status').default('FARMER_SELECTED'), // FARMER_SELECTED, BUYER_ACCEPTED, FULFILLMENT_SELECTED, COMPLETED, CANCELLED
  createdAt: timestamp('created_at').defaultNow(),
});

export const transportRequests = pgTable('transport_requests', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id').references(() => transactions.id).notNull(),
  transporterId: integer('transporter_id').references(() => users.id),
  pickupLocation: text('pickup_location').notNull(),
  dropLocation: text('drop_location').notNull(),
  status: text('status').default('REQUESTED'), // REQUESTED, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED
  createdAt: timestamp('created_at').defaultNow(),
});

export const trackingUpdates = pgTable('tracking_updates', {
  id: serial('id').primaryKey(),
  transportRequestId: integer('transport_request_id').references(() => transportRequests.id).notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

// --- SIH26132 Schema Additions ---

export const mandiPrices = pgTable('mandi_prices', {
  id: serial('id').primaryKey(),
  mandiName: text('mandi_name').notNull(),
  district: text('district').notNull(),
  state: text('state').notNull(),
  cropName: text('crop_name').notNull(),
  variety: text('variety').notNull(),
  minPrice: doublePrecision('min_price').notNull(),
  maxPrice: doublePrecision('max_price').notNull(),
  modalPrice: doublePrecision('modal_price').notNull(),
  prevModalPrice: doublePrecision('prev_modal_price').notNull(),
  arrivalVolume: doublePrecision('arrival_volume').notNull(), // Tonnes
  unit: text('unit').notNull().default('₹/Quintal'),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  sourceType: text('source_type').default('VERIFIED_BENCHMARK'), // LIVE_AGMARKNET, VERIFIED_BENCHMARK
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const buyerDemands = pgTable('buyer_demands', {
  id: serial('id').primaryKey(),
  buyerId: integer('buyer_id').references(() => users.id).notNull(),
  cropName: text('crop_name').notNull(),
  variety: text('variety').notNull(),
  requiredQuantity: doublePrecision('required_quantity').notNull(),
  unit: text('unit').notNull().default('kg'),
  requiredGrade: text('required_grade').notNull(), // Grade A, Grade B, Organic
  targetMinPrice: doublePrecision('target_min_price').notNull(),
  targetMaxPrice: doublePrecision('target_max_price').notNull(),
  deliveryLocation: text('delivery_location').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  requiredByDate: timestamp('required_by_date').notNull(),
  status: text('status').default('OPEN'), // OPEN, FULFILLED, CANCELLED
  createdAt: timestamp('created_at').defaultNow(),
});

export const fpos = pgTable('fpos', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  registrationNumber: text('registration_number').notNull().unique(),
  district: text('district').notNull(),
  state: text('state').notNull(),
  leaderId: integer('leader_id').references(() => users.id).notNull(),
  totalMembers: integer('total_members').default(1),
  primaryCrops: text('primary_crops').notNull(), // Comma separated
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  contactPhone: text('contact_phone').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const fpoMembers = pgTable('fpo_members', {
  id: serial('id').primaryKey(),
  fpoId: integer('fpo_id').references(() => fpos.id).notNull(),
  farmerId: integer('farmer_id').references(() => users.id).notNull(),
  cropName: text('crop_name').notNull(),
  committedQuantity: doublePrecision('committed_quantity').notNull(),
  unit: text('unit').default('kg'),
  joinedDate: timestamp('joined_date').defaultNow(),
});

export const fpoBulkOffers = pgTable('fpo_bulk_offers', {
  id: serial('id').primaryKey(),
  fpoId: integer('fpo_id').references(() => fpos.id).notNull(),
  cropName: text('crop_name').notNull(),
  variety: text('variety').notNull(),
  totalQuantity: doublePrecision('total_quantity').notNull(),
  unit: text('unit').default('Tonnes'),
  grade: text('grade').notNull(),
  askingPricePerUnit: doublePrecision('asking_price_per_unit').notNull(),
  location: text('location').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  status: text('status').default('ACTIVE'), // ACTIVE, SOLD, CANCELLED
  createdAt: timestamp('created_at').defaultNow(),
});

export const warehouses = pgTable('warehouses', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // COLD_STORAGE, WAREHOUSE, SILO
  operatorName: text('operator_name').notNull(),
  district: text('district').notNull(),
  state: text('state').notNull(),
  location: text('location').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  totalCapacityTonnes: doublePrecision('total_capacity_tonnes').notNull(),
  availableCapacityTonnes: doublePrecision('available_capacity_tonnes').notNull(),
  costPerTonPerMonth: doublePrecision('cost_per_ton_per_month').notNull(),
  supportedCrops: text('supported_crops').notNull(), // Comma separated
  contactPhone: text('contact_phone').notNull(),
  verified: boolean('verified').default(true),
});

export const storageBookings = pgTable('storage_bookings', {
  id: serial('id').primaryKey(),
  farmerId: integer('farmer_id').references(() => users.id).notNull(),
  warehouseId: integer('warehouse_id').references(() => warehouses.id).notNull(),
  cropName: text('crop_name').notNull(),
  quantityTonnes: doublePrecision('quantity_tonnes').notNull(),
  startDate: timestamp('start_date').defaultNow(),
  durationMonths: integer('duration_months').notNull(),
  totalCost: doublePrecision('total_cost').notNull(),
  status: text('status').default('ACTIVE'), // ACTIVE, COMPLETED, CANCELLED
  createdAt: timestamp('created_at').defaultNow(),
});

export const buyerTrustProfiles = pgTable('buyer_trust_profiles', {
  id: serial('id').primaryKey(),
  buyerId: integer('buyer_id').references(() => users.id).notNull().unique(),
  businessName: text('business_name').notNull(),
  verificationStatus: text('verification_status').default('SELF_VERIFIED'), // UNVERIFIED, SELF_VERIFIED, BUSINESS_VERIFIED
  gstinVerified: boolean('gstin_verified').default(false),
  completedTransactionsCount: integer('completed_transactions_count').default(0),
  cancelledTransactionsCount: integer('cancelled_transactions_count').default(0),
  rating: doublePrecision('rating').default(4.8),
  reviewsCount: integer('reviews_count').default(12),
  paymentEscrowReliabilityScore: doublePrecision('payment_escrow_reliability_score').default(98.5),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  crops: many(crops),
  buyerRequests: many(buyerRequests),
  buyerDemands: many(buyerDemands),
  storageBookings: many(storageBookings),
}));

export const cropsRelations = relations(crops, ({ one, many }) => ({
  farmer: one(users, {
    fields: [crops.farmerId],
    references: [users.id],
  }),
  buyerRequests: many(buyerRequests),
}));

export const buyerRequestsRelations = relations(buyerRequests, ({ one }) => ({
  buyer: one(users, {
    fields: [buyerRequests.buyerId],
    references: [users.id],
  }),
  crop: one(crops, {
    fields: [buyerRequests.cropId],
    references: [crops.id],
  }),
}));

export const buyerDemandsRelations = relations(buyerDemands, ({ one }) => ({
  buyer: one(users, {
    fields: [buyerDemands.buyerId],
    references: [users.id],
  }),
}));

export const fposRelations = relations(fpos, ({ one, many }) => ({
  leader: one(users, {
    fields: [fpos.leaderId],
    references: [users.id],
  }),
  members: many(fpoMembers),
  bulkOffers: many(fpoBulkOffers),
}));

export const fpoMembersRelations = relations(fpoMembers, ({ one }) => ({
  fpo: one(fpos, {
    fields: [fpoMembers.fpoId],
    references: [fpos.id],
  }),
  farmer: one(users, {
    fields: [fpoMembers.farmerId],
    references: [users.id],
  }),
}));

export const fpoBulkOffersRelations = relations(fpoBulkOffers, ({ one }) => ({
  fpo: one(fpos, {
    fields: [fpoBulkOffers.fpoId],
    references: [fpos.id],
  }),
}));

export const storageBookingsRelations = relations(storageBookings, ({ one }) => ({
  farmer: one(users, {
    fields: [storageBookings.farmerId],
    references: [users.id],
  }),
  warehouse: one(warehouses, {
    fields: [storageBookings.warehouseId],
    references: [warehouses.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  buyerRequest: one(buyerRequests, {
    fields: [transactions.buyerRequestId],
    references: [buyerRequests.id],
  }),
  farmer: one(users, {
    fields: [transactions.farmerId],
    references: [users.id],
  }),
  buyer: one(users, {
    fields: [transactions.buyerId],
    references: [users.id],
  }),
  crop: one(crops, {
    fields: [transactions.cropId],
    references: [crops.id],
  }),
  transportRequests: many(transportRequests),
}));

export const transportRequestsRelations = relations(transportRequests, ({ one, many }) => ({
  transaction: one(transactions, {
    fields: [transportRequests.transactionId],
    references: [transactions.id],
  }),
  transporter: one(users, {
    fields: [transportRequests.transporterId],
    references: [users.id],
  }),
  trackingUpdates: many(trackingUpdates),
}));
