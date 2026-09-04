// src/db/schema.ts
import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, doublePrecision, boolean, pgEnum } from 'drizzle-orm/pg-core';

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

export const usersRelations = relations(users, ({ many }) => ({
  crops: many(crops),
  buyerRequests: many(buyerRequests),
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
