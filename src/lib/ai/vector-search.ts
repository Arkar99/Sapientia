import fs from 'fs';
import path from 'path';

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
}

export async function findRelevantCameras(queryEmbedding: number[], limit = 3) {
  try {
    const camerasPath = path.join(process.cwd(), "src/data/cameras.json");
    const embeddingsPath = path.join(process.cwd(), "src/data/embeddings.json");

    if (!fs.existsSync(camerasPath) || !fs.existsSync(embeddingsPath)) {
      console.warn("⚠️ Data paths missing in vector-search.ts");
      return [];
    }

    const cameras = JSON.parse(fs.readFileSync(camerasPath, 'utf-8'));
    const embeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf-8'));
    
    const scores = embeddings.map((item: any) => ({
      id: item.id,
      score: cosineSimilarity(queryEmbedding, item.embedding)
    }));

    scores.sort((a: any, b: any) => b.score - a.score);

    const results = scores.slice(0, limit).map((scoreItem: any) => {
      const camera = (cameras as any[]).find((c) => c.id === scoreItem.id);
      return camera || null;
    });

    return results.filter(Boolean);
  } catch (error) {
    console.error("❌ Vector Search Error:", error);
    return [];
  }
}
