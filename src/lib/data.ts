/**
 * Shared server-side data loaders.
 * Centralizes all fs/path boilerplate that was previously duplicated
 * across api/chat/route.ts, admin pages, and the reset API.
 *
 * NOTE: These functions use `fs` and must only be called from
 * Server Components or API Route handlers (never from client components).
 */

import fs from "fs";
import path from "path";
import type { AIAnalyticsEvent } from "@/lib/admin/ai-analytics";

function dataPath(...segments: string[]): string {
  return path.join(process.cwd(), "src", "data", ...segments);
}

/** Load all cameras from cameras.json */
export function loadCameras(): any[] { // eslint-disable-line @typescript-eslint/no-explicit-any
  return JSON.parse(fs.readFileSync(dataPath("cameras.json"), "utf-8"));
}

/** Load cameras, but null out image_file paths that don't exist on disk. */
export function loadCamerasWithValidatedImages(): any[] { // eslint-disable-line @typescript-eslint/no-explicit-any
  const cameras = loadCameras();
  return cameras.map((cam) => {
    if (cam.image_file) {
      const absPath = path.join(process.cwd(), "public", cam.image_file as string);
      if (!fs.existsSync(absPath)) {
        return { ...cam, image_file: null };
      }
    }
    return cam;
  });
}

/** Load inventory from inventory.json */
export function loadInventory(): any[] { // eslint-disable-line @typescript-eslint/no-explicit-any
  return JSON.parse(fs.readFileSync(dataPath("inventory.json"), "utf-8"));
}

/**
 * Load inventory enriched with Brand/Model from cameras.json.
 * Used by the chat API to build a complete store context for the AI.
 */
export function loadEnrichedInventory(): any[] { // eslint-disable-line @typescript-eslint/no-explicit-any
  const inventory = loadInventory();
  const cameras = loadCameras();

  return inventory.map((item) => {
    const cam = cameras.find((c) => {
      const id = `${c.Brand}-${c.Model}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return id === item.id;
    });
    return {
      ...item,
      Brand: cam?.Brand ?? "Unknown",
      Model: cam?.Model ?? "Unknown",
    };
  });
}

/** Load analytics seed data from ai_analytics.json */
export function loadAnalyticsSeed(): AIAnalyticsEvent[] {
  const seedPath = dataPath("ai_analytics.json");
  if (!fs.existsSync(seedPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(seedPath, "utf-8"));
  } catch {
    return [];
  }
}
/**
 * Get all inventory products mapped to the Product UI type.
 * Used by Home page and Search page.
 */
export function getMappedProducts(): any[] {
  try {
    const inventory = loadInventory();
    const cameras = loadCameras();

    const generateId = (brand: string, model: string) =>
      `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    return inventory.map((invItem: any) => {
      const cam = cameras.find((c: any) => generateId(c.Brand, c.Model) === invItem.id);
      return {
        id: invItem.id,
        name: cam ? `${cam.Brand} ${cam.Model}` : invItem.id,
        price: invItem.price_thb,
        image: cam && cam.image_file ? `/${cam.image_file}` : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop",
        rating: Number((Math.random() * (5 - 4.2) + 4.2).toFixed(1)),
        reviews: Math.floor(Math.random() * 300) + 10,
        isNew: Math.random() > 0.8
      };
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

/**
 * Get a single product by ID with full details.
 * Used for the Product Detail page.
 */
export function getProductById(id: string): any {
  try {
    const inventory = loadInventory();
    const cameras = loadCameras();
    const invItem = inventory.find((item: any) => item.id === id);
    if (!invItem) return null;

    const generateId = (brand: string, model: string) =>
      `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const cam = cameras.find((c: any) => generateId(c.Brand, c.Model) === id);

    return {
      ...invItem,
      ...cam,
      name: cam ? `${cam.Brand} ${cam.Model}` : invItem.id,
      price: invItem.price_thb,
      image: cam && cam.image_file ? `/${cam.image_file}` : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop",
    };
  } catch (error) {
    console.error(`Failed to fetch product with id ${id}:`, error);
    return null;
  }
}
