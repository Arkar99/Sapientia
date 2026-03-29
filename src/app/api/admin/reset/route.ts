import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { auth, currentUser } from "@clerk/nextjs/server";

const ADMIN_EMAILS = [
  "arkar.p67@rsu.ac.th",
  "nayzar.a66@rsu.ac.th",
  "ye.z67@rsu.ac.th",
];

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);

    if (!userId || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type } = await req.json();

    if (type === 'analytics') {
      await kv.set('ai_analytics', []);
      return NextResponse.json({ success: true, message: "AI Analytics reset successfully" });
    } else if (type === 'orders') {
      await kv.set('orders', []);
      return NextResponse.json({ success: true, message: "Orders reset successfully" });
    } else if (type === 'all') {
      await kv.set('ai_analytics', []);
      await kv.set('orders', []);
      return NextResponse.json({ success: true, message: "All data reset successfully" });
    }

    return NextResponse.json({ error: "Invalid reset type" }, { status: 400 });
  } catch (error: any) {
    console.error("Reset API Error:", error);
    return NextResponse.json({ error: "External error", details: error.message }, { status: 500 });
  }
}
