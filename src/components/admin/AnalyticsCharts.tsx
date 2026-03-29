"use client";

import { useState, useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { AIAnalyticsEvent } from "@/lib/admin/ai-analytics";

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

const ImagePlaceholder = () => (
  <div className="flex flex-col items-center justify-center text-muted-foreground/30 w-full h-full">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mb-1">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">No Image Data</span>
  </div>
);

function TrendingCameraCard({ m, idx, maxScore }: { m: any; idx: number; maxScore: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl relative overflow-hidden group hover:border-accent-sapientia/50 transition-all shadow-sm flex flex-col">
      <div className="h-32 w-full bg-muted/30 relative overflow-hidden flex items-center justify-center p-2">
        {m.image && !imgError ? (
          <img
            src={m.image}
            alt={m.name}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <ImagePlaceholder />
        )}
        <div className="absolute top-0 right-0 p-1 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="text-4xl font-black italic text-accent-sapientia">#{idx + 1}</span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[10px] text-accent-sapientia font-black uppercase tracking-widest mb-0.5 opacity-70">
            {m.brand} • Rank #{idx + 1}
          </p>
          <h4 className="font-bold text-sm text-foreground group-hover:text-accent-sapientia transition-colors line-clamp-2 leading-tight">
            {m.name}
          </h4>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(m.score / maxScore) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-accent-sapientia"
            />
          </div>
          <span className="text-[11px] font-bold text-foreground/80 min-w-8 text-right">{m.score.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsCharts({ initialData, allCameras }: { initialData: AIAnalyticsEvent[], allCameras: any[] }) {
  const [filter, setFilter] = useState<'weekly' | 'monthly'>('monthly');

  const {
    dailyVolume,
    userBrands,
    userModels,
    aiBrands,
    aiModels,
    moodData,
    totalCorrections,
    totalChats,
    trendingModels,
    brandColorMap
  } = useMemo(() => {
    // 1. Filter by timeframe
    const now = new Date();
    const daysToSubtract = filter === 'weekly' ? 7 : 30;
    const cutoffDate = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);

    const filteredData = initialData.filter(d => new Date(d.timestamp) >= cutoffDate);

    // Trackers
    const volumeByDay: Record<string, number> = {};
    const moodByDay: Record<string, { happy: number; neutral: number; frustrated: number }> = {};
    
    const userMentionSet = new Set<string>(); 
    const uBrandsCount: Record<string, number> = {};
    const uModelsCount: Record<string, number> = {};
    const aBrandsCount: Record<string, number> = {};
    const aModelsCount: Record<string, number> = {};
    const modelScores: Record<string, number> = {};

    let corrections = 0;

    filteredData.forEach(event => {
      const dateStr = new Date(event.timestamp).toISOString().split('T')[0];
      const sessionId = event.sessionId || event.userId;

      // Volume tracking
      volumeByDay[dateStr] = (volumeByDay[dateStr] || 0) + 1;

      // Mood tracking
      if (!moodByDay[dateStr]) moodByDay[dateStr] = { happy: 0, neutral: 0, frustrated: 0 };
      moodByDay[dateStr][event.sentiment] += 1;

      // Correction tracking
      if (event.isCorrection) corrections++;

      // 1. Process User Mentions (Deduplicated by Session)
      event.entities.user.brands.forEach(brand => {
        const dedupKey = `${sessionId}-ubrand-${brand}`;
        if (!userMentionSet.has(dedupKey)) {
          userMentionSet.add(dedupKey);
          uBrandsCount[brand] = (uBrandsCount[brand] || 0) + 1;
        }
      });
      event.entities.user.models.forEach(model => {
        const dedupKey = `${sessionId}-umodel-${model}`;
        if (!userMentionSet.has(dedupKey)) {
          userMentionSet.add(dedupKey);
          uModelsCount[model] = (uModelsCount[model] || 0) + 1;
          // Trending Logic: User weight 0.7
          modelScores[model] = (modelScores[model] || 0) + 0.7;
        }
      });

      // 2. Process AI Mentions (No Deduplication - count every time)
      event.entities.ai.brands.forEach(brand => {
        aBrandsCount[brand] = (aBrandsCount[brand] || 0) + 1;
      });
      
      const aiModelCount = event.entities.ai.models.length;
      event.entities.ai.models.forEach(model => {
        aModelsCount[model] = (aModelsCount[model] || 0) + 1;
        // Trending Logic: AI weight 0.3 split across all recommended models in this response
        if (aiModelCount > 0) {
          modelScores[model] = (modelScores[model] || 0) + (0.3 / aiModelCount);
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

    const objToArray = (obj: Record<string, number>, keyName: string, isModel: boolean = false) => 
      Object.entries(obj).map(([key, val]) => {
        const item: any = { [keyName]: key, Count: val };
        if (isModel) {
          const cam = allCameras.find(c => c.Model === key);
          item.brand = cam?.Brand || "Not in Database";
        }
        return item;
      }).sort((a,b) => b.Count - a.Count).slice(0, 30);

    return {
      dailyVolume: formattedDailyVolume,
      userBrands: objToArray(uBrandsCount, "name"),
      userModels: objToArray(uModelsCount, "name", true),
      aiBrands: objToArray(aBrandsCount, "name"),
      aiModels: objToArray(aModelsCount, "name", true),
      moodData: formattedMood,
      totalCorrections: corrections,
      totalChats: filteredData.length,
      trendingModels: Object.entries(modelScores)
        .map(([name, score]) => {
          const cam = allCameras.find(c => c.Model === name);
          return { 
            name, 
            score,
            brand: cam?.Brand || "Not in Database",
            image: cam?.image_file ? `/${cam.image_file}` : null
          };
        })
        .sort((a,b) => b.score - a.score)
        .slice(0, 5),
      brandColorMap: Object.keys(uBrandsCount).concat(Object.keys(aBrandsCount))
        .filter((v, i, a) => a.indexOf(v) === i) // Unique brands
        .reduce((acc, brand, index) => {
          acc[brand] = CHART_COLORS[index % CHART_COLORS.length];
          return acc;
        }, {} as Record<string, string>)
    };
  }, [initialData, filter, allCameras]);

  const CustomTooltip = ({ active, payload, label, unit }: any) => {
    if (active && payload && payload.length) {
      // For multi-series (like AreaChart sentiment)
      if (payload.length > 1) {
        return (
          <div className="bg-[#111] border border-border rounded-lg p-3 shadow-2xl backdrop-blur-md">
            <p className="text-white font-bold text-xs mb-2 border-b border-border pb-1 font-mono uppercase tracking-widest opacity-60">{label}</p>
            <div className="space-y-1.5">
              {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke || p.color || p.fill }}></div>
                    <span className="text-xs text-white/80">{p.name}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: p.stroke || p.color || p.fill }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Existing single-series logic (Bars/Pies)
      const data = payload[0].payload;
      const color = payload[0].color || payload[0].fill || 
                   (data.brand ? brandColorMap[data.brand] : brandColorMap[data.name]) || 
                   '#3b82f6'; 

      return (
        <div className="bg-[#111] border-l-4 rounded-md p-3 shadow-2xl backdrop-blur-md border-opacity-95" style={{ borderColor: color }}>
          <p className="text-white font-bold text-sm mb-0.5">{data.name}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
            <p className="text-xs font-medium" style={{ color: color }}>
              {data.brand ? `${data.brand} • ` : ''}{payload[0].value} {unit || 'mentions'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

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
      {/* Row 0: Trending Models */}
      <div className="bg-accent-sapientia/5 border border-accent-sapientia/20 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-accent-sapientia/10 flex items-center justify-center text-accent-sapientia">
            <span className="text-xl">🔥</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground font-title tracking-tight">Top 5 most discussed cameras</h3>
            <p className="text-sm text-muted-foreground italic">Weighted by User Interest (70%) & AI Influence (30%)</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {trendingModels.length > 0 ? trendingModels.map((m, idx) => (
            <TrendingCameraCard key={m.name} m={m} idx={idx} maxScore={trendingModels[0].score} />
          )) : (
            <div className="col-span-5 text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
              Not enough data to calculate trends.
            </div>
          )}
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
                <YAxis allowDecimals={false} stroke="#888" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} 
                  itemStyle={{ color: '#fff' }} 
                  labelStyle={{ color: '#fff' }} 
                />
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
                <PieChart>
                  <Pie
                    data={userBrands}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="Count"
                    nameKey="name"
                  >
                    {userBrands.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={brandColorMap[entry.name]} />
                    ))}
                  </Pie>
                   <Tooltip content={<CustomTooltip unit="mentions" />} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No mentions yet.</div>
            )}
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Most Mentioned Models by User</h3>
          <div className="h-[300px] w-full overflow-y-auto pr-2 custom-scrollbar">
             {userModels.length > 0 ? (
                <div style={{ height: `${Math.max(userModels.length * 45, 250)}px`, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userModels} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                      <XAxis type="number" allowDecimals={false} stroke="#888" />
                      <YAxis dataKey="name" type="category" stroke="#888" width={100} tick={{fontSize: 10}} interval={0} 
                             tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 12)}...` : val} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                        content={<CustomTooltip unit="times" />}
                      />
                      <Bar dataKey="Count" radius={[0, 4, 4, 0]} barSize={20}>
                        {userModels.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={brandColorMap[entry.brand]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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
                <PieChart>
                  <Pie
                    data={aiBrands}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="Count"
                    nameKey="name"
                  >
                    {aiBrands.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={brandColorMap[entry.name]} />
                    ))}
                  </Pie>
                   <Tooltip content={<CustomTooltip unit="recs" />} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No mentions yet.</div>
            )}
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6">Most Recommended Models by AI</h3>
          <div className="h-[300px] w-full overflow-y-auto pr-2 custom-scrollbar">
             {aiModels.length > 0 ? (
                <div style={{ height: `${Math.max(aiModels.length * 45, 250)}px`, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aiModels} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                      <XAxis type="number" allowDecimals={false} stroke="#888" />
                      <YAxis dataKey="name" type="category" stroke="#888" width={100} tick={{fontSize: 10}} interval={0} 
                             tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 12)}...` : val} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                        content={<CustomTooltip unit="recs" />}
                      />
                      <Bar dataKey="Count" radius={[0, 4, 4, 0]} barSize={20}>
                        {aiModels.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={brandColorMap[entry.brand]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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
                <YAxis allowDecimals={false} stroke="#888" tick={{fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="Happy" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={3} />
                <Area type="monotone" dataKey="Neutral" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={3} />
                <Area type="monotone" dataKey="Frustrated" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={3} />
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
