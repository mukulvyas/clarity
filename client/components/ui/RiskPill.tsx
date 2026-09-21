import { cn, riskTagColor, riskTagLabel } from "@/lib/utils";

interface RiskPillProps {
  tag?: string | null;
  className?: string;
}

export default function RiskPill({ tag, className }: RiskPillProps) {
  const colors = riskTagColor(tag);
  const label = riskTagLabel(tag);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit",
        colors.bg,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
      <span className={cn("text-label-sm", colors.text)}>{label}</span>
    </div>
  );
}
