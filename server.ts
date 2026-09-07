// ============================================================================
// Farmora Agricultural Platform - Express Server & API Gateway
// ============================================================================

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth";
import { db } from "./src/db/index";
import {
  users,
  crops,
  buyerRequests,
  transactions,
  transportRequests,
  trackingUpdates,
  notifications,
  storageBookings,
  fpoMembers
} from "./src/db/schema";
import { eq, desc } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { hashPassword, verifyPassword, generateToken } from "./src/lib/auth-utils";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json());

  // ============================================================================
  // 1. AUTHENTICATION & USER MANAGEMENT ROUTES
  // ============================================================================

  // Register new user (Farmer, Buyer, or Transporter)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name, role, phone, address } = req.body;

      if (!email || !password || !name || !role) {
        return res.status(400).json({ error: "Missing required fields: email, password, name, role" });
      }

      // Normalize role string to system defaults
      let normalizedRole = role.toLowerCase();
      if (normalizedRole === 'farmer') normalizedRole = 'farmer';
      else if (normalizedRole === 'buyer') normalizedRole = 'buyer';
      else if (['transport_driver', 'transporter', 'driver'].includes(normalizedRole)) normalizedRole = 'transporter';
      else normalizedRole = 'buyer';

      // Verify user uniqueness in PostgreSQL
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase().trim()))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(400).json({ error: "An account with this email address already exists. Please log in." });
      }

      // Secure password hashing
      const passwordHash = hashPassword(password);
      const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // Insert new user into database
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

  // User authentication & JWT generation
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Query registered user
      const dbUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase().trim()))
        .limit(1);

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

      // Generate session JWT token
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

  // Fetch current authenticated user profile
  app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser && req.user) {
        const userUid = req.user.uid;
        const userEmail = (req.user.email || '').toLowerCase().trim();
        let dbUsers = await db.select().from(users).where(eq(users.uid, userUid)).limit(1);
        if (dbUsers.length === 0 && userEmail) {
          dbUsers = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
        }
        if (dbUsers.length > 0) {
          req.dbUser = dbUsers[0];
        }
      }

      if (!req.dbUser) {
        return res.status(401).json({ error: "Unauthorized: User not found" });
      }
      const { passwordHash, ...safeUser } = req.dbUser;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Sync external OAuth/Firebase authenticated user with PostgreSQL
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const { name, role } = req.body;
      
      let normalizedRole = role ? role.toLowerCase() : undefined;
      if (['transport_driver', 'transporter', 'driver'].includes(normalizedRole || '')) normalizedRole = 'transporter';

      const userEmail = (req.user.email || '').toLowerCase().trim();
      const userUid = req.user.uid;

      let existingUserList = await db.select().from(users).where(eq(users.uid, userUid)).limit(1);
      if (existingUserList.length === 0 && userEmail) {
        existingUserList = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
      }

      let finalUser: any;

      if (existingUserList.length > 0) {
        const existing = existingUserList[0];
        const roleToKeep = existing.role || normalizedRole || 'buyer';
        
        const updatedList = await db.update(users)
          .set({
            uid: userUid,
            email: userEmail || existing.email,
            name: name || existing.name || req.user.name || 'Farmora User',
            role: roleToKeep
          })
          .where(eq(users.id, existing.id))
          .returning();

        finalUser = updatedList[0] || existing;
      } else {
        const createdList = await db.insert(users)
          .values({
            uid: userUid,
            email: userEmail,
            name: name || req.user.name || 'Farmora User',
            role: normalizedRole || 'buyer'
          })
          .returning();

        finalUser = createdList[0];
      }

      const token = generateToken({
        uid: finalUser.uid,
        email: finalUser.email,
        role: finalUser.role,
        name: finalUser.name
      });

      const { passwordHash, ...safeUser } = finalUser;

      res.json({
        token,
        user: safeUser
      });
    } catch (error: any) {
      console.error("Auth sync error:", error);
      res.status(500).json({ error: error.message || "Failed to sync user" });
    }
  });

  // Update user's preferred language setting
  app.post("/api/user/language", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { language } = req.body;
      if (!req.dbUser || !language) {
        return res.status(400).json({ error: "Invalid user or language" });
      }

      await db.update(users)
        .set({ preferredLanguage: language })
        .where(eq(users.id, req.dbUser.id));

      res.json({ success: true, language });
    } catch (err: any) {
      console.warn("Update language error:", err);
      res.status(500).json({ error: "Failed to update language" });
    }
  });

  // ============================================================================
  // 2. CROP MARKETPLACE & HARVEST LISTINGS
  // ============================================================================

  // Fetch all active crop harvest listings
  app.get("/api/crops", async (req, res) => {
    try {
      const allCrops = await db.select().from(crops).orderBy(desc(crops.createdAt));
      res.json(allCrops);
    } catch (error: any) {
      console.error("Fetch crops error:", error);
      res.status(500).json({ error: "Failed to fetch crops" });
    }
  });

  // Create new crop harvest listing (Farmers only)
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

  // ============================================================================
  // 3. BUYER DEMANDS & PROCUREMENT
  // ============================================================================

  // Fetch wholesale buyer demands
  app.get("/api/buyer-requests", async (req, res) => {
    try {
      const requests = await db.select().from(buyerRequests).orderBy(desc(buyerRequests.createdAt));
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch buyer requests" });
    }
  });

  // Submit buyer procurement demand (Buyers only)
  app.post("/api/buyer-requests", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser || req.dbUser.role !== 'buyer') {
        return res.status(403).json({ error: "Only buyers can create requests" });
      }
      
      const requestData = req.body;
      const result = await db.insert(buyerRequests).values({
        ...requestData,
        buyerId: req.dbUser.id,
      }).returning();

      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to create buyer request" });
    }
  });

  // ============================================================================
  // 4. TRANSACTIONS & ESCROW
  // ============================================================================

  // Fetch transaction history
  app.get("/api/transactions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const allTx = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
      res.json(allTx);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Initiate direct transaction & escrow lock
  app.post("/api/transactions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { buyerRequestId, cropId, agreedPrice, agreedQuantity, fulfillmentMethod } = req.body;
      
      const targetCrop = await db.select().from(crops).where(eq(crops.id, cropId)).limit(1);
      const targetReq = await db.select().from(buyerRequests).where(eq(buyerRequests.id, buyerRequestId)).limit(1);
      
      if (targetCrop.length === 0 || targetReq.length === 0) {
        return res.status(404).json({ error: "Crop or request not found" });
      }

      const result = await db.insert(transactions).values({
        buyerRequestId,
        farmerId: targetCrop[0].farmerId,
        buyerId: targetReq[0].buyerId,
        cropId,
        agreedPrice,
        agreedQuantity,
        fulfillmentMethod,
        status: 'FARMER_SELECTED'
      }).returning();

      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to create transaction" });
    }
  });

  // ============================================================================
  // 5. FREIGHT TRANSPORTATION & LIVE GPS TRACKING
  // ============================================================================

  // Fetch transport requests
  app.get("/api/transport-requests", async (req, res) => {
    try {
      const requests = await db.select().from(transportRequests).orderBy(desc(transportRequests.createdAt));
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch transport requests" });
    }
  });

  // Accept transport job (Transporters only)
  app.post("/api/transport-requests/assign", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser || !['transporter', 'transport_driver', 'driver'].includes(req.dbUser.role)) {
        return res.status(403).json({ error: "Only transporters can accept requests" });
      }

      const { requestId } = req.body;
      const result = await db.update(transportRequests)
        .set({
          transporterId: req.dbUser.id,
          status: 'ASSIGNED'
        })
        .where(eq(transportRequests.id, requestId))
        .returning();

      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to assign transport request" });
    }
  });

  // ============================================================================
  // 6. MULTILINGUAL AI ASSISTANT (10 LANGUAGES)
  // ============================================================================

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message = '', language, userRole = 'farmer', pendingAction } = req.body;
      const lower = message.toLowerCase().trim();
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

      // 1. Detect language among 10 languages
      let detectedLangCode = 'en';
      if (/[\u0C80-\u0CFF]/.test(message)) detectedLangCode = 'kn'; // Kannada
      else if (/[\u0C00-\u0C7F]/.test(message)) detectedLangCode = 'te'; // Telugu
      else if (/[\u0B80-\u0BFF]/.test(message)) detectedLangCode = 'ta'; // Tamil
      else if (/[\u0D00-\u0D7F]/.test(message)) detectedLangCode = 'ml'; // Malayalam
      else if (/[\u0980-\u09FF]/.test(message)) detectedLangCode = 'bn'; // Bengali
      else if (/[\u0A80-\u0AFF]/.test(message)) detectedLangCode = 'gu'; // Gujarati
      else if (/[\u0A00-\u0A7F]/.test(message)) detectedLangCode = 'pa'; // Punjabi
      else if (/[\u0900-\u097F]/.test(message)) {
        if (/\b(आहे|नाही|शेतकरी|बाजारभाव|करा|पाहिजे|होय)\b/i.test(message)) {
          detectedLangCode = 'mr'; // Marathi
        } else {
          detectedLangCode = 'hi'; // Hindi
        }
      } else if (language) {
        if (typeof language === 'string' && language.length <= 5) detectedLangCode = language.toLowerCase();
      }

      // Multilingual confirmation keywords
      const isAffirmative = /\b(yes|yeah|yup|confirm|proceed|ok|sure|हाँ|हां|होय|हो|ಹೌದು|అవును|ஆம்|ശരി|അതെ|হ্যাঁ|હા|ਹਾਂ)\b/i.test(lower);
      const isNegative = /\b(no|nope|cancel|stop|रद्द|नको|ಬೇಡ|వద్దు|வேண்டாம்|വേണ്ട|না|ના|ਨਹੀਂ)\b/i.test(lower);

      // 2. Handle Pending Action Confirmation
      if (pendingAction && (isAffirmative || isNegative)) {
        if (isNegative) {
          const cancelReplies: Record<string, string> = {
            en: 'Action cancelled. How else can I assist you with your agricultural operations?',
            hi: 'कार्रवाई रद्द कर दी गई है। मैं आपकी और क्या सहायता कर सकता हूँ?',
            kn: 'ಕ್ರಮವನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ. ನಾನು ನಿಮಗೆ ಇನ್ನೇನು ಸಹಾಯ ಮಾಡಬಹುದು?',
            mr: 'कृती रद्द करण्यात आली आहे. मी आपली आणखी काय मदत करू शकतो?',
            te: 'చర్య రద్దు చేయబడింది. నేను మీకు ఇంకేమి సహాయం చేయగలను?',
            ta: 'செயல் ரத்து செய்யப்பட்டது. நான் உங்களுக்கு வேறு எப்படி உதவ முடியும்?',
            ml: 'നടപടി റദ്ദാക്കി. ഞാൻ നിങ്ങൾക്ക് മറ്റെങ്ങനെ സഹായിക്കണം?',
            bn: 'পদক্ষেপটি বাতিল করা হয়েছে। আমি আপনাকে আর কীভাবে সহায়তা করতে পারি?',
            gu: 'પગલું રદ કરવામાં આવ્યું છે. હું તમને બીજી કેવી રીતે મદદ કરી શકું?',
            pa: 'ਕਾਰਵਾਈ ਰੱਦ ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ। ਮੈਂ ਤੁਹਾਡੀ ਹੋਰ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?'
          };
          return res.json({
            reply: cancelReplies[detectedLangCode] || cancelReplies.en,
            actionCancelled: true,
            detectedLanguage: detectedLangCode
          });
        }

        if (pendingAction.type === 'ADD_CROP') {
          const cropPayload = pendingAction.payload;
          const confirmReplies: Record<string, string> = {
            en: `Success! Added ${cropPayload.quantity} ${cropPayload.unit} of ${cropPayload.name} at ₹${cropPayload.expectedPrice}/${cropPayload.unit} to your listed produce. Direct buyers can now view and offer!`,
            hi: `सफलता! आपके ${cropPayload.name} की ${cropPayload.quantity} ${cropPayload.unit} को ₹${cropPayload.expectedPrice}/${cropPayload.unit} के भाव से सफलतापूर्वक जोड़ दिया गया है। थोक खरीदार अब इसे देख सकते हैं!`,
            kn: `ಯಶಸ್ವಿಯಾಗಿದೆ! ನಿಮ್ಮ ${cropPayload.quantity} ${cropPayload.unit} ${cropPayload.name} ಬೆಳೆಯನ್ನು ₹${cropPayload.expectedPrice}/${cropPayload.unit} ಬೆಲೆಗೆ ಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ. ಖರೀದಿದಾರರು ಈಗ ನೋಡಬಹುದು!`,
            mr: `यशस्वी! आपले ${cropPayload.quantity} ${cropPayload.unit} ${cropPayload.name} ₹${cropPayload.expectedPrice}/${cropPayload.unit} दराने यशस्वीरीत्या जोडले गेले आहे. खरेदीदार आता ते पाहू शकतात!`,
            te: `విజయవంతమైంది! మీ ${cropPayload.quantity} ${cropPayload.unit} ${cropPayload.name} పంట ₹${cropPayload.expectedPrice}/${cropPayload.unit} ధరకు జాబితా చేయబడింది. కొనుగోలుదారులు ఇప్పుడు చూడవచ్చు!`,
            ta: `வெற்றி! உங்கள் ${cropPayload.quantity} ${cropPayload.unit} ${cropPayload.name} ₹${cropPayload.expectedPrice}/${cropPayload.unit} விலையில் சேர்க்கப்பட்டது. வாங்குபவர்கள் இப்போது பார்க்கலாம்!`,
            ml: `വിജയം! നിങ്ങളുടെ ${cropPayload.quantity} ${cropPayload.unit} ${cropPayload.name} ₹${cropPayload.expectedPrice}/${cropPayload.unit} നിരക്കിൽ പട്ടികയിൽ ചേർത്തു. വാങ്ങുന്നവർക്ക് ഇപ്പോൾ കാണാം!`,
            bn: `সফল! আপনার ${cropPayload.quantity} ${cropPayload.unit} ${cropPayload.name} ₹${cropPayload.expectedPrice}/${cropPayload.unit} দরে সফলভাবে যোগ করা হয়েছে। ক্রেতারা এখন এটি দেখতে পাবেন!`,
            gu: `સફળ! તમારા ${cropPayload.quantity} ${cropPayload.unit} ${cropPayload.name} ને ₹${cropPayload.expectedPrice}/${cropPayload.unit} ભાવે ઉમેરવામાં આવ્યા છે. ખરીદદારો હવે જોઈ શકે છે!`,
            pa: `ਸਫਲਤਾ! ਤੁਹਾਡਾ ${cropPayload.quantity} ${cropPayload.unit} ${cropPayload.name} ₹${cropPayload.expectedPrice}/${cropPayload.unit} ਦੇ ਭਾਅ 'ਤੇ ਸੂਚੀ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ।`
          };

          return res.json({
            reply: confirmReplies[detectedLangCode] || confirmReplies.en,
            actionExecuted: true,
            action: 'CROP_ADDED',
            crop: cropPayload,
            detectedLanguage: detectedLangCode
          });
        }
      }

      // 3. Intent Detection & Smart Guidance
      const addCropMatch = lower.match(/(add|list|जोडा|जोड़ें|ಸೇರಿಸಿ|ಜೋడించండి|சேர்க்க|ചേർക്കുക|যোগ|ઉમેરો|ਸ਼ਾਮਲ)/i);
      if (addCropMatch && /(crop|harvest|tomato|potato|onion|wheat|शेतमाल|फसल|ಬೆಳೆ|పంట|பயிர்|വിള|ટોમેટો|ટામેટા|టమోటా|टोमॅटो|টমেটো)/i.test(lower)) {
        let cropName = 'Tomato';
        if (/potato|बटाटा|आलू|ಆಲೂಗಡ್ಡೆ|బంగాಳాదుంప|உരുளை|ഉരുളക്കിഴങ്ങ്|আলু|બટાકા|ਆਲੂ/i.test(lower)) cropName = 'Potato';
        else if (/onion|कांदा|प्याज|ಈರುಳ್ಳಿ|ఉల్లిపాయ|வெங்காயம்|ഉള്ളി|പേঁയাজ|ડુંગળી|ਪਿਆਜ਼/i.test(lower)) cropName = 'Onion';
        else if (/wheat|गहू|गेहूं|ಗೋಧಿ|ಗೋధుಮ|கோதுமை|ഗോതമ്പ്|গম|ઘઉં|ਕਣਕ/i.test(lower)) cropName = 'Wheat';

        const qtyMatch = lower.match(/(\d+)\s*(kg|किलो|टन|ton|quintal)?/i);
        const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 100;
        const unit = qtyMatch && qtyMatch[2] ? qtyMatch[2] : 'kg';
        const expectedPrice = cropName === 'Tomato' ? 32 : cropName === 'Potato' ? 24 : cropName === 'Onion' ? 28 : 22;

        const confirmPrompts: Record<string, string> = {
          en: `I found your request to add ${quantity} ${unit} of ${cropName} at benchmark rate of ₹${expectedPrice}/${unit}. Would you like me to confirm and publish this harvest listing?`,
          hi: `मैंने ₹${expectedPrice}/${unit} के बेंचमार्क भाव पर ${cropName} के ${quantity} ${unit} जोड़ने का अनुरोध पहचाना है। क्या आप इसे प्रकाशित करने की पुष्टि करते हैं?`,
          kn: `ನಾನು ₹${expectedPrice}/${unit} ಬೆಲೆಯಲ್ಲಿ ${quantity} ${unit} ${cropName} ಬೆಳೆ ಸೇರಿಸಲು ಸಿದ್ಧಪಡಿಸಿದ್ದೇನೆ. ನೀವು ಇದನ್ನು ದೃಢೀಕರಿಸಲು ಬಯಸುತ್ತೀರಾ?`,
          mr: `मी ₹${expectedPrice}/${unit} दराने ${quantity} ${unit} ${cropName} जोडण्याची विनंती तयार केली आहे. आपण ही शेतमाल नोंदणी निश्चित करू इच्छिता का?`,
          te: `నేను ₹${expectedPrice}/${unit} ధరకు ${quantity} ${unit} ${cropName} పంటను జోడించడానికి సిద్ధం చేశాను. మీరు దీనిని నిర్ధారించాలనుకుంటున్నారా?`,
          ta: `₹${expectedPrice}/${unit} விலையில் ${quantity} ${unit} ${cropName} சேர்க்க கோரிக்கை பெறப்பட்டது. இதை உறுதிசெய்து வெளியிட விரும்புகிறீர்களா?`,
          ml: `₹${expectedPrice}/${unit} നിരക്കിൽ ${quantity} ${unit} ${cropName} ചേർക്കാൻ തയ്യാറാക്കി. ഈ ലിസ്റ്റിംഗ് സ്ഥിരീകരിക്കാൻ ആഗ്രഹിക്കുന്നുണ്ടോ?`,
          bn: `আমি ₹${expectedPrice}/${unit} দরে ${quantity} ${unit} ${cropName} যোগ করার অনুরোধ পেয়েছি। আপনি কি এটি প্রকাশ নিশ্চিত করতে চান?`,
          gu: `મેં ₹${expectedPrice}/${unit} ના ભાવે ${quantity} ${unit} ${cropName} ઉમેરવાની વિનંતી તૈયાર કરી છે. શું તમે આની પુષ્ટિ કરવા માંગો છો?`,
          pa: `ਮੈਂ ₹${expectedPrice}/${unit} ਦੇ ਭਾਅ 'ਤੇ ${quantity} ${unit} ${cropName} ਸ਼ਾਮਲ ਕਰਨ ਦੀ ਬੇਨਤੀ ਤਿਆਰ ਕੀਤੀ ਹੈ। ਕੀ ਤੁਸੀਂ ਇਸਦੀ ਪੁਸ਼ਟੀ ਕਰਦੇ ਹੋ?`
        };

        return res.json({
          reply: confirmPrompts[detectedLangCode] || confirmPrompts.en,
          needsConfirmation: true,
          pendingAction: {
            type: 'ADD_CROP',
            payload: { name: cropName, quantity, unit, expectedPrice, variety: 'Hybrid Grade A' }
          },
          detectedLanguage: detectedLangCode
        });
      }

      // 4. Default Gemini Generation or Multilingual Fallback
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const langNames: Record<string, string> = {
            en: 'English', hi: 'Hindi', kn: 'Kannada', mr: 'Marathi',
            te: 'Telugu', ta: 'Tamil', ml: 'Malayalam', bn: 'Bengali',
            gu: 'Gujarati', pa: 'Punjabi'
          };
          const targetLangName = langNames[detectedLangCode] || 'English';

          const prompt = `You are Farmora's Multilingual Agricultural Assistant supporting 10 Indian languages.
User Role: ${userRole}.
Respond strictly in ${targetLangName}. Keep your answer friendly, actionable, accurate, and concise (2-3 sentences max).
Help with agricultural marketplace operations, APMC Mandi trends, Sell/Store/FPO guidance, escrow payments, and live GPS freight delivery.

User query: ${message}`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          return res.json({
            reply: response.text || "Farmora AI is ready to assist with your crop decision.",
            detectedLanguage: detectedLangCode
          });
        } catch (err) {
          console.warn("Gemini generation fallback:", err);
        }
      }

      const defaultReplies: Record<string, string> = {
        en: `Farmora AI: Regarding "${message}", our intelligent agricultural marketplace enables direct trading between farmers and wholesale buyers with verified Mandi rates, cold storage booking, and live GPS freight tracking.`,
        hi: `फार्मोरा एआई: "${message}" के संबंध में, हमारा कृषि मंच सत्यापित मंडी दरों, कोल्ड स्टोरेज और जीपीएस माल ट्रैकिंग के साथ किसानों और थोक खरीदारों को सीधे जोड़ता है।`,
        kn: `ಫಾರ್ಮೋರಾ ಎಐ: "${message}" ಬಗ್ಗೆ, ನಮ್ಮ ಕೃಷಿ ವೇದಿಕೆಯು ಮಂಡಿ ಬೆಲೆಗಳು, ಶೀತಲ ಸಂಗ್ರಹಾಗಾರ ಮತ್ತು ಜಿಪಿಎಸ್ ಟ್ರ್ಯಾಕಿಂಗ್‌ನೊಂದಿಗೆ ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸುತ್ತದೆ.`,
        mr: `फार्मोरा एआय: "${message}" बाबत, आपले व्यासपीठ थेट शेतमाल विक्री, खात्रीशीर बाजारभाव, कोल्ड स्टोरेज साठवणूक आणि थेट वाहतूक ट्रॅकिंगची सुविधा देते.`,
        te: `ఫార్మోరా ఏఐ: "${message}" కు సంబంధించి, మా వేదిక మార్కెట్ ధరలు, కోల్డ్ స్టോరేజ్ మరియు జీపీఎస్ ట్రాకింగ్‌తో రైతులు మరియు కొనుగోలుదారులను నేరుగా కలుపుతుంది.`,
        ta: `பார்மோரா ஏஐ: "${message}" பற்றி, எங்கள் விவசாய தளம் நேரடி வர்த்தகம், மண்டி விலை, குளிர்சாதன கிடங்கு மற்றும் ஜிபிஎஸ் சரக்கு கண்காணிப்பை வழங்குகிறது.`,
        ml: `ഫാർമോറ എഐ: "${message}" സംബന്ധിച്ച്, ഞങ്ങളുടെ പ്ലാറ്റ്‌ഫോം വിപണി വില, കോൾഡ് സ്റ്റോറേജ്, ജിപിഎസ് ട്രാക്കിംഗ് എന്നിവ ഉറപ്പാക്കുന്നു.`,
        bn: `ফার্মোরা এআই: "${message}" সম্পর্কে, আমাদের কৃষি প্ল্যাটফর্ম সরাসরি বাণিজ্য, কোল্ড স্টোরেজ এবং জিপিএস ট্র্যাকিং প্রদান করে।`,
        gu: `ફાર્મોરા એઆઈ: "${message}" અંગે, અમારું પ્લેટફોર્મ મંડી ભાવો, કોલ્ડ સ્ટોરેજ અને જીપીએસ ફ્રેઇટ ટ્રેકિંગ સાથે સીધો વેપાર સુનિશ્ચિત કરે છે.`,
        pa: `ਫਾਰਮੋਰਾ ਏਆਈ: "${message}" ਬਾਰੇ, ਸਾਡਾ ਖੇਤੀ ਪਲੇਟਫਾਰਮ ਮੰਡੀ ਭਾਅ, ਕੋਲਡ ਸਟੋਰੇਜ ਅਤੇ ਜੀਪੀਐਸ ਟਰੈਕਿੰਗ ਨਾਲ ਸਿੱਧਾ ਵਪਾਰ ਸੰਭਵ ਬਣਾਉਂਦਾ ਹੈ।`
      };

      res.json({
        reply: defaultReplies[detectedLangCode] || defaultReplies.en,
        detectedLanguage: detectedLangCode
      });
    } catch (error: any) {
      console.error("AI error:", error);
      res.json({
        reply: `Farmora AI: You can list produce, check APMC Mandi trends, and get instant SELL/STORE decision guidance on your Farmora dashboard.`
      });
    }
  });

  // ============================================================================
  // 7. COLD STORAGE & FPO ECOSYSTEM ENDPOINTS
  // ============================================================================

  // APMC Mandi price intelligence
  app.get("/api/market/intelligence", async (req, res) => {
    try {
      const { BENCHMARK_MANDI_PRICES } = await import('./src/services/marketData');
      res.json({ prices: BENCHMARK_MANDI_PRICES, source: 'VERIFIED_BENCHMARK' });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch Mandi intelligence" });
    }
  });

  // Buyer demands benchmark
  app.get("/api/market/demands", async (req, res) => {
    try {
      const { BENCHMARK_BUYER_DEMANDS } = await import('./src/services/marketData');
      res.json(BENCHMARK_BUYER_DEMANDS);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch buyer demands" });
    }
  });

  // Cold storage warehouse facilities
  app.get("/api/storage/warehouses", async (req, res) => {
    try {
      const { BENCHMARK_WAREHOUSES } = await import('./src/services/marketData');
      res.json(BENCHMARK_WAREHOUSES);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch storage facilities" });
    }
  });

  // Farmers Producer Organizations list
  app.get("/api/fpos", async (req, res) => {
    try {
      const { BENCHMARK_FPOS } = await import('./src/services/marketData');
      res.json(BENCHMARK_FPOS);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch FPOs" });
    }
  });

  // Buyer trust rating profile
  app.get("/api/buyers/:id/trust", async (req, res) => {
    try {
      const buyerId = parseInt(req.params.id);
      const { BENCHMARK_BUYER_TRUST } = await import('./src/services/marketData');
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

  // Notifications API
  app.get("/api/notifications", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, req.dbUser.id))
        .orderBy(desc(notifications.createdAt));
      res.json(userNotifications);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Storage booking creation
  app.post("/api/storage/book", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const { warehouseId, cropName, quantityTonnes, durationMonths, totalCost } = req.body;
      const booking = await db.insert(storageBookings).values({
        farmerId: req.dbUser.id,
        warehouseId,
        cropName,
        quantityTonnes: parseFloat(quantityTonnes),
        durationMonths: parseInt(durationMonths),
        totalCost: parseFloat(totalCost),
        status: 'ACTIVE'
      }).returning();
      
      await db.insert(notifications).values({
        userId: req.dbUser.id,
        title: 'Cold Storage Confirmed',
        message: `Reserved ${quantityTonnes} Tonnes space for ${cropName}. Total: ₹${totalCost}`,
        type: 'SUCCESS'
      });

      res.json(booking[0]);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to book storage" });
    }
  });

  // FPO Membership joining
  app.post("/api/fpo/join", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
      const { fpoId, cropName, committedQuantity } = req.body;
      const membership = await db.insert(fpoMembers).values({
        fpoId: parseInt(fpoId),
        farmerId: req.dbUser.id,
        cropName,
        committedQuantity: parseFloat(committedQuantity),
      }).returning();

      await db.insert(notifications).values({
        userId: req.dbUser.id,
        title: 'FPO Produce Aggregated',
        message: `Committed ${committedQuantity} kg of ${cropName} to FPO bulk pool.`,
        type: 'SUCCESS'
      });

      res.json(membership[0]);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to join FPO" });
    }
  });

  // Transport quality verification submission
  app.post("/api/transport/verify", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser || req.dbUser.role !== 'transporter') {
        return res.status(403).json({ error: "Only transport drivers can submit quality verification" });
      }
      const { requestId, cropPhotoUrl, verificationDetails, status } = req.body;
      const updated = await db.update(transportRequests)
        .set({
          cropPhotoUrl,
          qualityVerified: true,
          verificationDetails,
          verificationTimestamp: new Date(),
          status: status || 'QUALITY_VERIFIED'
        })
        .where(eq(transportRequests.id, requestId))
        .returning();

      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to submit quality verification" });
    }
  });

  // Get available transport delivery requests for drivers
  app.get("/api/transport/available", async (req, res) => {
    try {
      const available = await db.select()
        .from(transportRequests)
        .where(eq(transportRequests.status, 'AVAILABLE'))
        .orderBy(desc(transportRequests.createdAt));
      res.json(available);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch available delivery requests" });
    }
  });

  // Create a new transport request
  app.post("/api/transport/requests", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { 
        transactionId, 
        cropName, 
        quantity, 
        unit, 
        farmerName, 
        buyerName, 
        pickupLocation, 
        dropLocation, 
        pathType, 
        distanceKm, 
        farePayout 
      } = req.body;

      const created = await db.insert(transportRequests).values({
        transactionId: transactionId ? parseInt(transactionId) : null,
        cropName: cropName || 'Agricultural Produce',
        quantity: quantity ? parseFloat(quantity) : 1000,
        unit: unit || 'kg',
        farmerName: farmerName || req.dbUser?.name || 'Farmer',
        buyerName: buyerName || 'Wholesale Buyer',
        pickupLocation,
        dropLocation,
        pathType: pathType || 'Farmer → Buyer',
        distanceKm: distanceKm ? parseFloat(distanceKm) : 150,
        farePayout: farePayout ? parseFloat(farePayout) : 15000,
        status: 'AVAILABLE'
      }).returning();

      res.json(created[0]);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create transport request" });
    }
  });

  // Driver Accepts Delivery Request
  app.post("/api/transport/accept", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser || req.dbUser.role !== 'transporter') {
        return res.status(403).json({ error: "Only transport drivers can accept delivery requests" });
      }

      const { requestId } = req.body;
      const updated = await db.update(transportRequests)
        .set({
          transporterId: req.dbUser.id,
          status: 'ACCEPTED'
        })
        .where(eq(transportRequests.id, requestId))
        .returning();

      const reqDetails = updated[0];

      // Notify Farmer
      if (reqDetails && reqDetails.farmerName) {
        await db.insert(notifications).values({
          userId: req.dbUser.id, // Notification log
          title: 'Transport Driver Assigned',
          message: `Driver ${req.dbUser.name} accepted delivery #${requestId} for ${reqDetails.cropName}. Pickup route generated.`,
          type: 'INFO'
        });
      }

      res.json(reqDetails);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to accept transport request" });
    }
  });

  // Update Transport Status (PICKUP_STARTED, IN_TRANSIT, DELIVERED, COMPLETED)
  app.post("/api/transport/status", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { requestId, status } = req.body;
      const updated = await db.update(transportRequests)
        .set({ status })
        .where(eq(transportRequests.id, requestId))
        .returning();

      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update transport status" });
    }
  });

  // Mandi price trends API
  app.get("/api/market/trends", async (req, res) => {
    try {
      const trends = [
        { crop: 'Tomato', currentRate: 32, prevRate: 28, trend: 'UP', changePercent: 14.2, forecast: 'High wholesale demand expected in Mumbai & Thane markets' },
        { crop: 'Potato', currentRate: 22, prevRate: 24, trend: 'DOWN', changePercent: -8.3, forecast: 'Cold storage supply arrival lowering local Mandi prices' },
        { crop: 'Onion', currentRate: 45, prevRate: 40, trend: 'UP', changePercent: 12.5, forecast: 'Export demand surge driving APMC Lasalgaon prices higher' },
        { crop: 'Wheat', currentRate: 26, prevRate: 25, trend: 'STABLE', changePercent: 4.0, forecast: 'Steady procurement across regional government hubs' }
      ];
      res.json(trends);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch price trends" });
    }
  });

  // GPS Telemetry updates
  app.post("/api/tracking/update", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { transportRequestId, lat, lng } = req.body;
      const update = await db.insert(trackingUpdates).values({
        transportRequestId: parseInt(transportRequestId),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      }).returning();
      res.json(update[0]);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update tracking telemetry" });
    }
  });

  // Fetch telemetry history
  app.get("/api/tracking/history/:requestId", async (req, res) => {
    try {
      const transportRequestId = parseInt(req.params.requestId);
      const updates = await db
        .select()
        .from(trackingUpdates)
        .where(eq(trackingUpdates.transportRequestId, transportRequestId))
        .orderBy(desc(trackingUpdates.timestamp));
      res.json(updates);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch tracking history" });
    }
  });

  // ============================================================================
  // 8. VITE MIDDLEWARE & SERVER LAUNCH
  // ============================================================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Farmora - Agriculture Marketplace</title>
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"></script>
            </body>
          </html>
        `);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Farmora Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
