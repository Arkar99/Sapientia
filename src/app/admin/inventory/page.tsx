import { InventoryManager } from "@/components/admin/InventoryManager";
import { loadCameras, loadInventory } from "@/lib/data";

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const inventory = loadInventory();
  const cameras = loadCameras();

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
