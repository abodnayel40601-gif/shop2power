import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const { email, code, username } = req.body;

    // 1. Structural Validation
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const emailLower = String(email).trim().toLowerCase();
    const codeStr = String(code).trim();
    const sanitizedUser = sanitizeUsername(username);

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
        subject: "رمز التحقق لحسابك في شوب تو باور - Shop2Power Verification Code",
        html: `
          <div style="direction: rtl; text-align: right; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 500px; margin: 20px auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="color: #4f46e5; margin: 0; font-size: 26px; font-weight: 800;">شوب تو باور | Shop2Power</h2>
              <p style="font-size: 13px; color: #64748b; margin-top: 5px;">أسرع وأسهل شحن ألعاب في الوطن العربي</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 25px;" />
            
            <p style="font-size: 16px; color: #1e293b; font-weight: bold; margin-bottom: 10px;">أهلاً بك يا ${sanitizedUser || "لاعبنا العزيز"} 🎮،</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 25px;">
              لقد تلقينا طلباً لإنشاء حساب جديد في متجر شوب تو باور. يرجى استخدام رمز التحقق الآمن التالي لإتمام التحقق من بريدك الإلكتروني:
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

  // API endpoint for secure chat assistant
  app.post("/api/chat", async (req, res) => {
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
