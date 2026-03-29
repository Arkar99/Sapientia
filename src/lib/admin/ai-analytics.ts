import { kv } from '@vercel/kv';
import { genAI } from '@/lib/ai/gemini';
import { KV_KEYS } from '@/lib/config';

export interface AIAnalyticsEvent {
  id: string;
  timestamp: string;
  userId: string;
  sessionId: string;
  entities: {
    user: { brands: string[], models: string[] };
    ai: { brands: string[], models: string[] };
  };
  sentiment: 'happy' | 'neutral' | 'frustrated';
  isCorrection: boolean;
}

/**
 * Dedicated lightweight model for structured JSON extraction.
 * Uses low temperature and token limit since we only need terse JSON output —
 * completely separate from the user-facing chatModel.
 */
const analyticsModel = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview",
  generationConfig: {
    maxOutputTokens: 300,
    temperature: 0.1,
  },
});

export async function getAnalyticsData(): Promise<AIAnalyticsEvent[]> {
  try {
    const data = await kv.get<AIAnalyticsEvent[]>(KV_KEYS.analytics);
    const events = data || [];
    return events.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Failed to read analytics from KV:", error);
    return [];
  }
}

export async function trackChatAnalytics(
  userId: string,
  sessionId: string,
  userMessage: string,
  aiResponse: string
) {
  try {
    const prompt = `
      Analyze the following chat conversation between a user and an AI Camera Store Assistant.
      User said: "${userMessage}"
      AI replied: "${aiResponse}"

      Focus precisely on REAL camera brands (e.g., Canon, Nikon, Sony) and REAL models that exist in the real world (e.g., EOS R5, A7 IV, Z8).
      
      CRITICAL RULE: Ignore non-existent or imaginary models. 
      - Example: "Sony A6000" is real and should be extracted.
      - Example: "Sony A1921" is a fake model and MUST be ignored entirely. Do not extract it.

      Extract the following information and output it EXACTLY as a JSON object, with NO markdown formatting, NO backticks, just the raw JSON:
      {
        "user": { "brands": ["string"], "models": ["string"] }, 
        "ai": { "brands": ["string"], "models": ["string"] }, 
        "sentiment": "happy" | "neutral" | "frustrated", 
        "isCorrection": true | false 
      }
      If no brands or models are mentioned by a party, use empty arrays for their respective fields.
      "isCorrection" is true ONLY if the user explicitly corrected the AI (e.g., "no", "that's wrong", "I actually meant").
      Ensure output is highly sanitized and correctly formatted JSON.
    `;

    const result = await analyticsModel.generateContent(prompt);
    let textResponse = result.response.text();
    textResponse = textResponse.replace(/^```json/g, '').replace(/```$/g, '').trim();

    let analysis: Record<string, unknown>;
    try {
      analysis = JSON.parse(textResponse);
    } catch {
      console.error("Failed to parse analytics JSON:", textResponse);
      return;
    }

    const newEvent: AIAnalyticsEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: userId || 'anonymous',
      sessionId: sessionId || 'unknown',
      entities: {
        user: (analysis.user as AIAnalyticsEvent['entities']['user']) || { brands: [], models: [] },
        ai: (analysis.ai as AIAnalyticsEvent['entities']['ai']) || { brands: [], models: [] },
      },
      sentiment: (analysis.sentiment as AIAnalyticsEvent['sentiment']) || 'neutral',
      isCorrection: (analysis.isCorrection as boolean) || false,
    };

    const data = await getAnalyticsData();
    data.push(newEvent);
    await kv.set(KV_KEYS.analytics, data);

  } catch (error) {
    console.error("Error tracking chat analytics to KV:", error);
  }
}
