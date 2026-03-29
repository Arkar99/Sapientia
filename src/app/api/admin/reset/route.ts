import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { kv } from "@vercel/kv";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ADMIN_EMAILS, KV_KEYS } from "@/lib/config";
import { loadAnalyticsSeed } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);

    if (!userId || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, action = "reset" } = await req.json();

    if (type === "analytics") {
      if (action === "seed") {
        const seedData = loadAnalyticsSeed();
        await kv.set(KV_KEYS.analytics, seedData);
        return NextResponse.json({ success: true, message: "AI Analytics seeded successfully" });
      }
      await kv.set(KV_KEYS.analytics, []);
      return NextResponse.json({ success: true, message: "AI Analytics reset successfully" });
    }

    if (type === "orders") {
      await kv.set(KV_KEYS.orders, []);
      return NextResponse.json({ success: true, message: "Orders reset successfully" });
    }

    if (type === "all") {
      await Promise.all([
        kv.set(KV_KEYS.analytics, []),
        kv.set(KV_KEYS.orders, []),
      ]);
      return NextResponse.json({ success: true, message: "All data reset successfully" });
    }

    return NextResponse.json({ error: "Invalid reset type" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Reset API Error:", error);
    return NextResponse.json({ error: "External error", details: message }, { status: 500 });
  }
}
