"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export type WingType = "LEFT" | "CENTER" | "RIGHT" | "UNCLASSIFIED";

export interface ClassificationBadgeProps {
  domain?: string;
  publisherName?: string;
  currentWing: WingType | string;
  isAiSuggested?: boolean;
  onWingChange?: (domain: string, newWing: WingType) => void;
  className?: string;
}

export const WING_CONFIG: Record<
  WingType,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  LEFT: {
    label: "Left Wing",
    bg: "bg-rose-950/40",
    text: "text-rose-300",
    border: "border-rose-800/50",
    dot: "bg-rose-400",
  },
  CENTER: {
    label: "Center / Neutral",
    bg: "bg-emerald-950/40",
    text: "text-emerald-300",
    border: "border-emerald-800/50",
    dot: "bg-emerald-400",
  },
  RIGHT: {
    label: "Right Wing",
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    border: "border-amber-800/50",
    dot: "bg-amber-400",
  },
  UNCLASSIFIED: {
    label: "Unclassified",
    bg: "bg-zinc-900",
    text: "text-zinc-400",
    border: "border-zinc-700/60",
    dot: "bg-zinc-500",
  },
};

export default function ClassificationBadge({
  domain,
  publisherName,
  currentWing,
  isAiSuggested = false,
  className = "",
}: ClassificationBadgeProps) {
  const normalizedWing = (currentWing?.toUpperCase() || "UNCLASSIFIED") as WingType;
  const currentCfg = WING_CONFIG[normalizedWing] || WING_CONFIG.UNCLASSIFIED;

  const outletLabel = publisherName || domain;
  const titleText = isAiSuggested
    ? `AI Tone Suggestion${outletLabel ? ` for ${outletLabel}` : ""} (outlet not in hardcoded directory)`
    : `Editorial classification${outletLabel ? ` for ${outletLabel}` : ""}: ${currentCfg.label} (Developer hardcoded)`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border select-none ${currentCfg.bg} ${currentCfg.text} ${currentCfg.border} ${className}`}
      title={titleText}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${currentCfg.dot}`} />
      <span>{currentCfg.label}</span>
      {isAiSuggested && (
        <span title="AI Tone Suggestion">
          <Sparkles className="w-3 h-3 text-amber-400 ml-0.5" />
        </span>
      )}
    </div>
  );
}

export { ClassificationBadge, ClassificationBadge as ClassificationBadgeDropdown };
