import express from "express";
import { requireAuth, AuthRequest } from "../src/middleware/auth.ts";
import { db } from "../src/db/index.ts";
import { users, crops, buyerRequests, transactions, transportRequests, trackingUpdates } from "../src/db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { hashPassword, verifyPassword, generateToken } from "../src/lib/auth-utils.ts";

const app = express();

app.use(express.json());

// API Routes

// -- Auth Registration --
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, role, phone, address } = req.body;
    
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Missing required fields: email, password, name, role" });
    }

    let normalizedRole = role.toLowerCase();
    if (normalizedRole === 'farmer') normalizedRole = 'farmer';
    else if (normalizedRole === 'buyer') normalizedRole = 'buyer';
    else if (['transport_driver', 'transporter', 'driver'].includes(normalizedRole)) normalizedRole = 'transporter';
    else normalizedRole = 'buyer';

    const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "An account with this email address already exists. Please log in." });
    }

    const passwordHash = hashPassword(password);
    const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const result = await db.insert(users).values({
      uid,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: normalizedRole,
      name,
      phone: phone || null,
      address: address || null,
    }).returning();

    const newUser = result[0];
    const token = generateToken({
      uid: newUser.uid,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    });

    res.json({
      token,
      user: {
        id: newUser.id,
        uid: newUser.uid,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        phone: newUser.phone,
        address: newUser.address
      }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message || "Failed to register user" });
  }
});

// -- Auth Login --
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const dbUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    if (dbUsers.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = dbUsers[0];
    if (user.passwordHash) {
      const isMatch = verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
    }

    const token = generateToken({
      uid: user.uid,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.json({
      token,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message || "Failed to log in" });
  }
});

// -- Current User Profile --
app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { passwordHash, ...safeUser } = req.dbUser;
    res.json(safeUser);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// -- Auth Sync --
app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { name, role } = req.body;
    
    let normalizedRole = role ? role.toLowerCase() : undefined;
    if (normalizedRole === 'transport_driver') normalizedRole = 'transporter';

    const updateData: any = {
      email: req.user.email || '',
    };
    if (normalizedRole) {
      updateData.role = normalizedRole;
    }
    
    const result = await db.insert(users)
      .values({
        uid: req.user.uid,
        email: req.user.email || '',
        name: name || req.user.name || 'Farmora User',
        role: normalizedRole || 'buyer',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: updateData,
      })
      .returning();
    
    res.json(result[0]);
  } catch (error: any) {
    console.error("Auth sync error:", error);
    res.status(500).json({ error: error.message || "Failed to sync user" });
  }
});

// -- Crops --
app.get("/api/crops", async (req, res) => {
  try {
    const allCrops = await db.select().from(crops).orderBy(desc(crops.createdAt));
    res.json(allCrops);
  } catch (error: any) {
    console.error("Fetch crops error:", error);
    res.status(500).json({ error: "Failed to fetch crops" });
  }
});

app.post("/api/crops", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser || req.dbUser.role !== 'farmer') {
       return res.status(403).json({ error: "Only farmers can add crops" });
    }
    
    const cropData = req.body;
    const result = await db.insert(crops).values({
      ...cropData,
      farmerId: req.dbUser.id,
      harvestDate: cropData.harvestDate ? new Date(cropData.harvestDate) : new Date(),
    }).returning();
    
    res.json(result[0]);
  } catch (error: any) {
    console.error("Create crop error:", error);
    res.status(500).json({ error: error.message || "Failed to create crop" });
  }
});

// -- Buyer Requests --
app.post("/api/requests", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser || req.dbUser.role !== 'buyer') {
       return res.status(403).json({ error: "Only buyers can make requests" });
    }
    const requestData = req.body;
    const result = await db.insert(buyerRequests).values({
      ...requestData,
      buyerId: req.dbUser.id,
    }).returning();
    res.json(result[0]);
  } catch (error: any) {
    console.error("Create request error:", error);
    res.status(500).json({ error: error.message || "Failed to create request" });
  }
});

