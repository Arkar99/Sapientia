import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const DATA_PATH = path.join(process.cwd(), 'src/data/cameras.json');

async function syncCameras() {
  if (!RAPIDAPI_KEY) {
    console.error('❌ RAPIDAPI_KEY not found in .env.local. Skipping sync.');
    console.log('💡 Tip: Get your API key from https://rapidapi.com/KarlChow92/api/camera-database');
    return;
  }

  console.log('🔄 Syncing camera database from RapidAPI...');

  try {
    const options = {
      method: 'GET',
      url: 'https://camera-database.p.rapidapi.com/cameras',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'camera-database.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    const cameras = response.data;

    // Transform data if needed (depending on actual API schema)
    // We'll save it directly for now, or you can map it to our preferred schema.
    
    fs.writeFileSync(DATA_PATH, JSON.stringify(cameras, null, 2));
    console.log(`✅ Successfully synced ${cameras.length} cameras to ${DATA_PATH}`);
  } catch (error) {
    console.error('❌ Error syncing cameras:', error);
  }
}

syncCameras();
