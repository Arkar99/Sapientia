import { getAnalyticsData } from "@/lib/admin/ai-analytics";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";

export const dynamic = 'force-dynamic';

export default async function AIAnalyticsPage() {
  const rawData = getAnalyticsData();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Analytics Dashboard</h2>
        <p className="text-muted-foreground mt-1">Monitor chatbot performance, user sentiment, and product mentions based on customer interactions.</p>
      </div>
      <AnalyticsCharts initialData={rawData} />
    </div>
  );
}
