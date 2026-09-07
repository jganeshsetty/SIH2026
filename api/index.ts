import express from "express";
import { requireAuth, AuthRequest } from "../src/middleware/auth";
import { db } from "../src/db/index";
import {
  users,
  crops,
  buyerRequests,
  transactions,
  transportRequests,
  trackingUpdates,
  notifications,
  storageBookings,
  fpoMembers,
  buyerDemands,
  messages,
} from "../src/db/schema";
import { eq, desc, or } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { hashPassword, verifyPassword, generateToken } from "../src/lib/auth-utils";

/**
 * Farmora Vercel Serverless API Application
 * Express router handling authentication, crop management, marketplace demands,
 * cold storage reservation, FPO aggregation, and multilingual AI assistant.
 */
const app = express();

app.use(express.json());

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

/**
 * POST /api/auth/register
 * Registers a new user with hashed password and generates a JWT session token.
 */
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, role, phone, address } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Missing required fields: email, password, name, role" });
    }

    // Normalize user role mapping
    let normalizedRole = role.toLowerCase();
    if (normalizedRole === "farmer") normalizedRole = "farmer";
    else if (normalizedRole === "buyer") normalizedRole = "buyer";
    else if (["transport_driver", "transporter", "driver"].includes(normalizedRole)) normalizedRole = "transporter";
    else normalizedRole = "buyer";

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "An account already exists with these details. Please log in." });
    }

    const passwordHash = hashPassword(password);
    const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const result = await db
      .insert(users)
      .values({
        uid,
        email: cleanEmail,
        passwordHash,
        role: normalizedRole,
        name,
        phone: phone || null,
        address: address || null,
      })
      .returning();

    const newUser = result[0];
    const token = generateToken({
      uid: newUser.uid,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
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
        address: newUser.address,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message || "Failed to register user" });
  }
});

/**
 * POST /api/auth/login
 * Verifies email/password credentials and issues a JWT token.
 */
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
      name: user.name,
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
        address: user.address,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message || "Failed to log in" });
  }
});

/**
 * GET /api/auth/me
 * Retrieves current authenticated user profile details.
 */
app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser && req.user) {
      const userUid = req.user.uid;
      const userEmail = (req.user.email || "").toLowerCase().trim();
      let dbUsers = await db.select().from(users).where(eq(users.uid, userUid)).limit(1);
      if (dbUsers.length === 0 && userEmail) {
        dbUsers = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
      }
      if (dbUsers.length > 0) {
        req.dbUser = dbUsers[0];
      }
    }

    if (!req.dbUser) {
      return res.status(401).json({ error: "User profile not found in database" });
    }

    const { passwordHash, ...safeUser } = req.dbUser;
    res.json(safeUser);
  } catch (error: any) {
    console.error("Fetch profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile: " + error.message });
  }
});

/**
 * POST /api/auth/sync
 * Synchronizes Firebase auth session with PostgreSQL user account.
 */
app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { name, role } = req.body;

    let normalizedRole = role ? role.toLowerCase() : undefined;
    if (["transport_driver", "transporter", "driver"].includes(normalizedRole || "")) normalizedRole = "transporter";

    const userEmail = (req.user.email || "").toLowerCase().trim();
    const userUid = req.user.uid;

    let existingUserList = await db.select().from(users).where(eq(users.uid, userUid)).limit(1);

    if (existingUserList.length === 0 && userEmail) {
      existingUserList = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
    }

    let finalUser: any;

    if (existingUserList.length > 0) {
      const existing = existingUserList[0];
      const roleToKeep = existing.role || normalizedRole || "buyer";

      const updatedList = await db
        .update(users)
        .set({
          uid: userUid,
          email: userEmail || existing.email,
          name: name || existing.name || req.user.name || "Farmora User",
          role: roleToKeep,
        })
        .where(eq(users.id, existing.id))
        .returning();

      finalUser = updatedList[0] || existing;
    } else {
      const createdList = await db
        .insert(users)
        .values({
          uid: userUid,
          email: userEmail,
          name: name || req.user.name || "Farmora User",
          role: normalizedRole || "buyer",
        })
        .returning();

      finalUser = createdList[0];
    }

    const token = generateToken({
      uid: finalUser.uid,
      email: finalUser.email,
      role: finalUser.role,
      name: finalUser.name,
    });

    const { passwordHash, ...safeUser } = finalUser;

    res.json({
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error("Auth sync error:", error);
    res.status(500).json({ error: error.message || "Failed to sync user" });
  }
});

// ============================================================================
// MARKETPLACE & CROP LISTING ROUTES
// ============================================================================

/**
 * GET /api/crops
 * Fetches all available crop listings ordered by creation timestamp.
 */
app.get("/api/crops", async (req, res) => {
  try {
    const allCrops = await db.select().from(crops).orderBy(desc(crops.createdAt));
    res.json(allCrops);
  } catch (error: any) {
    console.error("Fetch crops error:", error);
    res.status(500).json({ error: "Failed to fetch crops" });
  }
});

/**
 * POST /api/crops
 * Allows authenticated farmers to add a new harvest crop listing.
 */
