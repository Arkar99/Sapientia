import fs from "fs";
import path from "path";
import { getAnalyticsData } from "@/lib/admin/ai-analytics";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { ResetDataButton } from "@/components/admin/ResetDataButton";

export const dynamic = 'force-dynamic';

export default async function AIAnalyticsPage() {
  const rawData = await getAnalyticsData();
  
  // Load camera data for enrichment — pre-validate image files on the server
  // so the client never receives a path that will 404 (avoids hydration race).
  const camPath = path.join(process.cwd(), "src", "data", "cameras.json");
  const camerasRaw = JSON.parse(fs.readFileSync(camPath, "utf-8"));
  const allCameras = camerasRaw.map((cam: any) => {
    if (cam.image_file) {
      const absPath = path.join(process.cwd(), "public", cam.image_file);
      if (!fs.existsSync(absPath)) {
        return { ...cam, image_file: null };
      }
    }
    return cam;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Analytics Dashboard</h2>
          <p className="text-muted-foreground mt-1">Monitor chatbot performance, user sentiment, and product mentions based on customer interactions.</p>
        </div>
        <ResetDataButton type="analytics" />
      </div>
      <AnalyticsCharts initialData={rawData} allCameras={allCameras} />
    </div>
  );
}
