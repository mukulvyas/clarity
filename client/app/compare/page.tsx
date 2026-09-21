"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { compareDocuments, type CompareResponse } from "@/lib/api";
import { MOCK_DOCUMENT_ID } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function ComparePage() {
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "side">("cards");
  const [docA, setDocA] = useState(MOCK_DOCUMENT_ID);
  const [docB, setDocB] = useState("revised-lease-v2");

  useEffect(() => {
    async function loadComparison() {
      setLoading(true);
      try {
        const data = await compareDocuments(docA, docB);
        setCompareData(data);
      } catch (err) {
        console.error("Failed to compare documents", err);
      } finally {
        setLoading(false);
      }
    }
    loadComparison();
  }, [docA, docB]);

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
      <Header />

      <main className="w-full pt-20 bg-background min-h-[calc(100vh-140px)] flex-grow">
        <div className="flex flex-col w-full">
          <section className="relative w-full max-w-7xl mx-auto px-gutter pt-8 pb-16">
            {/* ── Top Hero ────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm mb-3 font-semibold">
                  <span className="material-symbols-outlined text-[16px]">balance</span>
                  <span>Version Analysis &amp; Impact Engine</span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mb-2">
                  Compare Two Documents
                </h1>
                <p className="font-headline-md text-headline-sm md:text-headline-md font-serif italic text-on-surface-variant font-normal">
                  See exactly what changed, what was added or removed, and whether it's better or worse for you.
                </p>
              </div>

              {/* View Switcher Controls */}
              <div className="flex items-center gap-space-xs self-start lg:self-auto bg-surface-container p-1 rounded-full">
                <button
                  onClick={() => setViewMode("cards")}
                  className={cn(
                    "px-4 py-2 rounded-full font-label-md text-label-md transition-all flex items-center gap-1.5",
                    viewMode === "cards"
                      ? "bg-surface-container-lowest text-primary shadow-sm font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">splitscreen</span>
                  <span>Smart Cards</span>
                </button>
                <button
                  onClick={() => setViewMode("side")}
                  className={cn(
                    "px-4 py-2 rounded-full font-label-md text-label-md transition-all flex items-center gap-1.5",
                    viewMode === "side"
                      ? "bg-surface-container-lowest text-primary shadow-sm font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">sync_alt</span>
                  <span>Synchronized View</span>
                </button>
              </div>
            </div>

            {loading || !compareData ? (
              <div className="p-space-xl flex flex-col items-center justify-center gap-space-sm text-center">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary animate-spin">
                  <span className="material-symbols-outlined text-[24px]">sync</span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface">Analyzing contract diffs...</p>
              </div>
            ) : (
              <>
                {/* ── Impact Verdict Ribbon ─────────────────────────── */}
                <div className="mb-8 p-4 md:p-5 rounded-xl bg-primary-fixed/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-primary-fixed">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">verified</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-headline-sm text-headline-sm text-primary">
                          {compareData.verdict}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
                          Overall Win
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        {compareData.favorable_changes} substantial concessions achieved in lease language, with only {compareData.unresolved_cautions} unchanged caution item left.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wider uppercase">
                      Confidence {compareData.confidence}%
                    </span>
                  </div>
                </div>

                {/* ── Document Header Cards (Side-by-Side) ─────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md mb-10">
                  {/* Doc A */}
                  <div className="relative bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-[26px]">draft</span>
                        </div>
                        <div>
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                            Base Reference (Doc A)
                          </span>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">
                            {compareData.doc_a_name || "Initial Lease Agreement"}
                          </h3>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                        Oct 1, 2025
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-on-surface-variant font-body-sm text-body-sm pt-2 border-t border-surface-container">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">menu_book</span>
                        <span>14 pages</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-surface-variant" />
                      <div className="flex items-center gap-1.5 text-secondary font-semibold">
                        <span className="material-symbols-outlined text-[18px]">flag</span>
                        <span>4 flagged clauses</span>
                      </div>
                    </div>
                  </div>

                  {/* Doc B */}
                  <div className="relative bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-fixed/50 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[26px]">contract_edit</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                              Updated Counter (Doc B)
                            </span>
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">
                            {compareData.doc_b_name || "Revised Lease with Addendum"}
                          </h3>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
                        Oct 14, 2025
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-on-surface-variant font-body-sm text-body-sm pt-2 border-t border-surface-container">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">menu_book</span>
                        <span>15 pages (+1 addendum)</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-surface-variant" />
                      <div className="flex items-center gap-1.5 text-primary font-semibold">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>2 flagged clauses (-50%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Diff Cards List ─────────────────────────────── */}
                <div className="space-y-space-md">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      Clause-by-Clause Impact Diffs
                    </h2>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Showing {compareData.clause_diffs.length} key modifications
                    </span>
                  </div>

                  <div className="space-y-4">
                    {compareData.clause_diffs.map((diff, idx) => {
                      const isBetter = diff.classification === "better_for_you";
                      const isWorse = diff.classification === "worse_for_you";

                      return (
                        <div
                          key={idx}
                          className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm border border-surface-container space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant font-medium">
                                {diff.section_ref}
                              </span>
                              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                                {diff.title}
                              </h3>
                            </div>

                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold self-start sm:self-auto",
                                isBetter
                                  ? "bg-primary-fixed text-on-primary-fixed-variant"
                                  : isWorse
                                  ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                                  : "bg-surface-container text-on-surface-variant"
                              )}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isBetter ? "thumb_up" : isWorse ? "thumb_down" : "horizontal_rule"}
                              </span>
                              {isBetter ? "Better for you" : isWorse ? "Worse for you" : "Same / Unchanged"}
                            </span>
                          </div>

                          <div className="p-space-sm rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface leading-relaxed">
                            <p>
                              <strong className="font-semibold text-primary">Impact Summary:</strong>{" "}
                              {diff.explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
