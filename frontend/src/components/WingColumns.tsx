"use client";

import React, { useState } from "react";
import ArticleCard from "./ArticleCard";
import { ArticleItem } from "@/lib/api";
import { ShieldCheck, Newspaper, Compass, HelpCircle } from "lucide-react";

interface Props {
  leftArticles: ArticleItem[];
  centerArticles: ArticleItem[];
  rightArticles: ArticleItem[];
  unclassifiedArticles: ArticleItem[];
  onBookmarkChange?: (articleUrl: string, isSaved: boolean) => void;
}

export default function WingColumns({
  leftArticles,
  centerArticles,
  rightArticles,
  unclassifiedArticles,
  onBookmarkChange,
}: Props) {
  // Mobile tab selector state: "ALL", "LEFT", "CENTER", "RIGHT", "UNCLASSIFIED"
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const columns = [
    {
      key: "LEFT",
      title: "Left Wing",
      subtitle: "The Wire, Scroll, Quint, Maktoob",
      color: "border-rose-800/40 bg-rose-950/10",
      headerColor: "text-rose-400 bg-rose-950/30 border-rose-800/50",
      dot: "bg-rose-500",
      countBadge: "bg-rose-500/20 text-rose-300",
      icon: <Compass className="w-4 h-4 text-rose-400" />,
      articles: leftArticles,
    },
    {
      key: "CENTER",
      title: "Center / Neutral",
      subtitle: "The Hindu, Indian Express, PTI, Mint",
      color: "border-emerald-800/40 bg-emerald-950/10",
      headerColor: "text-emerald-400 bg-emerald-950/30 border-emerald-800/50",
      dot: "bg-emerald-500",
      countBadge: "bg-emerald-500/20 text-emerald-300",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      articles: centerArticles,
    },
    {
      key: "RIGHT",
      title: "Right Wing",
      subtitle: "OpIndia, Swarajya, Republic, Organiser",
      color: "border-amber-800/40 bg-amber-950/10",
      headerColor: "text-amber-400 bg-amber-950/30 border-amber-800/50",
      dot: "bg-amber-500",
      countBadge: "bg-amber-500/20 text-amber-300",
      icon: <Newspaper className="w-4 h-4 text-amber-400" />,
      articles: rightArticles,
    },
    {
      key: "UNCLASSIFIED",
      title: "Unclassified",
      subtitle: "Regional & Specialized Sources",
      color: "border-zinc-800/60 bg-zinc-900/20",
      headerColor: "text-zinc-400 bg-zinc-900/60 border-zinc-800",
      dot: "bg-zinc-500",
      countBadge: "bg-zinc-800 text-zinc-400",
      icon: <HelpCircle className="w-4 h-4 text-zinc-400" />,
      articles: unclassifiedArticles,
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Mobile/Tablet tab switcher */}
      <div className="flex lg:hidden items-center justify-between overflow-x-auto pb-2 border-b border-zinc-800 gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === "ALL"
              ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          All Wings
        </button>
        {columns.map((col) => (
          <button
            key={col.key}
            type="button"
            onClick={() => setActiveTab(col.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === col.key
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
            <span>{col.title}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-900 text-zinc-400">
              {col.articles.length}
            </span>
          </button>
        ))}
      </div>

      {/* 4-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          if (activeTab !== "ALL" && activeTab !== col.key) {
            return null;
          }

          return (
            <div
              key={col.key}
              className={`flex flex-col rounded-2xl border ${col.color} p-3.5 min-h-[500px] backdrop-blur-sm`}
            >
              {/* Column Header */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl border ${col.headerColor} mb-3.5`}
              >
                <div className="flex items-center gap-2">
                  {col.icon}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      {col.title}
                    </h3>
                    <p className="text-[10px] text-zinc-400 truncate max-w-[150px]">
                      {col.subtitle}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${col.countBadge}`}
                >
                  {col.articles.length}
                </span>
              </div>

              {/* Article Cards Stream */}
              <div className="space-y-3 flex-1">
                {col.articles.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-zinc-800/80 text-zinc-500 text-xs">
                    <p className="font-medium mb-1">No articles found</p>
                    <p className="text-[11px] text-zinc-400">
                      No coverage from this wing matched the query keywords.
                    </p>
                  </div>
                ) : (
                  col.articles.map((art) => (
                    <ArticleCard
                      key={art.url}
                      article={art}
                      onBookmarkChange={onBookmarkChange}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
