import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { auth } from "@clerk/nextjs/server";

const INVENTORY_FILE = path.join(process.cwd(), "src", "data", "inventory.json");

function getInventory() {
  const data = fs.readFileSync(INVENTORY_FILE, "utf-8");
  return JSON.parse(data);
}

function saveInventory(data: any) {
  fs.writeFileSync(INVENTORY_FILE, JSON.stringify(data, null, 2));
}

function calculateStatus(stock_level: number) {
  if (stock_level === 0) return "Out of Stock";
  if (stock_level <= 5) return "Low Stock";
  return "In Stock";
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    return NextResponse.json(getInventory());
  } catch (error) {
    return NextResponse.json({ error: "Failed to load inventory" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const inventory = getInventory();
    
    // Prevent duplicates
    if (inventory.some((i: any) => i.id === body.id)) {
        return NextResponse.json({ error: "Item already exists in inventory" }, { status: 400 });
    }

    const newItem = {
      id: body.id,
      stock_level: Number(body.stock_level),
      status: calculateStatus(Number(body.stock_level)),
      last_restocked: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      price_thb: Number(body.price_thb)
    };

    inventory.push(newItem);
    saveInventory(inventory);
    
    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add to inventory" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const inventory = getInventory();
    
    const index = inventory.findIndex((item: any) => item.id === body.id);
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const oldStock = inventory[index].stock_level;
    const newStock = Number(body.stock_level);

    const updatedItem = {
      ...inventory[index],
      stock_level: newStock,
      price_thb: Number(body.price_thb),
      status: calculateStatus(newStock)
    };

    // Update restock date if stock is replenished
    if (newStock > oldStock) {
      updatedItem.last_restocked = new Date().toISOString().split('T')[0];
    }

    inventory[index] = updatedItem;
    saveInventory(inventory);
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    let inventory = getInventory();
    inventory = inventory.filter((item: any) => item.id !== id);
    saveInventory(inventory);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
