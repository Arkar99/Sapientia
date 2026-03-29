import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "-flash-lite-preview" });

  console.log("🌊 Testing Gemini connectivity (3.1 Lite)...");
  try {
    const result = await model.generateContent("Hello, are you working?");
    console.log("✨ Response:", result.response.text());
    console.log("✅ Gemini API is functional.");
  } catch (error: any) {
    console.error("❌ Gemini API Error:", error.message);
  }
}

testGemini();
