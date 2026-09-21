"use client";

import { useState } from "react";
import Link from "next/link";
import RiskPill from "@/components/ui/RiskPill";
import { cn } from "@/lib/utils";

interface BottomLineItem {
  title: string;
  tag?: string; // e.g. "risky" or "worth_reviewing"
  summary: string;
  clause_id?: string;
}

interface InconsistencyItem {
  explanation: string;
  clause_id_a: string;
  clause_id_b: string;
}

interface BottomLineCardProps {
  documentId: string;
  items: BottomLineItem[];
  inconsistencies?: InconsistencyItem[];
}

export default function BottomLineCard({ documentId, items, inconsistencies = [] }: BottomLineCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Combine inconsistencies and items as top findings
  const combined: (BottomLineItem & { isInconsistency?: boolean; clauseIds?: string[] })[] = [
    ...inconsistencies.map((inc) => ({
      title: "Dependency Conflict",
      tag: "risky",
      summary: inc.explanation,
      isInconsistency: true,
      clauseIds: [inc.clause_id_a, inc.clause_id_b],
    })),
    ...items,
  ];

  if (combined.length === 0) {
    return (
      <div className="bg-[#bceed3]/20 border border-[#bceed3] p-6 rounded-2xl flex flex-col items-center text-center gap-3">
        <span className="material-symbols-outlined text-[#25533f] text-[32px]">task_alt</span>
        <h3 className="text-headline-md text-[#25533f]">Looks Standard</h3>
        <p className="text-body-md text-[#414944] max-w-md">
          We didn't find any highly unusual or risky clauses in this document. 
          It appears to be standard boilerplate.
        </p>
      </div>
    );
  }

  const displayCount = expanded ? combined.length : Math.min(2, combined.length);
  const visibleItems = combined.slice(0, displayCount);

  return (
    <div className="bg-white border shadow-sm rounded-2xl overflow-hidden flex flex-col">
      <div className="bg-[#fbf2ed] p-5 md:px-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#8f4e00] text-[24px]">
            priority_high
          </span>
          <h3 className="text-headline-sm text-[#1e1b18]">The Bottom Line</h3>
        </div>
        <span className="px-3 py-1 bg-white rounded-full text-label-sm text-[#8f4e00] border shadow-sm">
          {combined.length} items to review
        </span>
      </div>

      <div className="p-0 flex flex-col">
        {visibleItems.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              "p-5 md:px-6 flex flex-col gap-3 transition-colors hover:bg-[#f5ece7]/30",
              idx !== visibleItems.length - 1 && "border-b border-[#e9e1dc]"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <h4 className="text-label-lg text-[#1e1b18]">{item.title}</h4>
              <RiskPill tag={item.tag} className="shrink-0" />
            </div>
            <p className="text-body-md text-[#414944]">{item.summary}</p>
            
            {item.clause_id && !item.isInconsistency && (
              <Link
                href={`/documents/${documentId}/clauses/${item.clause_id}`}
                className="text-label-md text-[#25533f] hover:underline flex items-center gap-1 mt-1 w-fit"
              >
                <span>Read the full clause</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            )}
            {item.isInconsistency && item.clauseIds && (
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <Link
                  href={`/documents/${documentId}/clauses/${item.clauseIds[0]}`}
                  className="text-label-md text-[#25533f] hover:underline flex items-center gap-1"
                >
                  <span>First Clause</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </Link>
                <span className="w-1 h-1 rounded-full bg-[#717973]" />
                <Link
                  href={`/documents/${documentId}/clauses/${item.clauseIds[1]}`}
                  className="text-label-md text-[#25533f] hover:underline flex items-center gap-1"
                >
                  <span>Second Clause</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {combined.length > 2 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-4 bg-[#fbf2ed] hover:bg-[#f5ece7] text-label-md text-[#1e1b18] flex items-center justify-center gap-2 transition-colors border-t border-[#e9e1dc]"
        >
          <span>{expanded ? "Show less" : `Show ${combined.length - 2} more items`}</span>
          <span className="material-symbols-outlined text-[20px]">
            {expanded ? "expand_less" : "expand_more"}
          </span>
        </button>
      )}
    </div>
  );
}
