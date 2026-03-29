"use client";

import { useState, useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AIAnalyticsEvent } from "@/lib/admin/ai-analytics";

export function AnalyticsCharts({ initialData }: { initialData: AIAnalyticsEvent[] }) {
  const [filter, setFilter] = useState<'weekly' | 'monthly'>('monthly');

  const {
    dailyVolume,
    userBrands,
    userModels,
    aiBrands,
    aiModels,
    moodData,
    totalCorrections,
    totalChats
  } = useMemo(() => {
    // 1. Filter by timeframe
    const now = new Date();
    const daysToSubtract = filter === 'weekly' ? 7 : 30;
    const cutoffDate = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);

    const filteredData = initialData.filter(d => new Date(d.timestamp) >= cutoffDate);

    // Trackers
    const volumeByDay: Record<string, number> = {};
    const moodByDay: Record<string, { happy: number; neutral: number; frustrated: number }> = {};
    
    // Deduplication sets
    const userMentionSet = new Set<string>(); // "YYYY-MM-DD-userId-brandName"-like
    const aiMentionSet = new Set<string>();

    const uBrandsCount: Record<string, number> = {};
    const uModelsCount: Record<string, number> = {};
    const aBrandsCount: Record<string, number> = {};
    const aModelsCount: Record<string, number> = {};

    let corrections = 0;

    filteredData.forEach(event => {
      const dateStr = new Date(event.timestamp).toISOString().split('T')[0];
      const userId = event.userId;

      // Volume tracking (Number of total chats per day)
      volumeByDay[dateStr] = (volumeByDay[dateStr] || 0) + 1;

      // Mood tracking
      if (!moodByDay[dateStr]) moodByDay[dateStr] = { happy: 0, neutral: 0, frustrated: 0 };
      moodByDay[dateStr][event.sentiment] += 1;

      // Correction tracking
      if (event.isCorrection) corrections++;

      // Process User Mentions with Deduplication (1 per day per user per entity)
      event.entities.user.brands.forEach(brand => {
        const dedupKey = `${dateStr}-${userId}-ubrand-${brand}`;
        if (!userMentionSet.has(dedupKey)) {
          userMentionSet.add(dedupKey);
          uBrandsCount[brand] = (uBrandsCount[brand] || 0) + 1;
        }
      });
      event.entities.user.models.forEach(model => {
        const dedupKey = `${dateStr}-${userId}-umodel-${model}`;
        if (!userMentionSet.has(dedupKey)) {
          userMentionSet.add(dedupKey);
          uModelsCount[model] = (uModelsCount[model] || 0) + 1;
        }
      });

      // Process AI Mentions with Deduplication
      event.entities.ai.brands.forEach(brand => {
        const dedupKey = `${dateStr}-${userId}-abrand-${brand}`;
        if (!aiMentionSet.has(dedupKey)) {
          aiMentionSet.add(dedupKey);
          aBrandsCount[brand] = (aBrandsCount[brand] || 0) + 1;
        }
      });
      event.entities.ai.models.forEach(model => {
        const dedupKey = `${dateStr}-${userId}-amodel-${model}`;
        if (!aiMentionSet.has(dedupKey)) {
          aiMentionSet.add(dedupKey);
          aModelsCount[model] = (aModelsCount[model] || 0) + 1;
        }
      });
    });

    // Formatting for Recharts
    const sortedDays = Object.keys(volumeByDay).sort();
    
    const formattedDailyVolume = sortedDays.map(date => ({
      date,
      Chats: volumeByDay[date]
    }));

    const formattedMood = sortedDays.map(date => ({
      date,
      Happy: moodByDay[date].happy,
      Neutral: moodByDay[date].neutral,
      Frustrated: moodByDay[date].frustrated
    }));

    const objToArray = (obj: Record<string, number>, keyName: string) => 
      Object.entries(obj).map(([key, val]) => ({ [keyName]: key, Count: val })).sort((a,b) => b.Count - a.Count).slice(0, 10);

    return {
      dailyVolume: formattedDailyVolume,
      userBrands: objToArray(uBrandsCount, "name"),
      userModels: objToArray(uModelsCount, "name"),
      aiBrands: objToArray(aBrandsCount, "name"),
      aiModels: objToArray(aModelsCount, "name"),
      moodData: formattedMood,
      totalCorrections: corrections,
      totalChats: filteredData.length
    };
  }, [initialData, filter]);

  return (
    <div className="space-y-8">
      {/* Top Filter & KPIs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('weekly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'weekly' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            Past 7 Days
          </button>
          <button 
            onClick={() => setFilter('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'monthly' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            Past 30 Days
          </button>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Total analyzed chats</p>
            <p className="text-2xl font-bold">{totalChats}</p>
          </div>
          <div className="h-10 w-px bg-border"></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Total AI Corrections</p>
            <p className="text-2xl font-bold text-red-500">{totalCorrections}</p>
          </div>
        </div>
      </div>

      {/* Row 1: Daily Volume */}
      <div className="bg-card border border-border p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-6">Daily Mention Volume (Chats Processed)</h3>
        <div className="h-[300px] w-full">
          {dailyVolume.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyVolume} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="Chats" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <CartesianGrid stroke="#333" strokeDasharray="5 5" vertical={false} />
                <XAxis dataKey="date" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">No data available for this period.</div>
          )}
        </div>
      </div>

      {/* Row 2: User Mentions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Most Mentioned Brands by User</h3>
          <div className="h-[250px] w-full">
            {userBrands.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userBrands} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                  <XAxis type="number" stroke="#888" />
                  <YAxis dataKey="name" type="category" stroke="#888" width={80} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
                  <Bar dataKey="Count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No mentions yet.</div>
            )}
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Most Mentioned Models by User</h3>
          <div className="h-[250px] w-full">
             {userModels.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userModels} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="name" type="category" stroke="#888" width={100} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
                    <Bar dataKey="Count" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No mentions yet.</div>
              )}
          </div>
        </div>
      </div>

      {/* Row 3: AI Mentions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Most Recommended Brands by AI</h3>
          <div className="h-[250px] w-full">
            {aiBrands.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiBrands} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                  <XAxis type="number" stroke="#888" />
                  <YAxis dataKey="name" type="category" stroke="#888" width={80} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
                  <Bar dataKey="Count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No mentions yet.</div>
            )}
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Most Recommended Models by AI</h3>
          <div className="h-[250px] w-full">
             {aiModels.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aiModels} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="name" type="category" stroke="#888" width={100} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
                    <Bar dataKey="Count" fill="#34d399" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No mentions yet.</div>
              )}
          </div>
        </div>
      </div>

      {/* Row 4: Sentiment over time */}
      <div className="bg-card border border-border p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-6">User Sentiment (Mood over Time)</h3>
        <div className="h-[300px] w-full">
           {moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#888" tick={{fontSize: 12}} />
                <YAxis stroke="#888" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="Happy" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="Neutral" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="Frustrated" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
           ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">No data available for this period.</div>
          )}
        </div>
      </div>

    </div>
  );
}
