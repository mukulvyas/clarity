"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getClauseDetail, type ClauseDetail } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ClauseDetailPage({
  params,
}: {
  params: Promise<{ id: string; clauseId: string }>;
}) {
  const resolvedParams = use(params);
  const { id: documentId, clauseId } = resolvedParams;

  const [clause, setClause] = useState<ClauseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    async function loadClause() {
      setLoading(true);
      try {
        const data = await getClauseDetail(documentId, clauseId);
        setClause(data);
      } catch (err) {
        console.error("Failed to load clause detail", err);
      } finally {
        setLoading(false);
      }
    }
    loadClause();
  }, [documentId, clauseId]);

  if (loading || !clause) {
    return (
      <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
        <Header />
        <main className="w-full pt-20 flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-space-sm p-space-xl">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary animate-spin">
              <span className="material-symbols-outlined text-[24px]">sync</span>
            </div>
            <p className="font-headline-sm text-headline-sm text-on-surface">Inspecting clause details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isRisky = clause.risk_tag === "risky";
  const isReview = clause.risk_tag === "worth_reviewing";

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleVoiceover = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const speechText = `${clause.title}. ${clause.plain_explanation}. Real life scenario: ${clause.real_life_scenario || ""}`;
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const fairnessScore = clause.fairness_score ?? (isRisky ? 25 : isReview ? 55 : 85);

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
      <Header />

      <main className="w-full pt-20 bg-background min-h-[calc(100vh-140px)] flex-grow">
        <div className="flex flex-col w-full">
          <div className="relative w-full max-w-7xl mx-auto px-gutter py-space-md lg:py-space-lg">
            {/* ── Top Meta Strip ────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
              <div className="flex items-center gap-space-sm">
                <Link
                  href={`/documents/${documentId}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-md transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Back to all clauses</span>
                </Link>
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {clause.category || "Contract Clause"} • {clause.section_ref || "Verified Document"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                  <span>Analysis updated 12 mins ago</span>
                </div>
                <button
                  className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
                  title="Bookmark clause"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">bookmark</span>
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
                  title="Share analysis"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                </button>
              </div>
            </div>

            {/* ── Main Inspector Grid: Left Scroller / Right Inspector ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* LEFT PANE: Ambient Dimmed Document Preview Scroller */}
              <aside className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col gap-space-md sticky top-24">
                <div className="p-space-md rounded-2xl bg-surface-container-low shadow-sm flex flex-col gap-space-sm border border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                      Document Stream Preview
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                      {clause.page_ref || "Page 9 of 18"}
                    </span>
                  </div>

                  {/* Document Scroller Replica */}
                  <div className="relative p-space-md rounded-xl bg-surface-container-lowest shadow-[0_2px_12px_rgba(44,40,37,0.03)] overflow-hidden select-none border border-surface-container">
                    {/* Passive Preceding Clause (Blurred/Dimmed) */}
                    <div className="opacity-40 filter blur-[0.3px] mb-space-md">
                      <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold mb-1">
                        18.1 TERM &amp; SURRENDER
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                        Tenant shall peaceably surrender possession of the Leased Premises to Landlord upon termination or expiration of this Agreement...
                      </p>
                    </div>

                    {/* Active Target Clause Highlight Card */}
                    <div
                      className={cn(
                        "relative p-3.5 rounded-xl transition-all border",
                        isRisky
                          ? "bg-tertiary-fixed/40 border-tertiary-container/30"
                          : isReview
                          ? "bg-secondary-fixed/40 border-secondary-container/30"
                          : "bg-primary-fixed/40 border-primary-container/30"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute -left-2 top-3 w-1.5 h-8 rounded-full",
                          isRisky ? "bg-tertiary" : isReview ? "bg-secondary" : "bg-primary"
                        )}
                      />
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={cn(
                            "font-label-sm text-label-sm font-bold",
                            isRisky ? "text-tertiary" : isReview ? "text-secondary" : "text-primary"
                          )}
                        >
                          {clause.section_ref || "TARGET CLAUSE"}
                        </span>
                        <span className="flex items-center gap-1 font-label-sm text-[11px] text-tertiary font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
                          Selected
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface leading-snug line-clamp-4">
                        {clause.original_text}
                      </p>
                    </div>

                    {/* Passive Subsequent Clause (Blurred/Dimmed) */}
                    <div className="opacity-40 filter blur-[0.3px] mt-space-md">
                      <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold mb-1">
                        18.3 RE-ENTRY RIGHTS
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                        Landlord retains absolute discretion to change locks and repossess premises upon 24-hour posted notice under constructive default...
                      </p>
                    </div>
                  </div>

                  {/* Footnote */}
                  <div className="p-3 rounded-xl bg-surface-container flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Clarity detected <strong className="text-on-surface font-semibold">3 potential pressure points</strong> in this section. This clause carries significant impact.
                    </p>
                  </div>
                </div>

                {/* Model Badge */}
                <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center gap-2.5 text-on-surface-variant border border-surface-container">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-on-surface font-semibold truncate">Clarity AI</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Tenant Rights Model</span>
                  </div>
                </div>
              </aside>

              {/* RIGHT PANE: Center-Stage Inspector */}
              <main className="lg:col-span-7 xl:col-span-8 flex flex-col gap-space-md">
                {/* Hero Banner */}
                <div className="p-space-md lg:p-space-lg rounded-3xl bg-surface-container-lowest shadow-md flex flex-col gap-space-sm relative overflow-hidden border border-surface-container">
                  <div className="flex flex-wrap items-center justify-between gap-space-sm">
                    <span className="px-3 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                      {clause.page_ref || "Page 9"} • {clause.section_ref}
                    </span>

                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full shadow-sm font-label-sm text-label-sm font-semibold",
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
                      <span>{isRisky ? "Needs Careful Review (High Risk)" : isReview ? "Pay Attention" : "Standard Term"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm mt-1">
                    <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                      {clause.title}
                    </h1>

                    <button
                      onClick={toggleVoiceover}
                      className={cn(
                        "self-start lg:self-center inline-flex items-center gap-2 px-4 py-2 rounded-full font-label-md text-label-md transition-all shadow-sm",
                        isSpeaking
                          ? "bg-tertiary-fixed text-on-tertiary-fixed-variant animate-pulse"
                          : "bg-primary-fixed text-on-primary-fixed-variant hover:bg-primary-fixed-dim"
                      )}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px] text-primary">
                        {isSpeaking ? "stop" : "graphic_eq"}
                      </span>
                      <span>{isSpeaking ? "Pause" : "Listen to human breakdown"}</span>
                    </button>
                  </div>

                  <p className="font-headline-sm italic text-body-lg text-on-surface-variant max-w-2xl leading-relaxed font-normal">
                    This clause decides what happens if life circumstances change during your contract. As written, it sets exact terms you should review.
                  </p>
                </div>

                {/* Card 1: Original Contract Wording (Sunken Parchment Well) */}
                <div className="p-space-md rounded-2xl bg-surface-container shadow-inner flex flex-col gap-space-xs border border-surface-container-high">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                      Original Contract Wording (Exact Legalese)
                    </span>
                    <button
                      onClick={() => handleCopyText(clause.original_text, 0)}
                      className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {copiedIndex === 0 ? "check" : "content_copy"}
                      </span>
                      <span>{copiedIndex === 0 ? "Copied!" : "Copy clause text"}</span>
                    </button>
                  </div>
                  <blockquote className="font-body-md text-body-md text-on-surface italic leading-relaxed pt-1">
                    “{clause.original_text}”
                  </blockquote>
                </div>

                {/* Card 2: Plain-Language Translation */}
                <div className="p-space-md lg:p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm border border-surface-container">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-[22px]">translate</span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Plain-Language Translation</h2>
                  </div>
                  <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                    {clause.plain_explanation}
                  </p>
                </div>

                {/* Card 3: Real-Life Scenario Card */}
                {clause.real_life_scenario && (
                  <div className="p-space-md rounded-2xl bg-surface-container-low shadow-sm flex flex-col gap-space-xs border border-surface-container">
                    <div className="flex items-center gap-2 text-secondary">
                      <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                        What this means in real life
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      {clause.real_life_scenario}
                    </p>
                  </div>
                )}

                {/* Card 4: Fairness Check Spectrum Bar */}
                <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm border border-surface-container">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[22px]">balance</span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">Fairness Check</h3>
                    </div>
                    <span
                      className={cn(
                        "font-label-md text-label-md font-bold px-3 py-1 rounded-full",
                        fairnessScore < 40
                          ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                          : fairnessScore < 70
                          ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                          : "bg-primary-fixed text-on-primary-fixed-variant"
                      )}
                    >
                      {fairnessScore} / 100 Fairness Rating
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                      <span>Overly One-Sided</span>
                      <span>Balanced Standard</span>
                      <span>Tenant-Friendly</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-surface-container-highest overflow-hidden relative">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700 ease-out",
                          fairnessScore < 40 ? "bg-tertiary" : fairnessScore < 70 ? "bg-secondary" : "bg-primary"
                        )}
                        style={{ width: `${fairnessScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card 5: Ready-To-Use Negotiation Scripts */}
                {clause.negotiation_questions && clause.negotiation_questions.length > 0 && (
                  <div className="p-space-md lg:p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md border border-surface-container">
                    <div className="flex items-center gap-2 text-primary">
                      <span className="material-symbols-outlined text-[22px]">chat_bubble_outline</span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">
                        Ready-to-Use Negotiation Questions
                      </h3>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Copy these respectful, customary questions to email your landlord or property manager:
                    </p>

                    <div className="space-y-3">
                      {clause.negotiation_questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-surface-container"
                        >
                          <p className="font-body-md text-body-md text-on-surface">“{q}”</p>
                          <button
                            onClick={() => handleCopyText(q, idx + 10)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-label-sm shadow-sm transition-colors shrink-0 self-end sm:self-center"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              {copiedIndex === idx + 10 ? "check" : "content_copy"}
                            </span>
                            <span>{copiedIndex === idx + 10 ? "Copied" : "Copy question"}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
