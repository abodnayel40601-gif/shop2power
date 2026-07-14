import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import crypto from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK safely with project-id fallback
let isFirebaseAdminActive = false;
try {
  if (getApps().length === 0) {
    initializeApp({
      projectId: "shop2power1"
    });
  }
  isFirebaseAdminActive = true;
  console.log("Firebase Admin SDK initialized successfully");
} catch (error) {
  console.log("[Firebase Admin Info] Initialization skipped or failed (using local JSON DB fallback).");
}

// Local persistent JSON database fallback for passwords and previousPasswords
const LOCAL_DB_PATH = path.join(__dirname, "local_users_db.json");

interface LocalUserRecord {
  email: string;
  password?: string;
  previousPasswords?: string[];
  displayName?: string;
}

const PASSWORD_SALT = process.env.PASSWORD_SALT || "Shop2Power_Secure_Salt_2026!";

function hashPassword(password: string): string {
  return crypto.createHmac("sha256", PASSWORD_SALT).update(password).digest("hex");
}

function verifyPassword(inputPassword: string, storedPasswordHash: string): boolean {
  if (!storedPasswordHash) return false;
  if (storedPasswordHash.length === 64 && /^[0-9a-f]+$/.test(storedPasswordHash)) {
    return hashPassword(inputPassword) === storedPasswordHash;
  }
  return inputPassword === storedPasswordHash;
}

function getLocalUser(email: string): LocalUserRecord | null {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) return null;
    const data = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, "utf-8"));
    return data[email.toLowerCase()] || null;
  } catch (e) {
    console.error("Error reading local user db:", e);
    return null;
  }
}

function saveLocalUser(email: string, record: Partial<LocalUserRecord>) {
  try {
    const data = fs.existsSync(LOCAL_DB_PATH) 
      ? JSON.parse(fs.readFileSync(LOCAL_DB_PATH, "utf-8"))
      : {};
    const emailLower = email.toLowerCase();
    const existing = data[emailLower] || { email: emailLower, previousPasswords: [] };
    
    const existingPasswordHashed = existing.password
      ? (existing.password.length === 64 && /^[0-9a-f]+$/.test(existing.password) ? existing.password : hashPassword(existing.password))
      : undefined;

    let updatedPrevious = (existing.previousPasswords || []).map((p: string) => 
      (p.length === 64 && /^[0-9a-f]+$/.test(p)) ? p : hashPassword(p)
    );

    if (record.password) {
      const newPasswordHashed = hashPassword(record.password);
      if (existingPasswordHashed && existingPasswordHashed !== newPasswordHashed) {
        if (!updatedPrevious.includes(existingPasswordHashed)) {
          updatedPrevious.push(existingPasswordHashed);
        }
      }
    }

    if (record.previousPasswords) {
      const hashedPrev = record.previousPasswords.map((p: string) => 
        (p.length === 64 && /^[0-9a-f]+$/.test(p)) ? p : hashPassword(p)
      );
      updatedPrevious = Array.from(new Set([...updatedPrevious, ...hashedPrev]));
    }

    const activePasswordHashed = record.password 
      ? hashPassword(record.password) 
      : existingPasswordHashed;
      
    if (activePasswordHashed) {
      updatedPrevious = updatedPrevious.filter(p => p !== activePasswordHashed);
    }

    data[emailLower] = {
      ...existing,
      ...record,
      password: record.password ? hashPassword(record.password) : existing.password,
      previousPasswords: updatedPrevious
    };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error writing local user db:", e);
  }
}

// In-memory rate limiting map to prevent brute-force/spam attacks
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimits = new Map<string, RateLimitRecord>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimits.get(key);

  if (!record) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > record.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

