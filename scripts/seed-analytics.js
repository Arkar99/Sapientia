const fs = require('fs');
const path = require('path');

const BRANDS = ["Canon", "Sony", "Nikon", "Fujifilm", "Panasonic", "Leica"];
const MODELS = [
  { brand: "Canon", model: "EOS R5 Mark II" },
  { brand: "Canon", model: "EOS R6 II" },
  { brand: "Sony", model: "A7 IV" },
  { brand: "Sony", model: "A7R V" },
  { brand: "Sony", model: "ZV-E10" },
  { brand: "Nikon", model: "Z8" },
  { brand: "Nikon", model: "Z6 III" },
  { brand: "Fujifilm", model: "X-T5" },
  { brand: "Fujifilm", model: "X100VI" },
  { brand: "Panasonic", model: "Lumix S5 II" },
  { brand: "Leica", model: "Q3" }
];

const SENTIMENTS = ['happy', 'neutral', 'frustrated'];

function generateDummyData() {
  const events = [];
  const now = new Date();

  // 30 days of data
  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dailyVolume = Math.floor(Math.random() * 15) + 5; // 5-20 chats per day

    for (let j = 0; j < dailyVolume; j++) {
      const eventDate = new Date(date);
      eventDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      const mentionCount = Math.floor(Math.random() * 2) + 1;
      const userModels = [];
      const userBrands = new Set();
      
      for(let k=0; k<mentionCount; k++) {
        const m = MODELS[Math.floor(Math.random() * MODELS.length)];
        userModels.push(m.model);
        userBrands.add(m.brand);
      }

      const aiRecCount = Math.floor(Math.random() * 3) + 1;
      const aiModels = [];
      const aiBrands = new Set();
      
      for(let k=0; k<aiRecCount; k++) {
        const m = MODELS[Math.floor(Math.random() * MODELS.length)];
        aiModels.push(m.model);
        aiBrands.add(m.brand);
      }

      events.push({
        id: Math.random().toString(36).substring(2, 15),
        timestamp: eventDate.toISOString(),
        userId: `user-${Math.floor(Math.random() * 100)}`,
        sessionId: `session-${Math.floor(Math.random() * 1000)}`,
        entities: {
          user: { brands: Array.from(userBrands), models: userModels },
          ai: { brands: Array.from(aiBrands), models: aiModels }
        },
        sentiment: SENTIMENTS[Math.floor(Math.random() * 3)],
        isCorrection: Math.random() < 0.1
      });
    }
  }

  const outPath = path.join(process.cwd(), 'src', 'data', 'ai_analytics.json');
  fs.writeFileSync(outPath, JSON.stringify(events, null, 2));
  console.log(`Generated ${events.length} events over 30 days.`);
}

generateDummyData();
