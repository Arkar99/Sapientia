"use client";

import { useState } from "react";
import { Trash2, RefreshCw } from "lucide-react";

export function ResetDataButton({ type = 'analytics' }: { type?: 'analytics' | 'orders' | 'all' }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [typeAction, setTypeAction] = useState<'reset' | 'seed'>('reset');

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, action: typeAction })
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
        <div className="flex gap-2">
          <button 
            onClick={() => { setTypeAction('reset'); setShowConfirm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg transition-all text-sm font-medium"
          >
            <Trash2 size={16} />
            Reset Analytics
          </button>
          <button 
            onClick={() => { setTypeAction('seed'); setShowConfirm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 rounded-lg transition-all text-sm font-medium"
          >
            <RefreshCw size={16} />
            Seed Testing Data
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200">
          <p className="text-xs font-semibold px-2">
            {typeAction === 'reset' ? 'Clear all data?' : 'Replace with testing data?'}
          </p>
          <button 
            disabled={loading}
            onClick={() => handleReset()}
            className={`px-3 py-1 text-white text-xs rounded disabled:opacity-50 flex items-center gap-1 ${typeAction === 'reset' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {loading && <RefreshCw size={12} className="animate-spin" />}
            {typeAction === 'reset' ? 'Yes, Reset' : 'Yes, Seed Data'}
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
