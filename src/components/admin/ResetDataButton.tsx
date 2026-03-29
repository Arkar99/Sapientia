"use client";

import { useState } from "react";
import { Trash2, RefreshCw } from "lucide-react";

export function ResetDataButton({ type = 'analytics' }: { type?: 'analytics' | 'orders' | 'all' }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to reset data");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="relative">
      {!showConfirm ? (
        <button 
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg transition-all text-sm font-medium"
        >
          <Trash2 size={16} />
          Reset Analytics Data
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200">
          <p className="text-xs font-semibold px-2">Are you sure?</p>
          <button 
            disabled={loading}
            onClick={() => handleReset()}
            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50 flex items-center gap-1"
          >
            {loading && <RefreshCw size={12} className="animate-spin" />}
            Yes, Reset All
          </button>
          <button 
            disabled={loading}
            onClick={() => setShowConfirm(false)}
            className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
