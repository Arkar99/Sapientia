import { getAnalyticsData } from "@/lib/admin/ai-analytics";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { ResetDataButton } from "@/components/admin/ResetDataButton";

export const dynamic = 'force-dynamic';

export default async function AIAnalyticsPage() {
  const rawData = await getAnalyticsData();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Analytics Dashboard</h2>
          <p className="text-muted-foreground mt-1">Monitor chatbot performance, user sentiment, and product mentions based on customer interactions.</p>
        </div>
        <ResetDataButton type="analytics" />
      </div>
      <AnalyticsCharts initialData={rawData} />
    </div>
  );
}