// Input validation helper functions
function isValidEmail(email: string): boolean {
  if (typeof email !== "string" || email.length < 3 || email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function sanitizeUsername(username: string): string {
  if (typeof username !== "string") return "";
  // Strip HTML-like characters to prevent HTML Injection
  return username.replace(/[<>]/g, "").slice(0, 50).trim();
}

function isValidVerificationCode(code: string): boolean {
  if (typeof code !== "string") return false;
  const codeRegex = /^\d{6}$/;
  return codeRegex.test(code);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. General Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  // 2. Sensitive File Access Blocker Middleware
  app.use((req, res, next) => {
    const url = req.url.toLowerCase();
    if (
      url.includes(".env") || 
      url.includes("local_users_db") || 
      url.includes(".git") || 
      url.includes("firebase-applet-config") || 
      url.includes("package.json") ||
      url.includes("firestore.rules")
    ) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  });

  // Lazy initialize Gemini client to prevent startup crashes if key is missing
  let aiClient: GoogleGenAI | null = null;
  function getAiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // API endpoint to send real verification codes using Nodemailer
  app.post("/api/send-code", async (req, res) => {
    const { email, code, username, type } = req.body;

    // 1. Structural Validation
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const emailLower = String(email).trim().toLowerCase();
    const codeStr = String(code).trim();
    const sanitizedUser = sanitizeUsername(username);
    const isReset = type === "reset";

    if (!isValidEmail(emailLower)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!isValidVerificationCode(codeStr)) {
      return res.status(400).json({ error: "Invalid verification code. Code must be 6 numeric digits." });
    }

    // 2. Rate Limiting to prevent spam relay attacks (Max 5 requests per hour)
    const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown-ip";
    const ipKey = `rate_limit_ip:${clientIp}`;
    const emailKey = `rate_limit_email:${emailLower}`;

    const ONE_HOUR = 60 * 60 * 1000;
    if (!checkRateLimit(String(ipKey), 5, ONE_HOUR)) {
      return res.status(429).json({ error: "Too many requests from this IP. Please try again after an hour." });
    }
    if (!checkRateLimit(String(emailKey), 5, ONE_HOUR)) {
      return res.status(429).json({ error: "Too many code requests for this email address. Please try again after an hour." });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465");

    if (!smtpUser || !smtpPass) {
      console.warn("SMTP credentials (SMTP_USER/SMTP_PASS) are not set in environment variables! Cannot send real email.");
      return res.status(400).json({
        error: "SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in your Secrets panel."
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"Shop2Power" <${smtpUser}>`,
        to: emailLower,
        subject: isReset 
          ? "رمز استعادة كلمة المرور لحسابك في شوب تو باور - Shop2Power Password Reset Code"
          : "رمز التحقق لحسابك في شوب تو باور - Shop2Power Verification Code",
        html: `
          <div style="direction: rtl; text-align: right; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 500px; margin: 20px auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="color: #4f46e5; margin: 0; font-size: 26px; font-weight: 800;">شوب تو باور | Shop2Power</h2>
              <p style="font-size: 13px; color: #64748b; margin-top: 5px;">أسرع وأسهل شحن ألعاب في الوطن العربي</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 25px;" />
            
            <p style="font-size: 16px; color: #1e293b; font-weight: bold; margin-bottom: 10px;">أهلاً بك يا ${sanitizedUser || "لاعبنا العزيز"} 🎮،</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 25px;">
              ${isReset 
                ? "لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في متجر شوب تو باور. يرجى استخدام رمز التحقق الآمن التالي لإتمام عملية التغيير:"
                : "لقد تلقينا طلباً لإنشاء حساب جديد في متجر شوب تو باور. يرجى استخدام رمز التحقق الآمن التالي لإتمام التحقق من بريدك الإلكتروني:"}
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; background-color: #f5f3ff; border: 2px dashed #818cf8; padding: 16px 36px; border-radius: 12px; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #4f46e5; font-family: monospace;">
                ${codeStr}
              </span>
            </div>
            
            <div style="background-color: #fffbeb; border-right: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin-bottom: 25px;">
              <p style="font-size: 12px; color: #b45309; margin: 0; line-height: 1.5; font-weight: 600;">
                ⚠️ تنبيه هام: هذا الرمز صالح للاستخدام لمرة واحدة فقط. يرجى عدم مشاركة هذا الرمز مع أي شخص آخر لحماية أمان حسابك.
              </p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-top: 30px; margin-bottom: 15px;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0; line-height: 1.4;">
              هذا البريد تم إرساله تلقائياً بناءً على طلبك، يرجى عدم الرد على هذه الرسالة.<br/>
              © 2026 Shop2Power. جميع الحقوق محفوظة.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Nodemailer SMTP Error:", error);
      res.status(500).json({ error: error.message || "Failed to send email via SMTP" });
    }
  });

  // API endpoint to update user password in Firebase Auth + Firestore, with local JSON fallback
  app.post("/api/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword || typeof email !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({ error: "Email and new password are required and must be strings" });
    }

    const emailLower = String(email).trim().toLowerCase();

    if (!isValidEmail(emailLower)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (newPassword.length < 6 || newPassword.length > 100) {
      return res.status(400).json({ error: "Password must be between 6 and 100 characters" });
    }

    // Rate limiting (Max 5 attempts per hour)
    const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown-ip";
    const ipKey = `rate_limit_reset_ip:${clientIp}`;
    const emailKey = `rate_limit_reset_email:${emailLower}`;
    const ONE_HOUR = 60 * 60 * 1000;

    if (!checkRateLimit(String(ipKey), 5, ONE_HOUR)) {
      return res.status(429).json({ error: "Too many password resets requested from this IP. Please try again after an hour." });
    }
    if (!checkRateLimit(String(emailKey), 5, ONE_HOUR)) {
      return res.status(429).json({ error: "Too many password resets requested for this email address. Please try again after an hour." });
    }

    // 1. Update in the local persistent fallback DB
    saveLocalUser(emailLower, { password: newPassword });

    // 2. Attempt to update in real Firebase Auth & Firestore using Admin SDK if initialized
    let firebaseUpdated = false;
    try {
      if (isFirebaseAdminActive && getApps().length > 0) {
        const userRecord = await getAuth().getUserByEmail(emailLower);
        const uid = userRecord.uid;

        // Update password in Firebase Auth
        await getAuth().updateUser(uid, { password: newPassword });

        // Update password & history in Firestore
        const dbAdmin = getFirestore();
        const userDocRef = dbAdmin.collection("users").doc(uid);
        const userDoc = await userDocRef.get();

        let previousPasswords: string[] = [];
        let oldPassword = "";

        if (userDoc.exists) {
          const userData = userDoc.data();
          oldPassword = userData?.password || "";
          previousPasswords = userData?.previousPasswords || [];
          
          const oldPasswordHashed = oldPassword && !(oldPassword.length === 64 && /^[0-9a-f]+$/.test(oldPassword))
            ? hashPassword(oldPassword)
            : oldPassword;
          
          const newPasswordHashed = hashPassword(newPassword);

          if (oldPasswordHashed && oldPasswordHashed !== newPasswordHashed && !previousPasswords.includes(oldPasswordHashed)) {
            previousPasswords.push(oldPasswordHashed);
          }
        }

        const hashedPrev = previousPasswords.map((p: string) => 
          (p.length === 64 && /^[0-9a-f]+$/.test(p)) ? p : hashPassword(p)
        );

        await userDocRef.set({
          password: hashPassword(newPassword),
          previousPasswords: hashedPrev,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Sync back previous passwords into our local db
        saveLocalUser(emailLower, { previousPasswords: hashedPrev });
        firebaseUpdated = true;
      }
    } catch (fbError) {
      isFirebaseAdminActive = false;
    }

    res.json({ success: true, firebaseUpdated });
  });

  // API endpoint to verify if an entered password belongs to the user's password history (to trigger custom error message)
  app.post("/api/check-password-history", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const emailLower = String(email).trim().toLowerCase();

    // 1. Check local DB history first
    const localUser = getLocalUser(emailLower);
    if (localUser) {
      if (localUser.password && verifyPassword(password, localUser.password)) {
        return res.json({ isOld: false });
      }
      if (localUser.previousPasswords) {
        const isOldInHistory = localUser.previousPasswords.some(oldPassHash => 
          verifyPassword(password, oldPassHash)
        );
        if (isOldInHistory) {
          return res.json({ isOld: true });
        }
      }
    }

    // 2. Check Firestore history if Admin SDK is active
    try {
      if (isFirebaseAdminActive && getApps().length > 0) {
        const userRecord = await getAuth().getUserByEmail(emailLower);
        const uid = userRecord.uid;

        const dbAdmin = getFirestore();
        const userDoc = await dbAdmin.collection("users").doc(uid).get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          const currentPassword = userData?.password || "";
          if (currentPassword && verifyPassword(password, currentPassword)) {
            return res.json({ isOld: false });
          }
          const previousPasswords = userData?.previousPasswords || [];
          const isOldInFbHistory = previousPasswords.some((oldPass: string) => 
            verifyPassword(password, oldPass)
          );
          if (isOldInFbHistory) {
            return res.json({ isOld: true });
          }
        }
      }
    } catch (fbError) {
      isFirebaseAdminActive = false;
    }

    res.json({ isOld: false });
  });

  // API endpoint to save the current password on successful login or registration so that we can maintain a robust previousPasswords list
  app.post("/api/save-current-password", async (req, res) => {
    const { email, password, displayName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const emailLower = String(email).trim().toLowerCase();

    // Save locally
    const localUpdate: Partial<LocalUserRecord> = { password };
    if (displayName) {
      localUpdate.displayName = displayName;
    }
    saveLocalUser(emailLower, localUpdate);

    // Save in Firestore if Admin SDK is active
    try {
      if (isFirebaseAdminActive && getApps().length > 0) {
        const userRecord = await getAuth().getUserByEmail(emailLower);
        const uid = userRecord.uid;

        const dbAdmin = getFirestore();
        const userDocRef = dbAdmin.collection("users").doc(uid);
        const fbUpdate: any = { password: hashPassword(password) };
        if (displayName) {
          fbUpdate.displayName = displayName;
        }
        await userDocRef.set(fbUpdate, { merge: true });
      }
    } catch (fbError) {
      isFirebaseAdminActive = false;
    }

    res.json({ success: true });
  });

  // API endpoint to verify user credentials using local DB fallback
  app.post("/api/login-fallback", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required and must be strings" });
    }

    const emailLower = String(email).trim().toLowerCase();

    if (!isValidEmail(emailLower)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Rate limiting to prevent brute force (Max 10 attempts per minute)
    const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown-ip";
    const ipKey = `rate_limit_login_ip:${clientIp}`;
    const emailKey = `rate_limit_login_email:${emailLower}`;
    const ONE_MINUTE = 60 * 1000;

    if (!checkRateLimit(String(ipKey), 10, ONE_MINUTE)) {
      return res.status(429).json({ error: "Too many login attempts. Please wait a minute and try again." });
    }
    if (!checkRateLimit(String(emailKey), 10, ONE_MINUTE)) {
      return res.status(429).json({ error: "Too many login attempts. Please wait a minute and try again." });
    }

    const localUser = getLocalUser(emailLower);

    if (localUser && localUser.password && verifyPassword(password, localUser.password)) {
      return res.json({
        success: true,
        user: {
          uid: `local_${Buffer.from(emailLower).toString('hex')}`,
          email: emailLower,
          displayName: localUser.displayName || emailLower.split("@")[0]
        }
      });
    }

    return res.status(401).json({ error: "Invalid credentials" });
  });

  // API endpoint for secure chat assistant
  app.post("/api/chat", async (req, res) => {
    // Rate limiting (Max 15 messages per 5 minutes per IP)
    const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown-ip";
    const ipKey = `rate_limit_chat_ip:${clientIp}`;
    const FIVE_MINUTES = 5 * 60 * 1000;
    if (!checkRateLimit(String(ipKey), 15, FIVE_MINUTES)) {
      return res.status(429).json({ error: "Too many chat messages. Please wait a few minutes and try again." });
    }

    try {
      const { message, history } = req.body;

      // 1. Validate 'message'
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required and must be a string." });
      }

      if (message.length > 2000) {
        return res.status(400).json({ error: "Message exceeds the maximum allowed length of 2000 characters." });
      }

      // 2. Validate 'history'
      if (history && !Array.isArray(history)) {
        return res.status(400).json({ error: "History must be an array." });
      }

      if (history && history.length > 20) {
        return res.status(400).json({ error: "History size cannot exceed 20 messages." });
      }

      const ai = getAiClient();

      // Format previous history for Gemini
      const contents = [
        {
          role: "user",
          parts: [{ text: "You are the official Shop2Power Support & Recommendation Assistant (مساعد الدعم الفني لمتجر شحن الألعاب شوب تو باور). You speak in a helpful, gaming-focused tone. Answer in the language the user addresses you in (Arabic or English, but prefer Arabic since Shop2Power is highly popular in MENA). You can suggest diamond packs, explain how to find Player ID, tell them about current offers, and provide the promo code: 'SHOP2POWER2026' which gives users a simulated 100 bonus diamonds on their next purchase in the Redeem tab! Keep responses friendly, engaging, and relatively concise (under 150 words)." }]
        }
      ];

      if (history && Array.isArray(history)) {
        for (const h of history) {
          if (h && typeof h === "object" && typeof h.text === "string" && (h.sender === "user" || h.sender === "bot")) {
            // Trim and enforce length limit on history items
            const secureText = h.text.slice(0, 2000);
            contents.push({
              role: h.sender === "user" ? "user" : "model",
              parts: [{ text: secureText }]
            });
          }
        }
      }

      // Add current message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Something went wrong" });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
