import { kv } from '@vercel/kv';
import { chatModel } from '@/lib/ai/gemini';

export interface AIAnalyticsEvent {
  id: string;
  timestamp: string;
  userId: string;
  entities: {
    user: { brands: string[], models: string[] };
    ai: { brands: string[], models: string[] };
  };
  sentiment: 'happy' | 'neutral' | 'frustrated';
  isCorrection: boolean;
}

const KV_KEY = 'ai_analytics';

export async function getAnalyticsData(): Promise<AIAnalyticsEvent[]> {
  try {
    const data = await kv.get<AIAnalyticsEvent[]>(KV_KEY);
    return data || [];
  } catch (error) {
    console.error("Failed to read analytics from KV:", error);
    return [];
  }
}

export async function trackChatAnalytics(
  userId: string, 
  userMessage: string, 
  aiResponse: string
) {
  try {
    const prompt = `
      Analyze the following chat conversation between a user and an AI Camera Store Assistant.
      User said: "${userMessage}"
      AI replied: "${aiResponse}"

      Focus precisely on camera brands (e.g., Canon, Nikon, Sony) and models (e.g., EOS R5, A7 IV, Z8).
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

    const result = await chatModel.generateContent(prompt);
    let textResponse = result.response.text();
    // Clean markdown if present
    textResponse = textResponse.replace(/^```json/g, '').replace(/```$/g, '').trim();
    
    let analysis;
    try {
      analysis = JSON.parse(textResponse);
    } catch (e) {
      console.error("Failed to parse Gemini analytics JSON", textResponse);
      return;
    }

    const newEvent: AIAnalyticsEvent = {
       id: crypto.randomUUID(),
       timestamp: new Date().toISOString(),
       userId: userId || 'anonymous',
       entities: {
         user: analysis.user || { brands: [], models: [] },
         ai: analysis.ai || { brands: [], models: [] }
       },
       sentiment: analysis.sentiment || 'neutral',
       isCorrection: analysis.isCorrection || false
    };

    const data = await getAnalyticsData();
    data.push(newEvent);
    await kv.set(KV_KEY, data);

  } catch (error) {
     console.error("Error tracking chat analytics to KV:", error);
  }
}