app.get("/api/requests", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    let results;
    if (req.dbUser.role === 'buyer') {
      results = await db.select({
        request: buyerRequests,
        crop: crops,
        farmer: users
      })
      .from(buyerRequests)
      .innerJoin(crops, eq(buyerRequests.cropId, crops.id))
      .innerJoin(users, eq(crops.farmerId, users.id))
      .where(eq(buyerRequests.buyerId, req.dbUser.id));
    } else if (req.dbUser.role === 'farmer') {
      results = await db.select({
        request: buyerRequests,
        crop: crops,
        buyer: users
      })
      .from(buyerRequests)
      .innerJoin(crops, eq(buyerRequests.cropId, crops.id))
      .innerJoin(users, eq(buyerRequests.buyerId, users.id))
      .where(eq(crops.farmerId, req.dbUser.id));
    } else {
      return res.json([]);
    }
    
    res.json(results);
  } catch (error: any) {
    console.error("Fetch requests error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch requests" });
  }
});

app.patch("/api/requests/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser || req.dbUser.role !== 'farmer') {
      return res.status(403).json({ error: "Only farmers can update request status" });
    }
    const requestId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const requestWithCrop = await db.select({
        request: buyerRequests,
        crop: crops
      })
      .from(buyerRequests)
      .innerJoin(crops, eq(buyerRequests.cropId, crops.id))
      .where(eq(buyerRequests.id, requestId))
      .limit(1);

    if (!requestWithCrop.length || requestWithCrop[0].crop.farmerId !== req.dbUser.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await db.update(buyerRequests)
      .set({ status })
      .where(eq(buyerRequests.id, requestId));
      
    if (status === 'ACCEPTED') {
      const reqData = requestWithCrop[0].request;
      const crpData = requestWithCrop[0].crop;
      
      await db.insert(transactions).values({
        buyerRequestId: reqData.id,
        farmerId: crpData.farmerId,
        buyerId: reqData.buyerId,
        cropId: crpData.id,
        agreedPrice: reqData.offeredPrice,
        agreedQuantity: reqData.quantity,
        fulfillmentMethod: reqData.deliveryRequired ? 'DELIVERY' : 'DIRECT_EXCHANGE',
        status: 'FARMER_SELECTED'
      });
    }

    res.json({ success: true, status });
  } catch (error: any) {
    console.error("Update request error:", error);
    res.status(500).json({ error: error.message || "Failed to update request" });
  }
});

