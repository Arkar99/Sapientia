import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import fs from "fs";
import path from "path";
import { auth, currentUser } from "@clerk/nextjs/server";

const ADMIN_EMAILS = [
  "arkar.p67@rsu.ac.th",
  "nayzar.a66@rsu.ac.th",
  "ye.z67@rsu.ac.th",
];

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);

    if (!userId || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ordersPath = path.join(process.cwd(), "src/data/orders.json");
    const orders = JSON.parse(fs.readFileSync(ordersPath, "utf-8"));

    // Seed Orders to KV
    await kv.set('orders', orders);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${orders.length} orders to Vercel KV.`,
      orders 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
