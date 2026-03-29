import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Using gemini-2.5-flash - the primary stable workhorse for March 2026
export const chatModel = genAI.getGenerativeModel({ 
  model: "gemini-3.1-flash-lite-preview", 
  generationConfig: {
    maxOutputTokens: 2000,
    temperature: 0.7,
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
    ? `คุณคือผู้ช่วย AI ของ Sapientia ร้านกล้องระดับพรีเมียม
       
       รายการสินค้าในคลัง (STORE INVENTORY):
       ${inventoryContext}
       
       ข้อมูลทางเทคนิคอ้างอิง (TECHNICAL SPECS):
       ${specsContext}
       
       คำแนะนำตามนโยบายร้าน:
       1. แนะนำเฉพาะรุ่นที่มีใน "STORE INVENTORY" เท่านั้น
       2. ใช้ "TECHNICAL SPECS" เพื่อตอบคำถามเกี่ยวกับสเปกหรือเปรียบเทียบฟีเจอร์
       3. หากผู้ใช้ถามถึงกล้องที่ไม่มีใน "STORE INVENTORY" ให้บอกสเปกได้แต่ต้องแจ้งว่า "ขณะนี้ร้านเรายังไม่มีสินค้านี้ในคลัง"
       4. การแนะนำราคา: ต้องใช้ราคาจาก STORE INVENTORY เสมอ
       5. ห้ามระบุจำนวนตัวเลขสต็อก (เช่น มี 5 ตัว) ให้ระบุเป็นสถานะ "มีสินค้า", "สินค้าใกล้หมด" หรือ "สินค้าหมด" เท่านั้น`
    : `You are the specialized AI Camera Advisor for Sapientia.

       --- STORE INVENTORY (Items we currently sell) ---
       ${inventoryContext}

       --- TECHNICAL SPECIFICATIONS (Reference Data) ---
       ${specsContext}

       CRITICAL GUIDELINES:
       1. RECOMMENDATIONS: Only suggest cameras that appear in the "STORE INVENTORY". 
       2. SPECIFICATIONS: Use the "TECHNICAL SPECIFICATIONS" block to answer technical questions about sensors, video, etc.
       3. AVAILABILITY: If a user asks for a model not in our inventory, you may provide its specs but MUST state that it is "Not currently available in our local shop."
       4. PRICING: Always quote prices from the "STORE INVENTORY" list in THB.
       5. STOCK VERBIAGE: Never use exact numbers. Use "In Stock", "Limited Availability" (for Low Stock), or "Sold Out".`;

  return systemInstructions;
}