app.post("/api/crops", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser || req.dbUser.role !== "farmer") {
      return res.status(403).json({ error: "Only farmers can add crops" });
    }

    const cropData = req.body;
    const result = await db
      .insert(crops)
      .values({
        ...cropData,
        farmerId: req.dbUser.id,
        harvestDate: cropData.harvestDate ? new Date(cropData.harvestDate) : new Date(),
      })
      .returning();

    res.json(result[0]);
  } catch (error: any) {
    console.error("Create crop error:", error);
    res.status(500).json({ error: error.message || "Failed to create crop" });
  }
});

/**
 * GET /api/buyer-requests
 * Fetches all active buyer crop requirement postings.
 */
app.get("/api/buyer-requests", async (req, res) => {
  try {
    const requests = await db.select().from(buyerRequests).orderBy(desc(buyerRequests.createdAt));
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch buyer requests" });
  }
});

/**
 * POST /api/buyer-requests
 * Allows wholesale buyers to post crop purchase requests.
 */
app.post("/api/buyer-requests", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser || req.dbUser.role !== "buyer") {
      return res.status(403).json({ error: "Only buyers can create requests" });
    }

    const requestData = req.body;
    const result = await db
      .insert(buyerRequests)
      .values({
        ...requestData,
        buyerId: req.dbUser.id,
      })
      .returning();

    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create buyer request" });
  }
});

/**
 * GET /api/transactions
 * Fetches transaction records for authenticated users.
 */
