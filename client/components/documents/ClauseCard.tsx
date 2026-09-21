import Link from "next/link";
import RiskPill from "@/components/ui/RiskPill";
import { cn } from "@/lib/utils";

export interface Clause {
  clause_id: string;
  section_ref: string | null;
  title: string | null;
  plain_explanation: string | null;
  original_text: string;
  page_ref: string | null;
  risk_tag: string | null;
  category?: string | null;
}

interface ClauseCardProps {
  documentId: string;
  clause: Clause;
}

export default function ClauseCard({ documentId, clause }: ClauseCardProps) {
  // If the clause is risky, we give it a slight accent border
  const isRisky = clause.risk_tag === "risky";
  
  return (
    <Link
      href={`/documents/${documentId}/clauses/${clause.clause_id}`}
      className={cn(
        "group flex flex-col gap-3 p-5 rounded-xl bg-white border transition-all duration-200 shadow-sm hover:shadow-md",
        isRisky ? "border-[#ffdad4]" : "border-transparent"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-label-md text-[#414944] uppercase tracking-wider">
              {clause.category || "General"}
            </span>
            {clause.section_ref && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#e9e1dc]" />
                <span className="text-label-sm text-[#717973]">
                  {clause.section_ref}
                </span>
              </>
            )}
          </div>
          <h3 className="text-headline-sm text-[#1e1b18] group-hover:text-[#25533f] transition-colors truncate">
            {clause.title || "Untitled Clause"}
          </h3>
        </div>
        <RiskPill tag={clause.risk_tag} className="shrink-0" />
      </div>

      <p className="text-body-md text-[#414944] line-clamp-3">
        {clause.plain_explanation || "No explanation provided."}
      </p>

      <div className="flex items-center gap-1.5 text-label-md text-[#25533f] mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
        <span>View Details</span>
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </div>
    </Link>
  );
}
