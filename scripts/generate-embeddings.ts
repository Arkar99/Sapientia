import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const DATA_PATH = path.join(process.cwd(), "src/data/cameras.json");
const EMBEDDINGS_PATH = path.join(process.cwd(), "src/data/embeddings.json");

async function generateEmbeddings() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not found in .env.local.");
    return;
  }

  if (!fs.existsSync(DATA_PATH)) {
    console.error("❌ src/data/cameras.json not found.");
    return;
  }

  console.log("🧊 Generating embeddings for modern cameras (2016 onwards)...");

  const rawData = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  
  // Filter for cameras from 2016 onwards to ensure relevance and improve performance
  const filteredData = rawData.filter((c: any) => {
    const year = parseInt(c.Year);
    return !isNaN(year) && year >= 2016;
  });

  console.log(`📡 Selected ${filteredData.length} relevant modern cameras.`);

  // Transform data to ensure IDs exist
  const cameras = filteredData.map((c: any) => ({
    ...c,
    id: `${c.Brand}-${c.Model}`.replace(/\s+/g, '-').toLowerCase()
  }));

  // Save the updated/filtered cameras with IDs
  fs.writeFileSync(DATA_PATH, JSON.stringify(cameras, null, 2));

  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const embeddingsData = [];
  const batchSize = 25;

  for (let i = 0; i < cameras.length; i += batchSize) {
    const batch = cameras.slice(i, i + batchSize);
    console.log(`📡 Processing batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(cameras.length / batchSize)}...`);

    const batchPromises = batch.map(async (camera: any) => {
      const content = `
        Brand: ${camera.Brand}
        Model: ${camera.Model}
        Release Year: ${camera.Year}
        Megapixels: ${camera.Megapixels}
        Sensor: ${camera['Sensor type']} (${camera['Sensor size']})
        Video: ${camera['Max. video resolution']}
        ISO: ${camera.ISO}
        Dimensions: ${camera.Dimensions}
        Weight: ${camera.Weight}
      `.trim();

      try {
        const result = await model.embedContent(content);
        return {
          id: camera.id,
          embedding: result.embedding.values
        };
      } catch (error: any) {
        console.error(`❌ Error embedding ${camera.Model}:`, error.message);
        return null;
      }
    });

    const results = await Promise.all(batchPromises);
    embeddingsData.push(...results.filter((r): r is {id: string, embedding: number[]} => r !== null));

    // Respect rate limits (Wait 4 seconds between batches of 25)
    await new Promise(resolve => setTimeout(resolve, 4000));
  }

  fs.writeFileSync(EMBEDDINGS_PATH, JSON.stringify(embeddingsData, null, 2));
  console.log(`✅ Successfully generated ${embeddingsData.length} embeddings to ${EMBEDDINGS_PATH}`);
}

generateEmbeddings();
