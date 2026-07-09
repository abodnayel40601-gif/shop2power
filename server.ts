import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // API endpoint for secure chat assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const ai = getAiClient();

      // Format previous history for Gemini
      const contents = [
        {
          role: "user",
          parts: [{ text: "You are the official Shop2Power Support & Recommendation Assistant (مساعد الدعم الفني لمتجر شحن الألعاب شوب تو باور). You speak in a helpful, gaming-focused tone. Answer in the language the user addresses you in (Arabic or English, but prefer Arabic since Shop2Power is highly popular in MENA). You can suggest diamond packs, explain how to find Player ID, tell them about current offers, and provide the promo code: 'SHOP2POWER2026' which gives users a simulated 100 bonus diamonds on their next purchase in the Redeem tab! Keep responses friendly, engaging, and relatively concise (under 150 words)." }]
        }
      ];

      if (history && Array.isArray(history)) {
        history.forEach((h: { sender: string; text: string }) => {
          contents.push({
            role: h.sender === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          });
        });
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
