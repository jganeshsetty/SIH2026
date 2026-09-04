import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { db } from "./src/db/index.ts";
import { users, crops, buyerRequests, transactions, transportRequests, trackingUpdates } from "./src/db/schema.ts";
import { eq, and, desc } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // -- Auth Sync --
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { name, role } = req.body;
      
      const updateData: any = {
        email: req.user.email || '',
      };
      if (role) {
        updateData.role = role;
      }
      
      const result = await db.insert(users)
        .values({
          uid: req.user.uid,
          email: req.user.email || '',
          name: name || req.user.name || 'User',
          role: role || 'buyer',
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
      
      // Basic security check: ensure user is part of the transaction
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
  app.post("/api/ai/chat", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { message } = req.body;
      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: "Gemini API key is missing" });
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are Farmora's AI Assistant. You help farmers, buyers, and transporters navigate the marketplace. Keep responses useful and concise. \n\nUser: ${message}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });
      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("AI error:", error);
      res.status(500).json({ error: "AI failed to respond" });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
