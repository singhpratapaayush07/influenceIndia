import { getScoreColor, getScoreLabel } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RatingBadge({ score, showLabel = true, size = "md" }: RatingBadgeProps) {
  const colorClass = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        colorClass,
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-sm",
        size === "lg" && "px-3 py-1.5 text-base"
      )}
    >
      <Star className={cn("fill-current", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span>{score}</span>
      {showLabel && <span className="opacity-70">· {label}</span>}
    </div>
  );
}
