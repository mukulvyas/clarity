"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getDocumentSummary, type DocumentSummary, type Clause } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function DocumentSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.id;

  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const [clauseFilter, setClauseFilter] = useState<"all" | "risky" | "worth_reviewing" | "standard">("all");
  const [isAudioListening, setIsAudioListening] = useState(false);

  useEffect(() => {
    async function loadSummary() {
      setLoading(true);
      try {
        const data = await getDocumentSummary(documentId);
        setSummary(data);
      } catch (err) {
        console.error("Failed to load document summary", err);
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, [documentId]);

  if (loading || !summary) {
    return (
      <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
        <Header />
        <main className="w-full pt-20 flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-space-sm p-space-xl">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary animate-spin">
              <span className="material-symbols-outlined text-[24px]">sync</span>
            </div>
            <p className="font-headline-sm text-headline-sm text-on-surface">Translating agreement...</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Converting legal fine print into plain English.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredClauses = summary.clauses.filter((clause) => {
    if (clauseFilter === "risky") return clause.risk_tag === "risky";
    if (clauseFilter === "worth_reviewing") return clause.risk_tag === "worth_reviewing";
    if (clauseFilter === "standard") return clause.risk_tag === "standard";
    return true;
  });

  const toggleListen = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isAudioListening) {
      window.speechSynthesis.cancel();
      setIsAudioListening(false);
    } else {
      const bottomLineText = summary.bottom_line.map((b) => `${b.title}: ${b.summary}`).join(". ");
      const utterance = new SpeechSynthesisUtterance(`Here is the 30-second bottom line for your document: ${bottomLineText}`);
      utterance.onend = () => setIsAudioListening(false);
      utterance.onerror = () => setIsAudioListening(false);
      window.speechSynthesis.speak(utterance);
      setIsAudioListening(true);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
      <Header />

      <main className="w-full pt-20 bg-background min-h-[calc(100vh-140px)] flex-grow">
        <div className="flex flex-col w-full">
          {/* ── Document Metadata Header Banner ───────────────────── */}
          <section className="w-full bg-surface-container-low py-space-lg border-b border-surface-container-high">
            <div className="max-w-7xl mx-auto px-gutter flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[14px]">verified_user</span>
                    Processed by Clarity AI
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {summary.property_name || "Verified Agreement"}
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight truncate">
                  {summary.filename}
                </h1>
                <p className="font-headline-sm italic text-body-md text-on-surface-variant mt-1.5 font-normal">
                  {summary.upload_info || `${summary.page_count || 1} pages • ${summary.property_name || 'Verified Document'} • Analyzed by Clarity AI`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
                  <span>Download Plain English PDF</span>
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">group_add</span>
                  <span>Share Analysis</span>
                </button>
                <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-full shadow-sm">
                  <button
                    onClick={toggleListen}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-colors",
                      isAudioListening
                        ? "bg-tertiary-fixed text-on-tertiary-fixed-variant animate-pulse"
                        : "bg-primary-fixed text-on-primary-fixed-variant hover:bg-primary-fixed-dim"
                    )}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isAudioListening ? "stop" : "volume_up"}
                    </span>
                    <span>{isAudioListening ? "Listening..." : "4 min listen"}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── "The 30-Second Bottom Line" Card Deck ────────────────── */}
          <section className="max-w-7xl mx-auto px-gutter py-space-lg w-full">
            <div className="relative bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-md overflow-hidden border border-surface-container">
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -top-16 w-64 h-64 bg-secondary-fixed/25 rounded-full blur-3xl pointer-events-none" />

              {/* Card Deck Header */}
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pb-space-md mb-space-md bg-surface-container-low/50 -mx-space-md -mt-space-md p-space-md sm:-mx-space-lg sm:-mt-space-lg sm:p-space-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
                    <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm tracking-wider uppercase text-primary font-semibold">
                      Instant Clarity Overview
                    </span>
                    <h2 className="font-headline-md text-headline-md text-on-surface">The 30-Second Bottom Line</h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    No Hidden Arbitration Lock-In
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
                    2 Items Need Negotiation
                  </span>
                </div>
              </div>

              {/* Top 2 Primary Bottom Line Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative mb-3">
                {summary.bottom_line.slice(0, 2).map((item, idx) => {
                  const isRisky = item.tag === "risky";
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-space-md rounded-xl flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200 border",
                        isRisky
                          ? "bg-tertiary-fixed/40 border-tertiary-container/20"
                          : "bg-secondary-fixed/30 border-secondary-container/20"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              isRisky ? "bg-tertiary-container text-on-tertiary-container" : "bg-secondary-container text-on-secondary-container"
                            )}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isRisky ? "warning" : "autorenew"}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full bg-surface-container-lowest font-label-sm text-label-sm font-semibold",
                              isRisky ? "text-tertiary" : "text-secondary"
                            )}
                          >
                            {isRisky ? "High Penalty" : "Action Required"}
                          </span>
                        </div>

                        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                          {item.title}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {item.summary}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 flex items-center gap-1.5 font-label-sm text-label-sm font-semibold">
                        <Link
                          href={`/documents/${documentId}/clauses/${item.clause_id}`}
                          className={cn(
                            "inline-flex items-center gap-1 hover:underline",
                            isRisky ? "text-tertiary" : "text-secondary"
                          )}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isRisky ? "flag" : "calendar_clock"}
                          </span>
                          <span>Review Full Clause Details</span>
                          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Extra Highlights (Expandable) */}
              {showAllHighlights && summary.bottom_line.length > 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative mb-3 animate-fade-in-up">
                  {summary.bottom_line.slice(2).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200 border border-surface-container"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant">
                            <span className="material-symbols-outlined text-[18px]">
                              {idx === 0 ? "payments" : "handyman"}
                            </span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest font-label-sm text-label-sm text-primary font-medium">
                            Clear Terms
                          </span>
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                          {item.title}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {item.summary}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 flex items-center gap-1.5 font-label-sm text-label-sm text-primary font-semibold">
                        <Link
                          href={`/documents/${documentId}/clauses/${item.clause_id}`}
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>Standard timeline details</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Toggle Highlights Button & AI Notice */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setShowAllHighlights(!showAllHighlights)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors"
                  type="button"
                >
                  <span>
                    {showAllHighlights ? "Show fewer highlights" : `Show all ${summary.bottom_line.length} highlights`}
                  </span>
                  <span className="material-symbols-outlined text-[18px]">
                    {showAllHighlights ? "expand_less" : "expand_more"}
                  </span>
                </button>

                <div className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  <span>AI-generated — not a substitute for legal advice.</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Plain-Language Translation & Clause Breakdown ────────── */}
          <section className="max-w-7xl mx-auto px-gutter pb-space-xl w-full">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-space-md">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Plain-Language Translation &amp; Clause Breakdown
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Structured clause-by-clause commentary calibrated against standard tenancy laws.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-container rounded-full">
                <button
                  onClick={() => setClauseFilter("all")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all",
                    clauseFilter === "all"
                      ? "bg-surface-container-lowest text-primary shadow-sm font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  All Clauses ({summary.clauses.length})
                </button>
                <button
                  onClick={() => setClauseFilter("risky")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all flex items-center gap-1",
                    clauseFilter === "risky"
                      ? "bg-surface-container-lowest text-tertiary shadow-sm font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  Risky ({summary.clauses.filter((c) => c.risk_tag === "risky").length})
                </button>
                <button
                  onClick={() => setClauseFilter("worth_reviewing")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all flex items-center gap-1",
                    clauseFilter === "worth_reviewing"
                      ? "bg-surface-container-lowest text-secondary shadow-sm font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-secondary-container" />
                  Worth Reviewing ({summary.clauses.filter((c) => c.risk_tag === "worth_reviewing").length})
                </button>
                <button
                  onClick={() => setClauseFilter("standard")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all flex items-center gap-1",
                    clauseFilter === "standard"
                      ? "bg-surface-container-lowest text-primary shadow-sm font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Standard ({summary.clauses.filter((c) => c.risk_tag === "standard").length})
                </button>
              </div>
            </div>

            {/* Clauses List */}
            <div className="space-y-4">
              {filteredClauses.map((clause, idx) => {
                const isRisky = clause.risk_tag === "risky";
                const isReview = clause.risk_tag === "worth_reviewing";

                return (
                  <article
                    key={clause.clause_id}
                    className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm transition-all hover:shadow-md border border-surface-container"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-space-sm">
                      <div className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm shrink-0 mt-0.5">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                            {clause.category || "General"} • {clause.section_ref}
                          </span>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface">
                            {clause.title}
                          </h3>
                        </div>
                      </div>

                      {/* Risk Badge */}
                      <span
                        className={cn(
                          "self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold shrink-0",
                          isRisky
                            ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                            : isReview
                            ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                            : "bg-primary-fixed text-on-primary-fixed-variant"
                        )}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isRisky ? "warning" : isReview ? "error_outline" : "check_circle"}
                        </span>
                        {isRisky ? "Needs Careful Review" : isReview ? "Pay Attention" : "Standard / Fair"}
                      </span>
                    </div>

                    <div className="pl-0 sm:pl-10 space-y-3">
                      {/* Plain-English Explanation */}
                      <div className="p-space-sm rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface leading-relaxed">
                        <p>
                          <strong className="font-semibold text-primary">What this means:</strong>{" "}
                          {clause.plain_explanation}
                        </p>
                      </div>

                      {/* Inset Parchment Well: Original Legalese Source */}
                      <div className="p-space-sm rounded-lg bg-surface-container font-body-sm text-body-sm text-on-surface-variant italic">
                        <div className="flex items-center justify-between text-on-surface-variant mb-1 not-italic font-label-sm text-label-sm font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">source</span>
                            <span>Original Contract Text ({clause.page_ref || "Page Reference"})</span>
                          </div>
                          <Link
                            href={`/documents/${documentId}/clauses/${clause.clause_id}`}
                            className="inline-flex items-center gap-1 text-primary hover:underline not-italic font-semibold"
                          >
                            <span>Inspect Deep Dive</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </Link>
                        </div>
                        “{clause.original_text}”
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
