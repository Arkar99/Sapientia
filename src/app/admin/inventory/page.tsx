import fs from "fs";
import path from "path";
import { InventoryManager } from "@/components/admin/InventoryManager";

export const dynamic = 'force-dynamic';

function getInitialData() {
  const invPath = path.join(process.cwd(), "src", "data", "inventory.json");
  const camPath = path.join(process.cwd(), "src", "data", "cameras.json");
  
  const inventory = JSON.parse(fs.readFileSync(invPath, "utf-8"));
  const cameras = JSON.parse(fs.readFileSync(camPath, "utf-8"));
  
  return { inventory, cameras };
}

export default async function InventoryPage() {
  const { inventory, cameras } = getInitialData();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
        <p className="text-muted-foreground mt-1">Add, update, and remove cameras from your active storefront. Upload new images.</p>
      </div>
      <InventoryManager initialInventory={inventory} allCameras={cameras} />
    </div>
  );
}
