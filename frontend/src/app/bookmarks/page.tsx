"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { api, SavedArticle } from "@/lib/api";
import { Bookmark, ExternalLink, Trash2, Search, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const WING_BADGE_STYLE: Record<string, string> = {
  LEFT: "bg-rose-950/40 text-rose-300 border-rose-800/50",
  CENTER: "bg-emerald-950/40 text-emerald-300 border-emerald-800/50",
  RIGHT: "bg-amber-950/40 text-amber-300 border-amber-800/50",
  UNCLASSIFIED: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<SavedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [wingFilter, setWingFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    setIsLoading(true);
    try {
      const data = await api.getBookmarks();
      setBookmarks(data);
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await api.deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete bookmark:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesWing = wingFilter === "ALL" || b.wing.toUpperCase() === wingFilter;
    const matchesSearch =
      b.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.domain.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (b.publisher_name && b.publisher_name.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesWing && matchesSearch;
  });

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800 mb-6">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 mb-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to News Aggregator</span>
              </Link>
              <h1 className="text-2xl font-bold flex items-center gap-2.5">
                <Bookmark className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                <span>Your Saved Articles</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Articles you have bookmarked for comparative analysis ({bookmarks.length} total)
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search in bookmarks..."
                  className="bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={wingFilter}
                onChange={(e) => setWingFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Wings</option>
                <option value="LEFT">Left Wing</option>
                <option value="CENTER">Center / Neutral</option>
                <option value="RIGHT">Right Wing</option>
                <option value="UNCLASSIFIED">Unclassified</option>
              </select>
            </div>
          </div>

          {/* Bookmarks Grid */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
              <p className="text-xs">Loading saved bookmarks...</p>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-zinc-800 rounded-2xl p-8">
              <Bookmark className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-zinc-300 mb-1">No bookmarks found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
                {bookmarks.length === 0
                  ? "You haven't bookmarked any articles yet. Search topics on the aggregator and click the bookmark icon on any card."
                  : "No bookmarked articles match your current search and wing filter."}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-colors"
              >
                Search News
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBookmarks.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-black/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-semibold text-xs text-zinc-300 truncate">
                        {item.publisher_name || item.domain}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          WING_BADGE_STYLE[item.wing.toUpperCase()] || WING_BADGE_STYLE.UNCLASSIFIED
                        }`}
                      >
                        {item.wing}
                      </span>
                    </div>

                    <h3 className="text-sm font-medium text-zinc-100 line-clamp-3 mb-2 leading-snug">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-400 hover:underline"
                      >
                        {item.title}
                      </a>
                    </h3>

                    {item.snippet && (
                      <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-3">
                        {item.snippet}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 mt-auto">
                    <span className="font-mono text-[11px] truncate max-w-[160px]">
                      {item.domain}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="Read source article"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded-lg border border-zinc-800 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition-colors"
                        title="Remove bookmark"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
