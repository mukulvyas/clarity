"use client";

import { useState, useEffect, use } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getActionPlan, updateActionItem, getDocumentSummary, type ActionPlan, type ActionItem, type DocumentSummary } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function DocumentActionPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.id;

  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [planData, summaryData] = await Promise.all([
          getActionPlan(documentId),
          getDocumentSummary(documentId),
        ]);
        setPlan(planData);
        setSummary(summaryData);
      } catch (err) {
        console.error("Failed to load action plan data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [documentId]);

  const toggleItemCompletion = async (item: ActionItem) => {
    if (!plan) return;
    const newStatus: ActionItem["status"] = item.status === "completed" ? "pending" : "completed";

    // Optimistic UI update
    const updatedChecklist = plan.checklist.map((i) =>
      i.id === item.id ? { ...i, status: newStatus } : i
    );
    const completedCount = updatedChecklist.filter((i) => i.status === "completed").length;

    setPlan({
      ...plan,
      progress: { completed: completedCount, total: updatedChecklist.length },
      checklist: updatedChecklist,
    });

    try {
      await updateActionItem(documentId, item.id, newStatus);
    } catch (err) {
      console.error("Failed to update item status", err);
    }
  };

  const handleCopyScript = (script: string, id: string) => {
    navigator.clipboard?.writeText(script);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading || !plan) {
    return (
      <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
        <Header />
        <main className="w-full pt-20 flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-space-sm p-space-xl">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary animate-spin">
              <span className="material-symbols-outlined text-[24px]">sync</span>
            </div>
            <p className="font-headline-sm text-headline-sm text-on-surface">Generating personalized action plan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const completedCount = plan.checklist.filter((i) => i.status === "completed").length;
  const totalCount = plan.checklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
      <Header />

      <main className="w-full pt-20 bg-background min-h-[calc(100vh-140px)] flex-grow">
        <div className="w-full max-w-7xl mx-auto px-gutter py-space-lg space-y-space-xl">
          {/* ── Overview Hero Deck ────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-md sm:p-space-lg shadow-sm border border-surface-container">
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-secondary-fixed/25 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              <div className="max-w-2xl space-y-space-xs">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-semibold">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Document Scan • {summary?.filename || "Verified Document"}</span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                  Your Personalized Action Plan
                </h1>
                <p className="font-headline-sm text-headline-sm text-on-surface-variant font-medium italic">
                  Based on our analysis of your contract. Here is what to do before putting your signature down.
                </p>
              </div>

              {/* Action Quick Bar */}
              <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all shadow-sm font-label-md text-label-md border border-surface-container"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">print</span>
                  <span>Print Checklist</span>
                </button>
                <button
                  onClick={() => alert("Checklist emailed to your account inbox!")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all shadow-sm font-label-md text-label-md border border-surface-container"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">mail</span>
                  <span>Email to Myself</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm font-label-md text-label-md"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* Live Reassuring Progress Bar */}
            <div className="mt-space-md pt-space-md bg-surface-container-lowest/80 rounded-lg p-4 backdrop-blur-sm border border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    {completedCount} of {totalCount} recommended steps completed
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                  <span className="font-label-sm text-label-sm text-primary font-semibold">Ready to review</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant hidden sm:inline-block" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant/80 bg-surface-container px-2 py-0.5 rounded-full hidden sm:inline-block">
                    AI-generated — not a substitute for legal advice
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                  {progressPercent}% ready
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Guidance & Takeaway Cards Grid ──────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-stretch">
            <div className="md:col-span-8 rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between border border-surface-container">
              <div className="space-y-space-xs">
                <span className="font-label-sm text-label-sm text-secondary tracking-wide uppercase font-semibold">
                  Clarity Guidance
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Calm, clear steps lead to safer agreements
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Contracts and agreements are often standard templates drafted to favor the issuing party. Asking for small, balanced adjustments is expected, customary, and protects your peace of mind.
                </p>
              </div>
              <div className="mt-space-sm pt-space-sm flex flex-wrap items-center gap-4 text-on-surface-variant font-label-sm text-label-sm border-t border-surface-container">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <span>No binding changes made yet</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">shield</span>
                  <span>Zero impact on credit score</span>
                </div>
              </div>
            </div>

            {(() => {
              const priorityItem = plan.checklist.find((i) => i.status === "pay_attention") || plan.checklist[0];
              return (
                <div className="md:col-span-4 rounded-xl bg-secondary-fixed/40 p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden border border-secondary-container/30">
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary mb-3 shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">flag</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-secondary-fixed">Key Clause Highlight</h3>
                    <p className="font-body-sm text-body-sm text-on-secondary-fixed-variant leading-relaxed">
                      {priorityItem?.description || priorityItem?.title || "Review priority negotiation items before signing."}
                    </p>
                  </div>
                  <div className="pt-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-surface-container-lowest font-label-sm text-label-sm text-secondary shadow-sm font-semibold">
                      Priority negotiation item
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ── Stage 01: Pre-Signing Interactive Checklist ────────── */}
          <div className="space-y-space-md">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="font-label-sm text-label-sm text-primary tracking-wide uppercase font-semibold">Stage 01</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Things You Should Do Before Signing</h2>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Click any checkbox as you complete your review items.
              </p>
            </div>

            <div className="space-y-4">
              {plan.checklist.map((item) => {
                const isCompleted = item.status === "completed";
                const isPayAttention = item.status === "pay_attention";
                const isClarify = item.status === "clarification";

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm transition-all border",
                      isCompleted ? "opacity-75 bg-surface-container-low border-surface-container" : "border-surface-container hover:shadow-md"
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleItemCompletion(item)}
                        className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center transition-all shrink-0 mt-1 cursor-pointer",
                          isCompleted
                            ? "bg-primary text-on-primary"
                            : "border-2 border-outline hover:border-primary bg-surface-container-lowest"
                        )}
                        type="button"
                        aria-label={`Toggle item ${item.title}`}
                      >
                        {isCompleted && (
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        )}
                      </button>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3
                            className={cn(
                              "font-headline-sm text-headline-sm text-on-surface",
                              isCompleted && "line-through text-on-surface-variant"
                            )}
                          >
                            {item.title}
                          </h3>

                          {/* Status Pill */}
                          <span
                            className={cn(
                              "self-start sm:self-auto inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold shrink-0",
                              isCompleted
                                ? "bg-primary-fixed text-on-primary-fixed-variant"
                                : isPayAttention
                                ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                                : isClarify
                                ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                                : "bg-surface-container text-on-surface-variant"
                            )}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {isCompleted ? "task_alt" : isPayAttention ? "warning" : "info"}
                            </span>
                            {isCompleted ? "Completed" : isPayAttention ? "Pay Attention" : isClarify ? "Clarification" : "Looks Standard"}
                          </span>
                        </div>

                        {item.description && (
                          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {/* Ready-to-Send Email Script Box */}
                        {item.suggested_script && !isCompleted && (
                          <div className="mt-3 p-3.5 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-label-sm text-label-sm text-primary font-semibold uppercase tracking-wider">
                                Ready-to-Send Email Script
                              </span>
                              <button
                                onClick={() => handleCopyScript(item.suggested_script!, item.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-label-sm shadow-sm transition-colors"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[15px]">
                                  {copiedId === item.id ? "check" : "content_copy"}
                                </span>
                                <span>{copiedId === item.id ? "Copied!" : "Copy email text"}</span>
                              </button>
                            </div>
                            <pre className="font-body-sm text-body-sm text-on-surface whitespace-pre-wrap font-sans leading-relaxed">
                              {item.suggested_script}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Stage 02: Legal Aid Resources & Questions for Landlord ──── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-md">
            {/* Questions for Landlord */}
            <div className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm border border-surface-container space-y-space-sm">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-[22px]">question_answer</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Questions for Landlord</h3>
              </div>
              <ul className="space-y-2.5 font-body-sm text-body-sm text-on-surface-variant">
                {plan.questions_for_landlord.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-container-low">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0">help_outline</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Aid Resources */}
            <div className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm border border-surface-container space-y-space-sm">
              <div className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-[22px]">gavel</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Legal Aid &amp; Local Resources</h3>
              </div>
              <div className="space-y-2.5">
                {plan.resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-[20px]">description</span>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface font-semibold group-hover:text-primary transition-colors">
                          {res.name}
                        </p>
                        <p className="font-body-sm text-[12px] text-on-surface-variant capitalize">
                          {res.type.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-1 transition-transform">
                      open_in_new
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