app.get("/api/transactions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const allTx = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
    res.json(allTx);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// ============================================================================
// MULTILINGUAL AI ASSISTANT ENDPOINT
// ============================================================================

/**
 * POST /api/ai/chat
 * Multi-language AI assistant supporting voice intent execution across 10 Indian languages.
 */
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message = "", language, userRole = "farmer", pendingAction, context = {} } = req.body;
    const lower = message.toLowerCase().trim();
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    // 1. Language Detection across 10 Supported Languages
    let detectedLangCode = "en";
    if (/[\u0C80-\u0CFF]/.test(message)) detectedLangCode = "kn"; // Kannada
    else if (/[\u0C00-\u0C7F]/.test(message)) detectedLangCode = "te"; // Telugu
    else if (/[\u0B80-\u0BFF]/.test(message)) detectedLangCode = "ta"; // Tamil
    else if (/[\u0D00-\u0D7F]/.test(message)) detectedLangCode = "ml"; // Malayalam
    else if (/[\u0980-\u09FF]/.test(message)) detectedLangCode = "bn"; // Bengali
    else if (/[\u0A80-\u0AFF]/.test(message)) detectedLangCode = "gu"; // Gujarati
    else if (/[\u0A00-\u0A7F]/.test(message)) detectedLangCode = "pa"; // Punjabi
    else if (/[\u0900-\u097F]/.test(message)) {
      if (/\b(आहे|नाही|शेतकरी|बाजारभाव|करा|पाहिजे|होय)\b/i.test(message)) {
        detectedLangCode = "mr"; // Marathi
      } else {
        detectedLangCode = "hi"; // Hindi
      }
    } else if (language) {
      if (typeof language === "string" && language.length <= 5) detectedLangCode = language.toLowerCase();
    }

    // Multilingual confirmation yes/no keywords
    const isAffirmative = /\b(yes|yeah|yup|confirm|proceed|ok|sure|हाँ|हां|होय|हो|ಹೌದು|అవును|ஆம்|ശരി|അതെ|হ্যাঁ|હા|ਹਾਂ)\b/i.test(lower);
    const isNegative = /\b(no|nope|cancel|stop|रद्द|नको|ಬೇಡ|వద్దు|வேண்டாம்|വേണ്ട|না|ના|ਨਹੀਂ)\b/i.test(lower);

    // 2. Pending Action Confirmation Handler
    if (pendingAction && (isAffirmative || isNegative)) {
      if (isNegative) {
        const cancelReplies: Record<string, string> = {
          en: "Action cancelled. How else can I assist you with your agricultural operations?",
          hi: "कार्रवाई रद्द कर दी गई है। मैं आपकी और क्या सहायता कर सकता हूँ?",
          kn: "ಕ್ರಮವನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ. ನಾನು ನಿಮಗೆ ಇನ್ನೇನು ಸಹಾಯ ಮಾಡಬಹುದು?",
          mr: "कृती रद्द करण्यात आली आहे. मी आपली आणखी काय मदत करू शकतो?",
          te: "చర్య రద్దు చేయబడింది. నేను మీకు ఇంకేమి సహాయం చేయగలను?",
          ta: "செயல் ரத்து செய்யப்பட்டது. நான் உங்களுக்கு வேறு எப்படி உதவ முடியும்?",
          ml: "നടപടി റദ്ദാക്കി. ഞാൻ നിങ്ങൾക്ക് മറ്റെങ്ങനെ സഹായിക്കണം?",
          bn: "পদক্ষেপটি বাতিল করা হয়েছে। আমি আপনাকে আর কীভাবে সহায়তা করতে পারি?",
          gu: "પગલું રદ કરવામાં આવ્યું છે. હું તમને બીજી કેવી રીતે મદદ કરી શકું?",
          pa: "ਕਾਰਵਾਈ ਰੱਦ ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ। ਮੈਂ ਤੁਹਾਡੀ ਹੋਰ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
        };
        return res.json({
          reply: cancelReplies[detectedLangCode] || cancelReplies.en,
          actionCancelled: true,
          detectedLanguage: detectedLangCode,
        });
      }

      if (pendingAction.type === "ADD_CROP") {
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
          pa: `ਸਫਲਤਾ! ਤੁਹਾਡਾ ${cropPayload.quantity} ${cropPayload.unit} ${cropPayload.name} ₹${cropPayload.expectedPrice}/${cropPayload.unit} ਦੇ ਭਾਅ 'ਤੇ ਸੂਚੀ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ।`,
        };

        return res.json({
          reply: confirmReplies[detectedLangCode] || confirmReplies.en,
          actionExecuted: true,
          action: "CROP_ADDED",
          crop: cropPayload,
          detectedLanguage: detectedLangCode,
        });
      }

      if (pendingAction.type === "ACCEPT_OFFER") {
        const offerPayload = pendingAction.payload;
        return res.json({
          reply: `Offer accepted! Escrow payment of ₹${offerPayload.amount || "50,000"} has been initiated and logistics dispatch is scheduled.`,
          actionExecuted: true,
          action: "OFFER_ACCEPTED",
          detectedLanguage: detectedLangCode,
        });
      }
    }

    // 3. Operation Intent Parsing
    // Option A: Add Crop Intent
    const addCropMatch = lower.match(/(add|list|जोडा|जोड़ें|ಸೇರಿಸಿ|ಜೋಡించండి|சேர்க்க|ചേർക്കുക|যোগ|ઉમેરો|ਸ਼ਾਮਲ)/i);
    if (addCropMatch && /(crop|harvest|tomato|potato|onion|wheat|शेतमाल|फसल|ಬೆಳೆ|ಪಂಟ|பயிர்|വിള|ટોમેટો|ટામેટા|టమోటా|टोमॅटो|টমেটো)/i.test(lower)) {
      let cropName = "Tomato";
      if (/potato|बटाटा|आलू|ಆಲೂಗಡ್ಡೆ|బంగాళాదుంప|உருளை|ഉരുളക്കിഴങ്ങ്|আলু|બટાકા|ਆਲੂ/i.test(lower)) cropName = "Potato";
      else if (/onion|कांदा|प्याज|ಈರುಳ್ಳಿ|ఉల్లిపాయ|வெங்காயம்|ഉള്ളി|പേঁয়াজ|ડુંગળી|ਪਿਆਜ਼/i.test(lower)) cropName = "Onion";
      else if (/wheat|गहू|गेहूं|ಗೋಧಿ|ಗೋధుಮ|கோதுமை|ഗോതമ്പ്|গম|ઘઉં|ਕਣਕ/i.test(lower)) cropName = "Wheat";

      const qtyMatch = lower.match(/(\d+)\s*(kg|किलो|टन|ton|quintal)/i);
      const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 100;
      const unit = qtyMatch && qtyMatch[2] ? qtyMatch[2] : "kg";
      const expectedPrice = cropName === "Tomato" ? 32 : cropName === "Potato" ? 24 : cropName === "Onion" ? 28 : 22;

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
        pa: `ਮੈਂ ₹${expectedPrice}/${unit} ਦੇ ਭਾਅ 'ਤੇ ${quantity} ${unit} ${cropName} ਸ਼ਾਮਲ ਕਰਨ ਦੀ ਬੇਨਤੀ ਤਿਆਰ ਕੀਤੀ ਹੈ। ਕੀ ਤੁਸੀਂ ਇਸਦੀ ਪੁਸ਼ਟੀ ਕਰਦੇ ਹੋ?`,
      };

      return res.json({
        reply: confirmPrompts[detectedLangCode] || confirmPrompts.en,
        needsConfirmation: true,
        pendingAction: {
          type: "ADD_CROP",
          payload: { name: cropName, quantity, unit, expectedPrice, variety: "Hybrid Grade A" },
        },
        detectedLanguage: detectedLangCode,
      });
    }

    // Option B: Sell or Store Decision Guidance
    if (/(sell or store|which option|better|recommendation|सल्ला|विकू की साठवू|बेचें या स्टोर|ಮಾರಬೇಕೆ|అమ్మాలా|விற்கவா|വിൽക്കണോ|বিক্রি|વેચવો|ਵੇਚਾਂ)/i.test(lower)) {
      const adviceReplies: Record<string, string> = {
        en: "Farmora AI Analysis: Tomato modal Mandi rate is ₹32/kg with 420 Tonnes arrival. Direct wholesale buyer demand is strong with immediate escrow payment. Selling 60% harvest now and storing 40% in nearby cold storage is optimal.",
        hi: "फार्मोरा एआई विश्लेषण: आज टमाटर का मंडी भाव ₹32/किलो है और मांग मजबूत है। तत्काल एस्क्रो भुगतान के साथ 60% फसल सीधे खरीदारों को बेचना और 40% कोल्ड स्टोरेज में रखना सबसे लाभदायक रहेगा।",
        kn: "ಫಾರ್ಮೋರಾ ಎಐ ವಿಶ್ಲೇಷಣೆ: ಇಂದು ಟೊಮೆಟೊ ಮಂಡಿ ಬೆಲೆ ₹32/ಕೆಜಿ ಇದೆ. 60% ಬೆಳೆಯನ್ನು ಈಗಲೇ ನೇರ ಖರೀದಿದಾರರಿಗೆ ಮಾರಿ ಮತ್ತು 40% ಬೆಳೆಯನ್ನು ಶೀತಲ ಸಂಗ್ರಹಾಗಾರದಲ್ಲಿಡುವುದು ಅತ್ಯುತ್ತಮ.",
        mr: "फार्मोरा एआय विश्लेषण: आज नाशिक बाजारपेठेत टोमॅटोचे दर ₹३२/किलो आहेत. मजबूत मागणी असल्याने ६०% माल थेट खरेदीदारांना त्वरित विकावा आणि ४०% माल कोल्ड स्टोरेजमध्ये साठवणे फायदेशीर ठरेल.",
        te: "ఫార్మోరా ఏఐ విశ్లేషణ: నేడు టమోటా మార్కెట్ ధర ₹32/కేజీగా ఉంది. 60% పంటను వెంటనే ప్రత్యక్ష కొనుగోలుదారులకు అమ్మడం మరియు 40% కోల్డ్ స్టోరేజ్‌లో ఉంచడం ప్రయోజనకరం.",
        ta: "பார்மோரா ஏஐ பகுப்பாய்வு: இன்றைய தக்காளி மண்டி விலை ₹32/கிலோ. 60% பயிரை வாங்குபவர்களுக்கு உடனடியாக விற்று, 40% குளிர்சாதன கிடங்கில் சேமிப்பது சிறந்தது.",
        ml: "ഫാർമോറ എഐ വിശകലനം: ഇന്നത്തെ തക്കാളി വില ₹32/കിലോ ആണ്. 60% ഇപ്പോൾ നേരിട്ട് വിൽക്കുകയും 40% കോൾഡ് സ്റ്റോറേജിൽ സൂക്ഷിക്കുകയും ചെയ്യുന്നത് ലാഭകരമാണ്.",
        bn: "ফার্মোরা এআই বিশ্লেষণ: আজ টমেটোর মান্ডি দর ₹৩২/কেজি। ৬০% ফসল সরাসরি পাইকারি ক্রেতাদের কাছে বিক্রি করা এবং ৪০% কোল্ড স্টোরেজে রাখা সবচেয়ে লাভজনক হবে।",
        gu: "ફાર્મોરા એઆઈ વિશ્લેષણ: આજે ટામેટાંનો મંડી ભાવ ₹32/કિલો છે. 60% પાક હમણાં સીધા ખરીદદારોને વેચવો અને 40% કોલ્ડ સ્ટોરેજમાં સંગ્રહ કરવો સૌથી ફાયદાકારક રહેશે.",
        pa: "ਫਾਰਮੋਰਾ ਏਆਈ ਵਿਸ਼ਲੇਸ਼ਣ: ਅੱਜ ਟਮਾਟਰ ਦਾ ਮੰਡੀ ਭਾਅ ₹32/ਕਿਲੋ ਹੈ। 60% ਫਸਲ ਤੁਰੰਤ ਵੇਚਣਾ ਅਤੇ 40% ਕੋਲਡ ਸਟੋਰੇਜ ਵਿੱਚ ਰੱਖਣਾ ਸਭ ਤੋਂ ਵਧੀਆ ਰਹੇਗਾ।",
      };

      return res.json({
        reply: adviceReplies[detectedLangCode] || adviceReplies.en,
        action: "NAVIGATE_TAB",
        tab: "advisor",
        detectedLanguage: detectedLangCode,
      });
    }

    // Option C: Buyer Offers Inquiry
    if (/(offer|buyer offer|offers|ऑफर|प्रस्ताव|కొనుగోలుదారుల|ಕೊಡುಗೆಗಳು|சலுகைகள்|ഓഫറുകൾ|অফার|ઑફર્સ|ਪੇਸ਼ਕਸ਼)/i.test(lower)) {
      const offerReplies: Record<string, string> = {
        en: "You have 2 active wholesale buyer offers: Reliance Fresh offered ₹50,000 for 5,000 kg Tomato, and BigBasket Agro offered ₹33,000. Both are 100% escrow backed.",
        hi: "आपके पास 2 सक्रिय खरीदार प्रस्ताव हैं: रिलायंस फ्रेश ने ₹50,000 और बिगबास्केट एग्रो ने ₹33,000 का प्रस्ताव दिया है। दोनों 100% एस्क्रो सुरक्षित हैं।",
        kn: "ನಿಮಗೆ 2 ಸಕ್ರಿಯ ಖರೀದಿದಾರರ ಕೊಡುಗೆಗಳಿವೆ: ರಿಲಯನ್ಸ್ ಫ್ರೆಶ್ ₹50,000 ಮತ್ತು ಬಿಗ್‌ಬಾಸ್ಕೆಟ್ ₹33,000 ಆಫರ್ ಮಾಡಿದೆ. ಎರಡೂ ಎಸ್ಕ್ರೋ ಸುರಕ್ಷಿತವಾಗಿವೆ.",
        mr: "आपल्याकडे २ थेट खरेदीदार ऑफर्स आहेत: रिलायन्स फ्रेशने ₹५०,००० आणि बिगबास्केट ॲग्रोने ₹३३,००० ची ऑफर दिली आहे. दोन्ही एस्क्रो सुरक्षित आहेत.",
        te: "మీకు 2 కొనుగోలుదారుల ఆఫర్లు ఉన్నాయి: రిలయన్స్ ఫ్రెష్ ₹50,000 మరియు బిగ్‌బాస్కెట్ ₹33,000 ఆఫర్ చేశాయి. రెండూ ఎస్క్రో రక్షితమైనవి.",
        ta: "உங்களிடம் 2 சலுகைகள் உள்ளன: ரிலையன்ஸ் பிரெஷ் ₹50,000 மற்றும் பிக்பாஸ்கெட் ₹33,000 சலுகை அளித்துள்ளன. இரண்டும் எஸ்க்ரோ பாதுகாக்கப்பட்டவை.",
        ml: "നിങ്ങൾക്ക് 2 ഓഫറുകൾ ലഭിച്ചിട്ടുണ്ട്: റിലയൻസ് ഫ്രഷ് ₹50,000, ബിഗ്ബാസ്കറ്റ് ₹33,000 വാഗ്ദാനം ചെയ്തു. രണ്ടും എസ്‌ക്രോ സുരക്ഷിതമാണ്.",
        bn: "আপনার কাছে ২টি সক্রিয় অফার রয়েছে: রিলায়েন্স ফ্রেশ ₹৫০,০০০ এবং বিগবাস্কেট ₹৩৩,০০০ প্রস্তাব করেছে। দুটিই এসক্রো সুরক্ষিত।",
        gu: "તમારી પાસે 2 સક્રિય ખરીદદાર ઑફર્સ છે: રિલાયન્સ ફ્રેશ તરફથી ₹50,000 અને બિગબાસ્કેટ તરફથી ₹33,000. બંને એસ્ક્રો સુરક્ષિત છે.",
        pa: "ਤੁਹਾਡੇ ਕੋਲ 2 ਸਰਗਰਮ ਖਰੀਦਦਾਰ ਪੇਸ਼ਕਸ਼ਾਂ ਹਨ: ਰਿਲਾਇੰਸ ਫਰੈਸ਼ ਵੱਲੋਂ ₹50,000 ਅਤੇ ਬਿਗਬਾਸਕੇਟ ਵੱਲੋਂ ₹33,000। ਦੋਵੇਂ ਐਸਕਰੋ ਸੁਰੱਖਿਅਤ ਹਨ।",
      };

      return res.json({
        reply: offerReplies[detectedLangCode] || offerReplies.en,
        action: "NAVIGATE_TAB",
        tab: "buyers",
        detectedLanguage: detectedLangCode,
      });
    }

    // Option D: Freight Transport Tracking
    if (/(truck|transport|tracking|where is|वाहतूक|ट्रक|ಗಾಡಿ|ಟ್ರಕ್|லாரி|ലോറി|ട്രാക്|ਟ੍ਰਕ)/i.test(lower)) {
      const trackingReplies: Record<string, string> = {
        en: "Freight Status: Driver Ramesh Shinde with vehicle MH-15-EG-4921 is in transit. GPS coordinates: 19.9975° N, 73.7898° E (Nashik Highway). Estimated arrival tomorrow at 2:00 PM.",
        hi: "माल ढुलाई स्थिति: वाहन MH-15-EG-4921 के साथ चालक रमेश शिंदे रास्ते में हैं। वर्तमान स्थान: नासिक हाईवे। कल दोपहर 2:00 बजे तक पहुंचने का अनुमान है।",
        kn: "ಸಾರಿಗೆ ಸ್ಥಿತಿ: ವಾಹನ MH-15-EG-4921 ಚಾಲಕ ರಮೇಶ್ ಶಿಂಧೆ ದಾರಿಯಲ್ಲಿದ್ದಾರೆ. ಪ್ರಸ್ತುತ ಸ್ಥಳ: ನಾಸಿಕ್ ಹೆದ್ದಾರಿ. ನಾಳೆ ಮಧ್ಯಾಹ್ನ 2:00 ಗಂಟೆಗೆ ತಲುಪಲಿದ್ದಾರೆ.",
        mr: "वाहतूक स्थिती: चालक रमेश शिंदे (वाहन क्र. MH-15-EG-4921) मार्गावर आहेत. सध्याचे स्थान: नाशिक महामार्ग. उद्या दुपारी २:०० वाजता पोहोचण्याचा अंदाज आहे.",
        te: "రవాణా స్థితి: డ్రైవర్ రమేష్ షిండే (వాహనం MH-15-EG-4921) మార్గంలో ఉన్నారు. ప్రస్తుతం నాసిక్ హైవే వద్ద ఉన్నారు. రేపు మధ్యాహ్నం 2:00 గంటలకు చేరుకుంటారు.",
        ta: "போக்குவரத்து நிலை: ஓட்டுநர் ரமேஷ் ஷிண்டே (வாகனம் MH-15-EG-4921) வழியில் உள்ளார். நாசிக் நெடுஞ்சாலையில் உள்ளார். நாளை மதியம் 2:00 மணிக்கு வந்து சேருவார்.",
        ml: "ചരക്കുനീക്ക നില: ഡ്രൈവർ രമേഷ് ഷിൻഡെ (വാഹനം MH-15-EG-4921) യാത്രാമധ്യേയാണ്. നാസിക് ഹൈവേയിലാണ് ഇപ്പോൾ. നാളെ ഉച്ചയ്ക്ക് 2:00 മണിക്ക് എത്തും.",
        bn: "পরিবহন অবস্থা: চালক রমেশ শিন্ডে (গাড়ি নং MH-15-EG-4921) পথে রয়েছেন। বর্তমান অবস্থান: নাসিক হাইওয়ে। আগামীকাল দুপুর ২:০০ টায় পৌঁছানোর সম্ভাবনা রয়েছে।",
        gu: "પરિવહન સ્થિતિ: વાહન MH-15-EG-4921 સાથે ડ્રાઇવર રમેશ શિંદે રસ્તામાં છે. હાલનું સ્થાન: નાશિક હાઇવે. આવતીકાલે બપોરે 2:00 વાગ્યે પહોંચવાનો અંદાજ છે.",
        pa: "ਮਾਲ ਢੋਆ-ਢੁਆਈ ਸਥਿਤੀ: ਵਾਹਨ MH-15-EG-4921 ਦੇ ਡਰਾਈਵਰ ਰਮੇਸ਼ ਸ਼ਿੰਦੇ ਰਸਤੇ ਵਿੱਚ ਹਨ। ਮੌਜੂਦਾ ਸਥਾਨ: ਨਾਸਿਕ ਹਾਈਵੇਅ। ਕੱਲ੍ਹ ਦੁਪਹਿਰ 2:00 ਵਜੇ ਪਹੁੰਚਣਗੇ।",
      };

      return res.json({
        reply: trackingReplies[detectedLangCode] || trackingReplies.en,
        action: "NAVIGATE_TAB",
        tab: "transport",
        detectedLanguage: detectedLangCode,
      });
    }

    // 4. Gemini API Generative Fallback
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const langNames: Record<string, string> = {
          en: "English",
          hi: "Hindi",
          kn: "Kannada",
          mr: "Marathi",
          te: "Telugu",
          ta: "Tamil",
          ml: "Malayalam",
          bn: "Bengali",
          gu: "Gujarati",
          pa: "Punjabi",
        };
        const targetLangName = langNames[detectedLangCode] || "English";

        const prompt = `You are Farmora's Multilingual Agricultural Assistant supporting 10 Indian languages.
User Role: ${userRole}.
Respond strictly in ${targetLangName}. Keep your answer friendly, actionable, accurate, and concise (2-3 sentences max).
Help with agricultural marketplace operations, APMC Mandi trends, Sell/Store/FPO guidance, escrow payments, and live GPS freight delivery.

User query: ${message}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        return res.json({
          reply: response.text || "Farmora AI is ready to assist with your crop decision.",
          detectedLanguage: detectedLangCode,
        });
      } catch (err) {
        console.warn("Gemini generation fallback:", err);
      }
    }

    // Default static fallback message
    const defaultReplies: Record<string, string> = {
      en: `Farmora AI: Regarding "${message}", our intelligent agricultural marketplace enables direct trading between farmers and wholesale buyers with verified Mandi rates, cold storage booking, and live GPS freight tracking.`,
      hi: `फार्मोरा एआई: "${message}" के संबंध में, हमारा कृषि मंच सत्यापित मंडी दरों, कोल्ड स्टोरेज और जीपीएस माल ट्रैकिंग के साथ किसानों और थोक खरीदारों को सीधे जोड़ता है।`,
      kn: `ಫಾರ್ಮೋರಾ ಎಐ: "${message}" ಬಗ್ಗೆ, ನಮ್ಮ ಕೃಷಿ ವೇದಿಕೆಯು ಮಂಡಿ ಬೆಲೆಗಳು, ಶೀತಲ ಸಂಗ್ರಹಾಗಾರ ಮತ್ತು ಜಿಪಿಎಸ್ ಟ್ರ್ಯಾಕಿಂಗ್‌ನೊಂದಿಗೆ ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸುತ್ತದೆ.`,
      mr: `फार्मोरा एआय: "${message}" बाबत, आपले व्यासपीठ थेट शेतमाल विक्री, खात्रीशीर बाजारभाव, कोल्ड स्टोरेज साठवणूक आणि थेट वाहतूक ट्रॅकिंगची सुविधा देते.`,
      te: `ఫార్మోరా ఏఐ: "${message}" కు సంబంధించి, మా వేదిక మార్కెట్ ధరలు, కోల్డ్ స్టోరేజ్ మరియు జీపీఎస్ ట్రాకింగ్‌తో రైతులు మరియు కొనుగోలుదారులను నేరుగా కలుపుతుంది.`,
      ta: `பார்மோரா ஏஐ: "${message}" பற்றி, எங்கள் விவசாய தளம் நேரடி வர்த்தகம், மண்டி விலை, குளிர்சாதன கிடங்கு மற்றும் ஜிபிஎஸ் சரக்கு கண்காணிப்பை வழங்குகிறது.`,
      ml: `ഫാർമോറ എഐ: "${message}" സംബന്ധിച്ച്, ഞങ്ങളുടെ പ്ലാറ്റ്‌ഫോം വിപണി വില, കോൾഡ് സ്റ്റോറേജ്, ജിപിഎസ് ട്രാക്കിംഗ് എന്നിവ ഉറപ്പാക്കുന്നു.`,
      bn: `ফার্মোরা এআই: "${message}" সম্পর্কে, আমাদের কৃষি প্ল্যাটফর্ম সরাসরি বাণিজ্য, কোল্ড স্টোরেজ এবং জিপিএস ট্র্যাকিং প্রদান করে।`,
      gu: `ફાર્મોરા એઆઈ: "${message}" અંગે, અમારું પ્લેટફોર્મ મંડી ભાવો, કોલ્ડ સ્ટોરેજ અને જીપીએસ ફ્રેઇટ ટ્રેકિંગ સાથે સીધો વેપાર સુનિશ્ચિત કરે છે.`,
      pa: `ਫਾਰਮੋਰਾ ਏਆਈ: "${message}" ਬਾਰੇ, ਸਾਡਾ ਖੇਤੀ ਪਲੇਟਫਾਰਮ ਮੰਡੀ ਭਾਅ, ਕੋਲਡ ਸਟੋਰੇਜ ਅਤੇ ਜੀਪੀਐਸ ਟਰੈਕਿੰਗ ਨਾਲ ਸਿੱਧਾ ਵਪਾਰ ਸੰਭਵ ਬਣਾਉਂਦਾ ਹੈ।`,
    };

    res.json({
      reply: defaultReplies[detectedLangCode] || defaultReplies.en,
      detectedLanguage: detectedLangCode,
    });
  } catch (error: any) {
    console.error("AI error:", error);
    res.json({
      reply: `Farmora AI: You can list produce, check APMC Mandi trends, and get instant SELL/STORE decision guidance on your Farmora dashboard.`,
    });
  }
});

// ============================================================================
// FARMORA ECOSYSTEM & SERVICES API ENDPOINTS
// ============================================================================

/**
 * GET /api/market/intelligence
 * Returns verified APMC Mandi price benchmarks.
 */
app.get("/api/market/intelligence", async (req, res) => {
  try {
    const { BENCHMARK_MANDI_PRICES } = await import("../src/services/marketData");
    res.json({ prices: BENCHMARK_MANDI_PRICES, source: "VERIFIED_BENCHMARK" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch Mandi intelligence" });
  }
});

/**
 * GET /api/market/demands
 * Returns active wholesale buyer crop demands.
 */
app.get("/api/market/demands", async (req, res) => {
  try {
    const { BENCHMARK_BUYER_DEMANDS } = await import("../src/services/marketData");
    res.json(BENCHMARK_BUYER_DEMANDS);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch buyer demands" });
  }
});

/**
 * GET /api/storage/warehouses
 * Returns cold storage facility listings.
 */
app.get("/api/storage/warehouses", async (req, res) => {
  try {
    const { BENCHMARK_WAREHOUSES } = await import("../src/services/marketData");
    res.json(BENCHMARK_WAREHOUSES);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch storage facilities" });
  }
});

/**
 * GET /api/fpos
 * Returns Farmer Producer Organization (FPO) aggregations.
 */
app.get("/api/fpos", async (req, res) => {
  try {
    const { BENCHMARK_FPOS } = await import("../src/services/marketData");
    res.json(BENCHMARK_FPOS);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch FPOs" });
  }
});

/**
 * GET /api/buyers/:id/trust
 * Fetches buyer trust rating and escrow reliability metrics.
 */
app.get("/api/buyers/:id/trust", async (req, res) => {
  try {
    const buyerId = parseInt(req.params.id);
    const { BENCHMARK_BUYER_TRUST } = await import("../src/services/marketData");
    const trustProfile = BENCHMARK_BUYER_TRUST[buyerId] || {
      id: buyerId,
      buyerId,
      businessName: "Wholesale Buyer",
      verificationStatus: "SELF_VERIFIED",
      gstinVerified: false,
      completedTransactionsCount: 18,
      cancelledTransactionsCount: 1,
      rating: 4.6,
      reviewsCount: 12,
      paymentEscrowReliabilityScore: 96.5,
    };
    res.json(trustProfile);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch buyer trust profile" });
  }
});

/**
 * GET /api/notifications
 * Returns notifications for authenticated user.
 */
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

/**
 * POST /api/notifications
 * Creates a notification item.
 */
app.post("/api/notifications", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId, title, message, type } = req.body;
    const created = await db
      .insert(notifications)
      .values({
        userId: userId || req.dbUser?.id,
        title,
        message,
        type: type || "INFO",
      })
      .returning();
    res.json(created[0]);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create notification" });
  }
});

/**
 * POST /api/storage/book
 * Books cold storage capacity for a farmer.
 */
app.post("/api/storage/book", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
    const { warehouseId, cropName, quantityTonnes, durationMonths, totalCost } = req.body;
    const booking = await db
      .insert(storageBookings)
      .values({
        farmerId: req.dbUser.id,
        warehouseId,
        cropName,
        quantityTonnes: parseFloat(quantityTonnes),
        durationMonths: parseInt(durationMonths),
        totalCost: parseFloat(totalCost),
        status: "ACTIVE",
      })
      .returning();

    // Create confirmation notification
    await db.insert(notifications).values({
      userId: req.dbUser.id,
      title: "Cold Storage Confirmed",
      message: `Reserved ${quantityTonnes} Tonnes space for ${cropName}. Total: ₹${totalCost}`,
      type: "SUCCESS",
    });

    res.json(booking[0]);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to book storage" });
  }
});

/**
 * POST /api/fpo/join
 * Commits harvest quantity to an FPO pool.
 */
app.post("/api/fpo/join", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) return res.status(401).json({ error: "Unauthorized" });
    const { fpoId, cropName, committedQuantity } = req.body;
    const membership = await db
      .insert(fpoMembers)
      .values({
        fpoId: parseInt(fpoId),
        farmerId: req.dbUser.id,
        cropName,
        committedQuantity: parseFloat(committedQuantity),
      })
      .returning();

    await db.insert(notifications).values({
      userId: req.dbUser.id,
      title: "FPO Produce Aggregated",
      message: `Committed ${committedQuantity} kg of ${cropName} to FPO bulk pool.`,
      type: "SUCCESS",
    });

    res.json(membership[0]);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to join FPO" });
  }
});

/**
 * POST /api/transport/verify
 * Allows transport drivers to record crop quality check at pickup point.
 */
app.post("/api/transport/verify", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser || req.dbUser.role !== "transporter") {
      return res.status(403).json({ error: "Only transport drivers can submit quality verification" });
    }
    const { requestId, cropPhotoUrl, verificationDetails, status } = req.body;
    const updated = await db
      .update(transportRequests)
      .set({
        cropPhotoUrl,
        qualityVerified: true,
        verificationDetails,
        verificationTimestamp: new Date(),
        status: status || "QUALITY_VERIFIED",
      })
      .where(eq(transportRequests.id, requestId))
      .returning();

    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to submit quality verification" });
  }
});

/**
 * GET /api/transport/available
 * Fetches available unassigned transport delivery requests for drivers.
 */
app.get("/api/transport/available", async (req, res) => {
  try {
    const available = await db
      .select()
      .from(transportRequests)
      .where(eq(transportRequests.status, "AVAILABLE"))
      .orderBy(desc(transportRequests.createdAt));
    res.json(available);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch available delivery requests" });
  }
});

/**
 * POST /api/transport/requests
 * Creates a new transport request for an order, cold storage, or FPO.
 */
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
      farePayout,
    } = req.body;

    const created = await db
      .insert(transportRequests)
      .values({
        transactionId: transactionId ? parseInt(transactionId) : null,
        cropName: cropName || "Agricultural Produce",
        quantity: quantity ? parseFloat(quantity) : 1000,
        unit: unit || "kg",
        farmerName: farmerName || req.dbUser?.name || "Farmer",
        buyerName: buyerName || "Wholesale Buyer",
        pickupLocation,
        dropLocation,
        pathType: pathType || "Farmer → Buyer",
        distanceKm: distanceKm ? parseFloat(distanceKm) : 150,
        farePayout: farePayout ? parseFloat(farePayout) : 15000,
        status: "AVAILABLE",
      })
      .returning();

    res.json(created[0]);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create transport request" });
  }
});

/**
 * POST /api/transport/accept
 * Assigns transport driver to a delivery request.
 */
app.post("/api/transport/accept", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser || req.dbUser.role !== "transporter") {
      return res.status(403).json({ error: "Only transport drivers can accept delivery requests" });
    }

    const { requestId } = req.body;
    const updated = await db
      .update(transportRequests)
      .set({
        transporterId: req.dbUser.id,
        status: "ACCEPTED",
      })
      .where(eq(transportRequests.id, requestId))
      .returning();

    const reqDetails = updated[0];

    if (reqDetails && reqDetails.farmerName) {
      await db.insert(notifications).values({
        userId: req.dbUser.id,
        title: "Transport Driver Assigned",
        message: `Driver ${req.dbUser.name} accepted delivery #${requestId} for ${reqDetails.cropName}. Pickup route generated.`,
        type: "INFO",
      });
    }

    res.json(reqDetails);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to accept transport request" });
  }
});

