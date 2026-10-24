"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import SearchSection from "@/components/SearchSection";
import PerspectiveSummary from "@/components/PerspectiveSummary";
import WingColumns from "@/components/WingColumns";
import { api, NewsSearchResponse, ArticleItem } from "@/lib/api";
import { Plus, Search, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<NewsSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setError(null);
    setIsLoading(true);
    setQuery(searchQuery);

    try {
      const data = await api.searchNews(searchQuery);
      setResults(data);
    } catch (err: unknown) {
      console.error("Search failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to fetch and analyze news articles. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Prominent '+' Action: smoothly resets back to centered search view without reloading
  const handleNewSearch = () => {
    setResults(null);
    setQuery("");
    setError(null);
  };

  const handleBookmarkChange = (url: string, isSaved: boolean) => {
    if (!results) return;

    const updateList = (list: ArticleItem[]) =>
      list.map((art) => (art.url === url ? { ...art, is_saved: isSaved } : art));

    setResults({
      ...results,
      left_articles: updateList(results.left_articles),
      center_articles: updateList(results.center_articles),
      right_articles: updateList(results.right_articles),
      unclassified_articles: updateList(results.unclassified_articles),
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Top Navbar */}
      <Navbar
        onNewSearch={results ? handleNewSearch : undefined}
        onSelectHistoryQuery={handleSearch}
      />

      <main className="flex-1 flex flex-col">
        {/* If no search has been executed yet, show centered ChatGPT-Style Hero */}
        {!results && (
          <div className="flex-1 flex items-center justify-center">
            <SearchSection
              onSearch={handleSearch}
              isLoading={isLoading}
              initialQuery={query}
            />
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="max-w-4xl mx-auto my-4 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results View */}
        {results && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Top Results Bar with Prominent '+' Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                {/* Prominent '+' New Search Button */}
                <button
                  type="button"
                  onClick={handleNewSearch}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                  title="Clear results and start a new search"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New Search</span>
                </button>

                <div className="border-l border-zinc-800 pl-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Inspecting:</span>
                    <h2 className="text-sm font-semibold text-zinc-100 line-clamp-1">
                      &ldquo;{results.query}&rdquo;
                    </h2>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Found {results.total_articles} Indian news reports across {results.left_articles.length + results.center_articles.length + results.right_articles.length + results.unclassified_articles.length} deduplicated stories
                  </p>
                </div>
              </div>

              {/* Compact in-place search re-run bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(query);
                }}
                className="flex items-center gap-2 max-w-md w-full"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Refine search topic..."
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
                  title="Search"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>

            {/* AI Expanded Queries Chips */}
            {results.expanded_queries && results.expanded_queries.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini Entity Queries:</span>
                </span>
                {results.expanded_queries.map((eq, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300"
                  >
                    &ldquo;{eq}&rdquo;
                  </span>
                ))}
              </div>
            )}

            {/* Perspective Comparison Summary */}
            <PerspectiveSummary
              summary={results.perspective_summary}
              query={results.query}
            />

            {/* 3-Wing Columns View + Unclassified Sources */}
            <WingColumns
              leftArticles={results.left_articles}
              centerArticles={results.center_articles}
              rightArticles={results.right_articles}
              unclassifiedArticles={results.unclassified_articles}
              onBookmarkChange={handleBookmarkChange}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800/80 py-6 mt-12 bg-zinc-950 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">SatyaLens</span>
            <span>•</span>
            <span>Open & Neutral Indian News Bias Aggregation</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Powered by Google Gemini Flash & RSS</span>
            <span>•</span>
            <span>Zero-Cost Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
