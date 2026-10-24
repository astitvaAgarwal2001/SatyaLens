"use client";

import React, { useState } from "react";
import { Search, Sparkles, ArrowRight, Loader2, X } from "lucide-react";

interface Props {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
}

const SUGGESTIONS = [
  "Supreme Court electoral bonds",
  "ISRO Gaganyaan mission",
  "Union Budget 2025",
  "Waqf Amendment Bill",
  "Farmers MSP protests",
  "India Canada diplomatic standoff",
];

export default function SearchSection({ onSearch, isLoading, initialQuery = "" }: Props) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleChipClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center px-4 py-8 md:py-16 transition-all duration-300">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-6 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <span>Multi-Wing Indian Media Bias & Fact-Checking Aggregator</span>
      </div>

      {/* Hero Title */}
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 mb-3">
        See Every Angle with{" "}
        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
          SatyaLens
        </span>
      </h1>
      <p className="text-sm sm:text-base text-zinc-400 max-w-xl mb-8 leading-relaxed">
        Compare Left, Center, and Right editorial framing across 50+ national & regional Indian publications in real time.
      </p>

      {/* ChatGPT-Style Centered Search Bar */}
      <form onSubmit={handleSubmit} className="w-full relative group">
        <div className="relative flex items-center w-full rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl shadow-black/80 group-focus-within:border-emerald-500/60 group-focus-within:ring-2 group-focus-within:ring-emerald-500/20 transition-all duration-200">
          <div className="pl-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            placeholder="Enter a news headline or event to inspect Indian coverage..."
            className="w-full bg-transparent px-4 py-4 text-sm sm:text-base text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-50"
          />

          {query && !isLoading && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1.5 mr-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="mr-2.5 p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold disabled:opacity-40 disabled:hover:bg-emerald-500 transition-all shadow-md shadow-emerald-500/20"
            title="Inspect Coverage"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Expanding queries via Gemini Flash & querying Google News IN feeds...</span>
        </div>
      )}

      {/* Suggestion Chips */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-zinc-400 mr-1">Trending:</span>
        {SUGGESTIONS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleChipClick(item)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-zinc-100 transition-all shadow-sm disabled:opacity-50"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
