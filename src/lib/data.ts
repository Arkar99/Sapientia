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
