"use client";

import { useState, useMemo, useRef } from "react";
import { Edit2, Save, Trash2, X, Plus, UploadCloud, Minus, Filter, ArrowUpDown } from "lucide-react";

export type InventoryItem = {
  id: string;
  stock_level: number;
  status: string;
  last_restocked: string;
  price_thb: number;
};

export type CameraData = {
  Brand: string;
  Model: string;
  image_file: string;
};

export function generateId(brand: string, model: string) {
  return `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function InventoryManager({ 
  initialInventory, 
  allCameras 
}: { 
  initialInventory: InventoryItem[], 
  allCameras: CameraData[] 
}) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit Buffer
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  
  // Filtering & Sorting State
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");

  // Add Item State
  const [isAdding, setIsAdding] = useState(false);
  const [selectedAddId, setSelectedAddId] = useState<string>("");
  const [addPrice, setAddPrice] = useState<number>(0);
  const [addStock, setAddStock] = useState<number>(0);

  // Filtered & Sorted Logic
  const inventoryView = useMemo(() => {
    let result = inventory.map(item => {
      const camera = allCameras.find(c => generateId(c.Brand, c.Model) === item.id);
      return {
        ...item,
        Brand: camera?.Brand || "Unknown",
        Model: camera?.Model || "Unknown",
        image_file: camera?.image_file || null
      };
    });

    // Apply Brand Filter
    if (filterBrand !== "all") {
      result = result.filter(item => item.Brand === filterBrand);
    }

    // Apply Status Filter
    if (filterStatus !== "all") {
      result = result.filter(item => item.status === filterStatus);
    }

    // Apply Price Sort
    if (priceSort === "asc") {
      result.sort((a, b) => a.price_thb - b.price_thb);
    } else if (priceSort === "desc") {
      result.sort((a, b) => b.price_thb - a.price_thb);
    } else {
      result.sort((a, b) => a.Brand.localeCompare(b.Brand));
    }

    return result;
  }, [inventory, allCameras, filterBrand, filterStatus, priceSort]);

  // Derived Filter Options
  const brands = useMemo(() => {
    const b = new Set(inventory.map(item => {
      const camera = allCameras.find(c => generateId(c.Brand, c.Model) === item.id);
      return camera?.Brand;
    }).filter(Boolean));
    return Array.from(b).sort() as string[];
  }, [inventory, allCameras]);

  const untrackedCameras = useMemo(() => {
    const trackedIds = new Set(inventory.map(i => i.id));
    return allCameras.filter(c => !trackedIds.has(generateId(c.Brand, c.Model)));
  }, [inventory, allCameras]);

  // Handlers
  const updateStock = async (item: InventoryItem, newStock: number) => {
    if (newStock < 0) return;
    
    // Optimistic UI update
    const prevItem = { ...item };
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, stock_level: newStock, status: newStock === 0 ? "Out of Stock" : newStock <= 5 ? "Low Stock" : "In Stock" } : i));

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, price_thb: item.price_thb, stock_level: newStock })
      });
      if (!res.ok) {
        setInventory(prev => prev.map(i => i.id === item.id ? prevItem : i));
      }
    } catch(e) {
      setInventory(prev => prev.map(i => i.id === item.id ? prevItem : i));
    }
  };

  const startEditing = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditPrice(item.price_thb);
    setEditStock(item.stock_level);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, price_thb: editPrice, stock_level: editStock })
      });
      if (res.ok) {
        const updatedItem = await res.json();
        setInventory(prev => prev.map(i => i.id === editingId ? updatedItem : i));
        setEditingId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Remove this camera from active inventory?")) return;
    try {
      const res = await fetch(`/api/admin/inventory?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setInventory(prev => prev.filter(i => i.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSubmit = async () => {
    if (!selectedAddId) return;
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedAddId, price_thb: addPrice, stock_level: addStock })
      });
      if (res.ok) {
        const newItem = await res.json();
        setInventory(prev => [...prev, newItem]);
        setIsAdding(false);
        setSelectedAddId("");
        setAddPrice(0);
        setAddStock(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openUploader = (id: string) => {
    setUploadTargetId(id);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", uploadTargetId);

    try {
      const res = await fetch("/api/admin/inventory/upload", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        window.location.reload(); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hidden File Input for Image Upload */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* Top Banner & Add Button */}
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
        <div>
           <p className="text-sm text-muted-foreground">Tracking {inventory.length} active models.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add New Camera
        </button>
      </div>

      {/* Add New Camera Drawer/Panel */}
      {isAdding && (
        <div className="bg-card border border-border p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Add to Active Inventory</h3>
            <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Select Model from Database</label>
              <select 
                value={selectedAddId} 
                onChange={e => setSelectedAddId(e.target.value)}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Choose Camera --</option>
                {untrackedCameras.map(c => (
                   <option key={generateId(c.Brand, c.Model)} value={generateId(c.Brand, c.Model)}>
                     {c.Brand} {c.Model}
                   </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price (THB)</label>
              <input 
                type="number" 
                value={addPrice} 
                onChange={e => setAddPrice(Number(e.target.value))}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stock Level</label>
              <input 
                type="number" 
                value={addStock} 
                onChange={e => setAddStock(Number(e.target.value))}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
             <button 
                onClick={handleAddSubmit}
                disabled={!selectedAddId}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md shadow disabled:opacity-50"
             >
               Add to Inventory
             </button>
          </div>
        </div>
      )}

      {/* Filter Row - Sticky */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center gap-4 bg-card/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-sm mb-6">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter size={16} />
          <span>Filters:</span>
        </div>
        
        {/* Brand Filter */}
        <select 
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary min-w-[140px]"
        >
          <option value="all">All Brands</option>
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary min-w-[140px]"
        >
          <option value="all">All Statuses</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        {/* Price Toggle Sort */}
        <button 
          onClick={() => {
            if (priceSort === "none") setPriceSort("asc");
            else if (priceSort === "asc") setPriceSort("desc");
            else setPriceSort("none");
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors ${
            priceSort !== "none" ? "bg-primary/10 border-primary text-primary" : "bg-background border-input text-muted-foreground hover:bg-muted"
          }`}
        >
          <ArrowUpDown size={14} />
          Price: {priceSort === "none" ? "Default" : priceSort === "asc" ? "Low-High" : "High-Low"}
        </button>

        <button 
          onClick={() => {
            setFilterBrand("all");
            setFilterStatus("all");
            setPriceSort("none");
          }}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          Clear All
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Brand / Model</th>
                <th className="px-6 py-4 text-right">Price (THB)</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryView.map((item) => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                     <div className="relative group w-12 h-12 rounded-lg border border-border bg-background overflow-hidden flex items-center justify-center">
                        {item.image_file ? (
                          <img src={`/${item.image_file}`} alt={item.Model} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                        <button 
                          onClick={() => openUploader(item.id)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Upload new image"
                        >
                          <UploadCloud size={16} />
                        </button>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="font-bold">{item.Brand}</div>
                     <div className="text-muted-foreground">{item.Model}</div>
                  </td>
                  
                  {/* Price Column */}
                  <td className="px-6 py-4 text-right">
                    {editingId === item.id ? (
                      <input 
                        type="number" 
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-24 text-right bg-background border border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary rounded px-2 py-1"
                      />
                    ) : (
                      <span className="font-medium">฿{item.price_thb.toLocaleString()}</span>
                    )}
                  </td>

                  {/* Stock Column */}
                  <td className="px-6 py-4 text-center">
                    {editingId === item.id ? (
                      <input 
                        type="number" 
                        value={editStock}
                        onChange={(e) => setEditStock(Number(e.target.value))}
                        className="w-16 text-center bg-background border border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary rounded px-2 py-1"
                      />
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => updateStock(item, item.stock_level - 1)}
                          disabled={item.stock_level <= 0}
                          className="p-1 rounded bg-muted hover:bg-muted-foreground/20 text-muted-foreground transition-colors disabled:opacity-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-medium w-8">{item.stock_level}</span>
                        <button 
                          onClick={() => updateStock(item, item.stock_level + 1)}
                          className="p-1 rounded bg-muted hover:bg-muted-foreground/20 text-muted-foreground transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Status Column */}
                  <td className="px-6 py-4">
                     <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                       item.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                       item.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                       'bg-red-500/10 text-red-500 border border-red-500/20'
                     }`}>
                       {item.status}
                     </span>
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-4 text-right space-x-2">
                     {editingId === item.id ? (
                        <>
                          <button onClick={saveEdit} className="text-emerald-500 hover:text-emerald-400 p-1" title="Save">
                            <Save size={18} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground p-1" title="Cancel">
                            <X size={18} />
                          </button>
                        </>
                     ) : (
                        <>
                          <button onClick={() => startEditing(item)} className="text-blue-500 hover:text-blue-400 p-1" title="Edit">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-400 p-1" title="Remove">
                            <Trash2 size={18} />
                          </button>
                        </>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