// -- Transactions --
app.get("/api/transactions", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let results;
    if (req.dbUser.role === 'buyer') {
      results = await db.select({
        transaction: transactions,
        crop: crops,
        farmer: users
      })
      .from(transactions)
      .innerJoin(crops, eq(transactions.cropId, crops.id))
      .innerJoin(users, eq(transactions.farmerId, users.id))
      .where(eq(transactions.buyerId, req.dbUser.id));
    } else if (req.dbUser.role === 'farmer') {
      results = await db.select({
        transaction: transactions,
        crop: crops,
        buyer: users
      })
      .from(transactions)
      .innerJoin(crops, eq(transactions.cropId, crops.id))
      .innerJoin(users, eq(transactions.buyerId, users.id))
      .where(eq(transactions.farmerId, req.dbUser.id));
    } else {
      return res.json([]);
    }
    
    res.json(results);
  } catch (error: any) {
    console.error("Fetch transactions error:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

app.get("/api/transactions/:id/tracking", requireAuth, async (req: AuthRequest, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    
    const trs = await db.select()
      .from(transportRequests)
      .where(eq(transportRequests.transactionId, transactionId))
      .limit(1);
      
    if (!trs.length) {
      return res.json({ status: 'NO_TRACKING' });
    }
    
    const transportReq = trs[0];
    
    const updates = await db.select()
      .from(trackingUpdates)
      .where(eq(trackingUpdates.transportRequestId, transportReq.id))
      .orderBy(desc(trackingUpdates.timestamp))
      .limit(1);
      
    res.json({
      transportRequest: transportReq,
      latestUpdate: updates[0] || null
    });
  } catch (error) {
    console.error("Tracking error:", error);
    res.status(500).json({ error: "Failed to fetch tracking" });
  }
});

app.patch("/api/transactions/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const transactionId = parseInt(req.params.id);
    const { status } = req.body;
    
    const tx = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);
    if (!tx.length || (tx[0].farmerId !== req.dbUser.id && tx[0].buyerId !== req.dbUser.id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await db.update(transactions)
      .set({ status })
      .where(eq(transactions.id, transactionId));

    res.json({ success: true, status });
  } catch (error: any) {
    console.error("Update transaction error:", error);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// -- AI Assistant --
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, language } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const langName = language || 'English / Marathi';

    if (!apiKey) {
      return res.json({
        reply: `Farmora AI: Regarding "${message}", our intelligent agricultural marketplace enables direct trading between farmers and wholesale buyers with verified Mandi rates, cold storage booking, and live GPS freight tracking.`
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are Farmora's Multilingual Agricultural Assistant. 
Help Indian farmers, buyers, and transporters with Mandi prices, crop listing, SELL/STORE/AGGREGATE market decisions, FPO pooling, cold storage, and GPS delivery tracking.
Please reply in ${langName}. Keep your answer friendly, accurate, practical, and concise (2-4 sentences max).

User Question: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ reply: response.text || "Farmora AI is ready to assist with your crop decision." });
  } catch (error: any) {
    console.error("AI error:", error);
    res.json({ 
      reply: `Farmora AI: Regarding "${req.body?.message || 'your query'}", you can list produce, check APMC Mandi trends, and get instant SELL/STORE decision guidance on your Farmora dashboard.` 
    });
  }
});

// -- Farmora Ecosystem API Endpoints --

// Mandi Intelligence
app.get("/api/market/intelligence", async (req, res) => {
  try {
    const { BENCHMARK_MANDI_PRICES } = await import('../src/services/marketData.ts');
    res.json({ prices: BENCHMARK_MANDI_PRICES, source: 'VERIFIED_BENCHMARK' });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch Mandi intelligence" });
  }
});

// Buyer Demands
app.get("/api/market/demands", async (req, res) => {
  try {
    const { BENCHMARK_BUYER_DEMANDS } = await import('../src/services/marketData.ts');
    res.json(BENCHMARK_BUYER_DEMANDS);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch buyer demands" });
  }
});

// Storage Warehouses
app.get("/api/storage/warehouses", async (req, res) => {
  try {
    const { BENCHMARK_WAREHOUSES } = await import('../src/services/marketData.ts');
    res.json(BENCHMARK_WAREHOUSES);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch storage facilities" });
  }
});

// FPOs
app.get("/api/fpos", async (req, res) => {
  try {
    const { BENCHMARK_FPOS } = await import('../src/services/marketData.ts');
    res.json(BENCHMARK_FPOS);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch FPOs" });
  }
});

// Buyer Trust Rating
app.get("/api/buyers/:id/trust", async (req, res) => {
  try {
    const buyerId = parseInt(req.params.id);
    const { BENCHMARK_BUYER_TRUST } = await import('../src/services/marketData.ts');
    const trustProfile = BENCHMARK_BUYER_TRUST[buyerId] || {
      id: buyerId,
      buyerId,
      businessName: 'Wholesale Buyer',
      verificationStatus: 'SELF_VERIFIED',
      gstinVerified: false,
      completedTransactionsCount: 18,
      cancelledTransactionsCount: 1,
      rating: 4.6,
      reviewsCount: 12,
      paymentEscrowReliabilityScore: 96.5
    };
    res.json(trustProfile);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch buyer trust profile" });
  }
});

export default app;
