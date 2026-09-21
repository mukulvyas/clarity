"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function UploadErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const score = searchParams.get("score") || "42";
  const message =
    searchParams.get("message") ||
    "The document image contains heavy shadows, low contrast, or blurry text that prevented high-accuracy legal parsing.";

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-lg sm:p-space-xl shadow-md border border-tertiary-container/30 space-y-space-md text-left relative overflow-hidden">
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-tertiary-fixed/30 rounded-full blur-3xl pointer-events-none" />

      {/* Error Badge & Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[28px]">photo_camera_front</span>
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold mb-1">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span>Legibility Confidence: {score}% (Low Clarity)</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            We had trouble reading your document
          </h1>
        </div>
      </div>

      {/* Plain-Language Explanation */}
      <div className="p-space-md rounded-xl bg-tertiary-fixed/20 border border-tertiary-container/20 text-on-surface space-y-1">
        <span className="font-label-md text-label-md text-tertiary font-semibold uppercase tracking-wider">
          What Happened
        </span>
        <p className="font-body-md text-body-md leading-relaxed">
          {message}
        </p>
      </div>

      {/* Concrete Fix Suggestions */}
      <div className="space-y-space-xs pt-1">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">
          Concrete steps to get a clean, 100% accurate translation:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
            <span className="w-6 h-6 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold flex items-center justify-center">
              1
            </span>
            <p className="font-label-md text-label-md text-on-surface font-semibold pt-1">Avoid Glare &amp; Shadows</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Place your contract under even, bright indoor lighting without flash reflections.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
            <span className="w-6 h-6 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold flex items-center justify-center">
              2
            </span>
            <p className="font-label-md text-label-md text-on-surface font-semibold pt-1">Flatten Document Edges</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Smooth out folded corners or page curves so lines of text align straight.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
            <span className="w-6 h-6 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold flex items-center justify-center">
              3
            </span>
            <p className="font-label-md text-label-md text-on-surface font-semibold pt-1">Use Digital PDF</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">If available, upload the original digital PDF version from your landlord or employer.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-space-md border-t border-surface-container flex flex-wrap items-center justify-between gap-space-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">upload_file</span>
          <span>Try Uploading Again</span>
        </Link>

        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-variant transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">photo_camera</span>
          <span>Scan with Phone Camera</span>
        </button>
      </div>
    </div>
  );
}

export default function UploadErrorPage() {
  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
      <Header />

      <main className="w-full pt-20 bg-background min-h-[calc(100vh-140px)] flex-grow flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto px-gutter py-space-xl">
          <Suspense fallback={<div className="p-space-xl text-center font-headline-sm text-headline-sm text-on-surface">Loading error details...</div>}>
            <UploadErrorContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
