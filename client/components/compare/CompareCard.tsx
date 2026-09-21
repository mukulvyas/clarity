import { cn } from "@/lib/utils";

interface ClauseDiff {
  section_ref?: string;
  title?: string;
  classification: "better_for_you" | "worse_for_you" | "neutral";
  explanation: string;
}

interface CompareSummary {
  verdict: string;
  confidence: number;
  favorable_changes: number;
  unresolved_cautions: number;
  new_risks: number;
  clause_diffs: ClauseDiff[];
}

interface CompareCardProps {
  summary: CompareSummary;
}

export default function CompareCard({ summary }: CompareCardProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Executive Summary */}
      <div className="bg-white border shadow-sm rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-[#f5ece7] p-5 md:px-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#1e1b18]">
            <span className="material-symbols-outlined text-[24px] text-[#25533f]">
              thumbs_up_down
            </span>
            <h3 className="text-headline-sm">Executive Summary</h3>
          </div>
          <span className="px-3 py-1 bg-white rounded-full text-label-sm text-[#25533f] border shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            {summary.confidence}% AI Confidence
          </span>
        </div>
        <div className="p-5 md:px-6 flex flex-col gap-6">
          <p className="text-headline-md text-[#1e1b18]">{summary.verdict}</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[120px] bg-[#bceed3]/30 border border-[#bceed3] rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-headline-lg text-[#25533f]">
                {summary.favorable_changes}
              </span>
              <span className="text-label-sm text-[#25533f]">Favorable Changes</span>
            </div>
            <div className="flex-1 min-w-[120px] bg-[#ffdcc2]/30 border border-[#ffdcc2] rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-headline-lg text-[#8f4e00]">
                {summary.unresolved_cautions}
              </span>
              <span className="text-label-sm text-[#8f4e00]">Unresolved Cautions</span>
            </div>
            <div className="flex-1 min-w-[120px] bg-[#ffdad4]/30 border border-[#ffdad4] rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-headline-lg text-[#852b1f]">
                {summary.new_risks}
              </span>
              <span className="text-label-sm text-[#852b1f]">New Risks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clause Diffs */}
      <div className="flex flex-col gap-4">
        <h3 className="text-headline-sm text-[#1e1b18]">Key Differences</h3>
        <div className="flex flex-col gap-4">
          {summary.clause_diffs.map((diff, idx) => {
            const isBetter = diff.classification === "better_for_you";
            const isWorse = diff.classification === "worse_for_you";

            return (
              <div
                key={idx}
                className={cn(
                  "bg-white border rounded-2xl p-5 md:px-6 shadow-sm flex flex-col gap-3",
                  isBetter && "border-[#bceed3] shadow-[#bceed3]/20",
                  isWorse && "border-[#ffdad4] shadow-[#ffdad4]/20"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-label-sm text-[#717973] uppercase tracking-wider">
                      {diff.section_ref || "General"}
                    </span>
                    <h4 className="text-headline-sm text-[#1e1b18]">
                      {diff.title || "Untitled Clause"}
                    </h4>
                  </div>
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-label-sm flex items-center gap-1.5 whitespace-nowrap",
                      isBetter && "bg-[#bceed3] text-[#25533f]",
                      isWorse && "bg-[#ffdad4] text-[#852b1f]",
                      !isBetter && !isWorse && "bg-[#f5ece7] text-[#414944]"
                    )}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isBetter ? "trending_up" : isWorse ? "trending_down" : "horizontal_rule"}
                    </span>
                    {isBetter ? "Better for you" : isWorse ? "Worse for you" : "Neutral"}
                  </div>
                </div>
                <p className="text-body-md text-[#414944]">{diff.explanation}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
