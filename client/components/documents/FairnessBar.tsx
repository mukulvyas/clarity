import { cn } from "@/lib/utils";

interface FairnessBarProps {
  score: number | null | undefined;
}

export default function FairnessBar({ score }: FairnessBarProps) {
  if (score === null || score === undefined) return null;

  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));

  // Determine marker color
  let markerColor = "bg-[#25533f]"; // Green for fair
  if (clampedScore < 33) markerColor = "bg-[#852b1f]"; // Red for risky
  else if (clampedScore < 67) markerColor = "bg-[#8f4e00]"; // Orange for worth reviewing

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between text-label-sm text-[#414944]">
        <span>One-sided</span>
        <span>Fair</span>
      </div>
      <div className="relative w-full h-2 rounded-full overflow-hidden flex">
        <div className="h-full bg-[#ffdad4]" style={{ width: "33%" }} />
        <div className="h-full bg-[#ffdcc2]" style={{ width: "34%" }} />
        <div className="h-full bg-[#bceed3]" style={{ width: "33%" }} />
        
        {/* Indicator */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all duration-500",
            markerColor
          )}
          style={{ left: `calc(${clampedScore}% - 6px)` }}
        />
      </div>
    </div>
  );
}
