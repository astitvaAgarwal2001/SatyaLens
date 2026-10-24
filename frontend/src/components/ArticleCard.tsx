"use client";

import React, { useState } from "react";
import { ExternalLink, Bookmark } from "lucide-react";
import ClassificationBadge from "./ClassificationBadge";
import { ArticleItem, api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Props {
  article: ArticleItem;
  onBookmarkChange?: (articleUrl: string, isSaved: boolean) => void;
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Recent";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffHours = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours <= 0) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function ArticleCard({ article, onBookmarkChange }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(article.is_saved || false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const handleBookmarkToggle = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsBookmarking(true);
    try {
      if (isSaved) {
        await api.deleteBookmarkByUrl(article.url);
        setIsSaved(false);
        if (onBookmarkChange) onBookmarkChange(article.url, false);
      } else {
        await api.saveBookmark({
          title: article.title,
          url: article.url,
          domain: article.domain,
          wing: article.wing,
          snippet: article.snippet,
          publisher_name: article.publisher_name,
          published_at: article.published_at,
        });
        setIsSaved(true);
        if (onBookmarkChange) onBookmarkChange(article.url, true);
      }
    } catch (err) {
      console.error("Bookmark error:", err);
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <article className="group flex flex-col justify-between p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 transition-all duration-200 hover:shadow-lg hover:shadow-black/40">
      {/* Top publisher & domain row */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-xs text-zinc-300 truncate" title={article.publisher_name}>
              {article.publisher_name}
            </span>
            <span className="text-zinc-600 text-xs">•</span>
            <span className="text-[11px] text-zinc-400 font-mono truncate" title={article.domain}>
              {article.domain}
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 whitespace-nowrap">
            {formatRelativeTime(article.published_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-3 mb-2 leading-snug">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-start gap-1"
          >
            <span>{article.title}</span>
          </a>
        </h3>

        {/* Snippet */}
        {article.snippet && (
          <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-3">
            {article.snippet}
          </p>
        )}
      </div>

      {/* Footer: Classification Badge + Direct Link + Bookmark */}
      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2 mt-auto">
        <ClassificationBadge
          domain={article.domain}
          publisherName={article.publisher_name}
          currentWing={article.wing}
          isAiSuggested={article.ai_suggested}
        />

        <div className="flex items-center gap-1">
          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            disabled={isBookmarking}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSaved
                ? "bg-emerald-950/50 text-emerald-400 border-emerald-800/60"
                : "text-zinc-400 hover:text-zinc-200 border-zinc-800/80 hover:bg-zinc-800"
            }`}
            title={isSaved ? "Saved in bookmarks" : "Bookmark this article"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-emerald-400" : ""}`} />
          </button>

          {/* Direct Link Button */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Read full article on source"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