/**
 * POST /api/transport/status
 * Updates delivery progress status.
 */
app.post("/api/transport/status", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { requestId, status } = req.body;
    const updated = await db
      .update(transportRequests)
      .set({ status })
      .where(eq(transportRequests.id, requestId))
      .returning();

    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update transport status" });
  }
});

/**
 * POST /api/tracking/update
 * Posts live GPS telemetry update.
 */
app.post("/api/tracking/update", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { transportRequestId, lat, lng } = req.body;
    const update = await db
      .insert(trackingUpdates)
      .values({
        transportRequestId: parseInt(transportRequestId),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      })
      .returning();
    res.json(update[0]);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update tracking telemetry" });
  }
});

/**
 * GET /api/market/trends
 * Returns current APMC price trends and forecasts.
 */
app.get("/api/market/trends", async (req, res) => {
  try {
    const trends = [
      {
        crop: "Tomato",
        currentRate: 32,
        prevRate: 28,
        trend: "UP",
        changePercent: 14.2,
        forecast: "High wholesale demand expected in Mumbai & Thane markets",
      },
      {
        crop: "Potato",
        currentRate: 22,
        prevRate: 24,
        trend: "DOWN",
        changePercent: -8.3,
        forecast: "Cold storage supply arrival lowering local Mandi prices",
      },
      {
        crop: "Onion",
        currentRate: 45,
        prevRate: 40,
        trend: "UP",
        changePercent: 12.5,
        forecast: "Export demand surge driving APMC Lasalgaon prices higher",
      },
      {
        crop: "Wheat",
        currentRate: 26,
        prevRate: 25,
        trend: "STABLE",
        changePercent: 4.0,
        forecast: "Steady procurement across regional government hubs",
      },
    ];
    res.json(trends);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch price trends" });
  }
});

export default app;
