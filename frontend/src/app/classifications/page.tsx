"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ClassificationBadge from "@/components/ClassificationBadge";
import { api, DomainClassification } from "@/lib/api";
import { Database, Search, ArrowLeft, Loader2, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ClassificationsPage() {
  const [classifications, setClassifications] = useState<DomainClassification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterWing, setFilterWing] = useState<string>("ALL");

  useEffect(() => {
    loadClassifications();
  }, []);

  const loadClassifications = async () => {
    setIsLoading(true);
    try {
      const data = await api.getClassifications();
      setClassifications(data);
    } catch (err) {
      console.error("Failed to load classifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = classifications.filter((item) => {
    const matchesWing = filterWing === "ALL" || item.wing === filterWing;
    const matchesQuery =
      item.domain.toLowerCase().includes(search.toLowerCase()) ||
      item.publisher_name.toLowerCase().includes(search.toLowerCase());
    return matchesWing && matchesQuery;
  });

  const countByWing = {
    LEFT: classifications.filter((c) => c.wing === "LEFT").length,
    CENTER: classifications.filter((c) => c.wing === "CENTER").length,
    RIGHT: classifications.filter((c) => c.wing === "RIGHT").length,
    UNCLASSIFIED: classifications.filter((c) => c.wing === "UNCLASSIFIED").length,
  };

  return (
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
              <Database className="w-5 h-5 text-emerald-400" />
              <span>Indian Publisher Bias Directory</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Curated editorial bias registry for Indian publications ({classifications.length} verified outlets)
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium self-start sm:self-auto shadow-sm">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hardcoded by Developer</span>
          </div>
        </div>

        {/* Informational Read-Only Banner */}
        <div className="mb-6 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-start gap-3 text-xs text-zinc-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-zinc-200">Tamper-Proof Publisher Registry:</span> The
            Left, Center/Neutral, and Right Wing classifications in this directory are permanently
            hardcoded by the developer to ensure journalistic integrity and neutrality. They cannot be
            edited or altered by users.
          </div>
        </div>

        {/* Wing Counters Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setFilterWing(filterWing === "LEFT" ? "ALL" : "LEFT")}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterWing === "LEFT"
                ? "bg-rose-950/40 border-rose-700 shadow-sm shadow-rose-950/50"
                : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Left Wing</span>
            </div>
            <div className="text-xl font-bold text-zinc-100">{countByWing.LEFT}</div>
            <div className="text-[10px] text-zinc-400 truncate">The Wire, Scroll, Quint, Maktoob</div>
          </button>

          <button
            type="button"
            onClick={() => setFilterWing(filterWing === "CENTER" ? "ALL" : "CENTER")}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterWing === "CENTER"
                ? "bg-emerald-950/40 border-emerald-700 shadow-sm shadow-emerald-950/50"
                : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Center / Neutral</span>
            </div>
            <div className="text-xl font-bold text-zinc-100">{countByWing.CENTER}</div>
            <div className="text-[10px] text-zinc-400 truncate">Hindu, Express, TOI, Mint, PTI</div>
          </button>

          <button
            type="button"
            onClick={() => setFilterWing(filterWing === "RIGHT" ? "ALL" : "RIGHT")}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterWing === "RIGHT"
                ? "bg-amber-950/40 border-amber-700 shadow-sm shadow-amber-950/50"
                : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Right Wing</span>
            </div>
            <div className="text-xl font-bold text-zinc-100">{countByWing.RIGHT}</div>
            <div className="text-[10px] text-zinc-400 truncate">OpIndia, Swarajya, Republic, Organiser</div>
          </button>

          <button
            type="button"
            onClick={() => setFilterWing(filterWing === "UNCLASSIFIED" ? "ALL" : "UNCLASSIFIED")}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterWing === "UNCLASSIFIED"
                ? "bg-zinc-800 border-zinc-600"
                : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-zinc-500" />
              <span>Unclassified</span>
            </div>
            <div className="text-xl font-bold text-zinc-100">{countByWing.UNCLASSIFIED}</div>
            <div className="text-[10px] text-zinc-400 truncate">Regional & Niche Publishers</div>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by publication or domain..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="text-xs text-zinc-400 self-start sm:self-auto">
            Showing <span className="text-zinc-200 font-semibold">{filteredItems.length}</span> of {classifications.length} outlets
          </div>
        </div>

        {/* Table / Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
            <p className="text-xs">Loading publisher database...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl p-6 text-zinc-500 text-xs">
            No Indian publications found matching &ldquo;{search}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <h4 className="text-xs font-semibold text-zinc-200 truncate" title={item.publisher_name}>
                    {item.publisher_name}
                  </h4>
                  <p className="text-[11px] font-mono text-zinc-400 truncate" title={item.domain}>
                    {item.domain}
                  </p>
                </div>

                <div className="shrink-0">
                  <ClassificationBadge
                    domain={item.domain}
                    publisherName={item.publisher_name}
                    currentWing={item.wing}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
