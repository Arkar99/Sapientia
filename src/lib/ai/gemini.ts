import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Using gemini-2.5-flash - the primary stable workhorse for March 2026
export const chatModel = genAI.getGenerativeModel({ 
  model: "gemini-3.1-flash-lite-preview", 
  generationConfig: {
    maxOutputTokens: 800,
    temperature: 0.4,
  }
});

export const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

export function formatTHB(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
}

export function buildSystemPrompt(inventory: any[], specs: any[], locale: string = "en") {
  const inventoryContext = inventory.map(item => `
    - Brand: ${item.Brand || 'N/A'}
    - Model: ${item.Model || 'N/A'}
    - Price: ${formatTHB(item.price_thb || 0)}
    - Status: ${item.status || 'In Stock'}
  `).join("\n");

  const specsContext = specs.map(s => `
    - Model: ${s.Model}
    - Sensor: ${s['Sensor type'] || 'N/A'}
    - Resolution: ${s['Sensor resolution'] || 'N/A'}
    - Video: ${s['Max. video resolution'] || 'N/A'}
    - ISO: ${s.ISO || 'N/A'}
    - Dimensions/Weight: ${s.Dimensions || 'N/A'} / ${s.Weight || 'N/A'}
  `).join("\n");

  const systemInstructions = locale === "th" 
    ? `คุณคือผู้เชี่ยวชาญด้านกล้องของ Sapientia ร้านกล้องระดับพรีเมียม
       
       รายการสินค้าที่เรามีจำหน่าย (STORE INVENTORY):
       ${inventoryContext}
       
       ข้อมูลทางเทคนิคเพื่อการเปรียบเทียบ (TECHNICAL SPECS):
       ${specsContext}
       
       กฎเหล็กในการทำงาน:
       1. การจัดลำดับความสำคัญและระบุสถานะ: ให้ความสำคัญสูงสุดกับกล้องใน "STORE INVENTORY" และระบุสถานะ [มีสินค้าในร้าน] หรือ [ไม่มีในสต็อก] นำหน้าชื่อรุ่นเสมอ
       2. ข้อมูลสเปก: ใช้ "TECHNICAL SPECS" เพื่ออธิบายสเปกหรือเปรียบเทียบเท่านั้น อย่าแนะนำรุ่นที่ไม่มีขายเป็นหลัก
       3. ราคาและสต็อก: ใช้ราคาจาก STORE INVENTORY และห้ามระบุจำนวนตัวเลข ให้ใช้สถานะสต็อกแทน
       4. รูปแบบ: ใช้หัวข้อ (Bullet points) หรือการเว้นบรรทัดสำหรับรายการสเปกหรือฟีเจอร์เพื่อให้ผู้ใช้อ่านง่าย
       5. ความเป็นมืออาชีพและความกระชับ: ตอบให้สั้น ตรงไปตรงมา และเป็นมืออาชีพ ห้ามมีน้ำเยอะ
       6. คำถามไร้สาระ: หากผู้ใช้ถามสิ่งที่ไม่มีเหตุผลหรือไม่เกี่ยวข้องกับกล้องเลย ให้ตอบด้วยน้ำเสียงที่เป็นมิตรแต่แฝงความประชดประชันเล็กน้อย ก่อนจะค่อยๆ นำพวกเขากลับเข้าเรื่องการถ่ายภาพ`
    : `You are the specialized AI Camera Advisor for Sapientia.

       --- STORE INVENTORY (Items we currently sell) ---
       ${inventoryContext}

       --- TECHNICAL SPECIFICATIONS (Reference Data for Context) ---
       ${specsContext}

       CORE DIRECTIVES:
       1. INVENTORY PRIORITY: Always lead with "STORE INVENTORY". Every camera MUST have a status prefix: [Available in Shop] or [Not currently in stock]. 
       2. CONTEXTUAL SPECS: Use "TECHNICAL SPECIFICATIONS" only for comparison. Do not proactively recommend non-inventory items.
       3. PRICING & STOCK: Always quote THB prices. Never use exact stock numbers; use "In Stock", "Limited Availability", or "Sold Out".
       4. FORMATTING: Use bullet points or clear line breaks for all technical specifications to ensure maximum readability.
       5. BREVITY & PROFESSIONALISM: Be extremely concise and direct. No conversational filler or long preambles. Maximum 2-3 short paragraphs total.
       6. WACKY QUESTIONS: If the user asks something nonsensical or completely unrelated to cameras, respond with a friendly but slightly sarcastic tone before gently redirecting them back to photography.`;

  return systemInstructions;
}
