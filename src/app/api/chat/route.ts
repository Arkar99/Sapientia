import { NextResponse } from "next/server";
import { generateEmbedding, chatModel, buildSystemPrompt } from "@/lib/ai/gemini";
import { findRelevantCameras } from "@/lib/ai/vector-search";
import { trackChatAnalytics } from "@/lib/admin/ai-analytics";
import { loadEnrichedInventory } from "@/lib/data";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { messages, locale = "en", sessionId = "unknown" } = await req.json();
    const lastMessage = messages[messages.length - 1].content;
    const { userId } = await auth();

    console.log("📝 Chat Query:", lastMessage, "Session:", sessionId);

    // 1. Generate embedding for the user's query
    console.log("🌊 Generating embedding...");
    const queryEmbedding = await generateEmbedding(lastMessage);

    // 2. Perform RAG (retrieve relevant technical specs from cameras.json)
    console.log("🔍 Finding relevant camera specs...");
    const relevantSpecs = await findRelevantCameras(queryEmbedding, 3);
    console.log(`✅ Found ${relevantSpecs.length} technical records.`);

    // 3. Load enriched inventory for store context
    const fullInventory = loadEnrichedInventory();

    // 4. Build the system prompt with dual context
    const systemPrompt = buildSystemPrompt(fullInventory, relevantSpecs, locale);

    // 5. Call Gemini
    console.log("🤖 Calling Gemini Model...");
    const chat = chatModel.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I will strictly differentiate between your store inventory and general technical data." }] },
        ...messages.slice(0, -1).map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();
    console.log("✨ Response generated.");

    // Asynchronously log analytics (fire and forget)
    trackChatAnalytics(userId || "anonymous", sessionId, lastMessage, responseText)
      .catch((e) => console.error("Analytics failure", e));

    return NextResponse.json({ role: "assistant", content: responseText });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request", details: message },
      { status: 500 }
    );
  }
}
