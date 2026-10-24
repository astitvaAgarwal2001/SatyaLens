"use client";

import React, { useEffect, useState } from "react";
import { History, X, Trash2, ArrowRight, Clock } from "lucide-react";
import { api, SearchHistoryItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (query: string) => void;
}

export default function HistoryModal({ isOpen, onClose, onSelectQuery }: Props) {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setIsLoading(true);
      api
        .getHistory()
        .then((items) => setHistoryItems(items))
        .catch((err) => console.error("Error loading history:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleClear = async () => {
    try {
      await api.clearHistory();
      setHistoryItems([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-5 text-zinc-100 relative">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold">Recent Search History</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-3 max-h-72 overflow-y-auto space-y-1.5">
          {!user ? (
            <p className="text-xs text-zinc-400 text-center py-6">
              Sign in to automatically track and revisit your search history.
            </p>
          ) : isLoading ? (
            <p className="text-xs text-zinc-400 text-center py-6">Loading history...</p>
          ) : historyItems.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-6">No recent searches found.</p>
          ) : (
            historyItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectQuery(item.query);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/80 transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="text-xs text-zinc-200 group-hover:text-emerald-400 truncate">
                    {item.query}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 shrink-0" />
              </button>
            ))
          )}
        </div>

        {user && historyItems.length > 0 && (
          <div className="pt-3 border-t border-zinc-800 flex justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
