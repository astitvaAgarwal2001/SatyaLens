"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, GitCompare, ChevronDown, ChevronUp } from "lucide-react";
import { PerspectiveSummary as PerspectiveType } from "@/lib/api";

interface Props {
  summary?: PerspectiveType;
  query: string;
}

export default function PerspectiveSummary({ summary, query }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!summary) return null;

  return (
    <div className="w-full mb-8 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-900/40 border border-zinc-800 p-5 md:p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-800/80 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-semibold text-zinc-100 flex items-center gap-2">
              <span>AI Perspective Comparison Summary</span>
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                Gemini 1.5 Flash
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Comparative narrative analysis for: <span className="text-zinc-200 italic font-medium">&ldquo;{query}&rdquo;</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors"
        >
          {isExpanded ? (
            <>
              <span>Collapse</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Expand Analysis</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 relative z-10 animate-in fade-in duration-200">
          {/* 3 Wings Framing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Left Wing Box */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-rose-300 font-semibold text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>Left-Wing Framing</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {summary.left_perspective}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-rose-900/30 text-[11px] text-rose-400/80">
                Outlets: The Wire, Scroll, The Quint, Maktoob
              </div>
            </div>

            {/* Center Box */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Center / Factual Framing</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {summary.center_perspective}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-900/30 text-[11px] text-emerald-400/80">
                Outlets: The Hindu, Indian Express, PTI, Mint
              </div>
            </div>

            {/* Right Wing Box */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-amber-300 font-semibold text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Right-Wing Framing</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {summary.right_perspective}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-amber-900/30 text-[11px] text-amber-400/80">
                Outlets: OpIndia, Swarajya, Republic, Organiser
              </div>
            </div>
          </div>

          {/* Fact Consensus & Bias Divergence Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {/* Fact Consensus */}
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-zinc-200 mb-1">
                  Core Verified Facts (Cross-Outlet Consensus)
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {summary.fact_consensus}
                </p>
              </div>
            </div>

            {/* Bias Divergence */}
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5 shrink-0">
                <GitCompare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-zinc-200 mb-1">
                  Key Narrative Split & Framing Discrepancies
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {summary.bias_divergence}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
