"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Bookmark, Database, History, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import HistoryModal from "./HistoryModal";

interface Props {
  onNewSearch?: () => void;
  onSelectHistoryQuery?: (query: string) => void;
}

export default function Navbar({ onNewSearch, onSelectHistoryQuery }: Props) {
  const { user, logout, guestLogin } = useAuth();
  const pathname = usePathname();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-500 p-0.5 shadow-md shadow-emerald-900/30">
                <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                  <span className="font-extrabold text-sm bg-gradient-to-tr from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                    SL
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  SatyaLens
                </span>
                <span className="text-[10px] font-medium text-zinc-400 -mt-1 hidden sm:inline">
                  Indian News Bias Aggregator
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === "/"
                    ? "bg-zinc-800/80 text-emerald-400 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                Aggregator
              </Link>
              <Link
                href="/bookmarks"
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  pathname === "/bookmarks"
                    ? "bg-zinc-800/80 text-emerald-400 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved Articles</span>
              </Link>
              <Link
                href="/classifications"
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  pathname === "/classifications"
                    ? "bg-zinc-800/80 text-emerald-400 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Publisher Directory</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Prominent '+' New Search Button */}
            {onNewSearch && (
              <button
                type="button"
                onClick={onNewSearch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-medium text-zinc-200 hover:text-white transition-all shadow-sm"
                title="Start a fresh search (ChatGPT style)"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">New Search</span>
              </button>
            )}

            {/* History Toggle */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
              title="View Search History"
            >
              <History className="w-4 h-4" />
            </button>

            {/* User Auth Info / Buttons */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <span className="text-xs text-zinc-400 max-w-[120px] truncate hidden sm:inline" title={user.email}>
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={guestLogin}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold transition-colors shadow-sm"
                >
                  Demo Login
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectQuery={(q) => {
          if (onSelectHistoryQuery) onSelectHistoryQuery(q);
        }}
      />
    </>
  );
}
