import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { generateEmbedding, chatModel, buildSystemPrompt } from "@/lib/ai/gemini";
import { findRelevantCameras } from "@/lib/ai/vector-search";
import { trackChatAnalytics } from "@/lib/admin/ai-analytics";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { messages, locale = "en" } = await req.json();
    const lastMessage = messages[messages.length - 1].content;
    const { userId } = await auth();

    console.log("📝 Chat Query:", lastMessage);

    // 1. Generate embedding for the user's query
    console.log("🌊 Generating embedding...");
    const queryEmbedding = await generateEmbedding(lastMessage);

    // 2. Perform RAG (retrieve relevant technical specs from cameras.json)
    console.log("🔍 Finding relevant camera specs...");
    const relevantSpecs = await findRelevantCameras(queryEmbedding, 3);
    console.log(`✅ Found ${relevantSpecs.length} technical records.`);

    // 3. Load all inventory for store context
    const invPath = path.join(process.cwd(), "src", "data", "inventory.json");
    const camPath = path.join(process.cwd(), "src", "data", "cameras.json");
    const inventoryRaw = JSON.parse(fs.readFileSync(invPath, "utf-8"));
    const camerasRaw = JSON.parse(fs.readFileSync(camPath, "utf-8"));

    // Enrich inventory with Brand/Model for the AI
    const fullInventory = inventoryRaw.map((item: any) => {
      const cam = camerasRaw.find((c: any) => {
        const id = `${c.Brand}-${c.Model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return id === item.id;
      });
      return {
        ...item,
        Brand: cam?.Brand || "Unknown",
        Model: cam?.Model || "Unknown"
      };
    });

    // 4. Build the system prompt with dual context
    const systemPrompt = buildSystemPrompt(fullInventory, relevantSpecs, locale);

    // 5. Call Gemini
    console.log("🤖 Calling Gemini Model...");
    const chat = chatModel.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I will strictly differentiate between your store inventory and general technical data." }] },
        ...messages.slice(0, -1).map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }))
      ]
    });

    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();
    console.log("✨ Response generated.");

    // Asynchronously log analytics (fire and forget)
    trackChatAnalytics(userId || "anonymous", lastMessage, responseText)
      .catch(e => console.error("Analytics failure", e));

    return NextResponse.json({ role: "assistant", content: responseText });
  } catch (error: any) {
    console.error("❌ Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request", details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
