"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MOCK_RECENT_DOCUMENTS } from "@/lib/mockData";

export default function ActionPlanPickerPage() {
  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
      <Header />

      <main className="w-full pt-20 bg-background min-h-[calc(100vh-140px)] flex-grow">
        <div className="w-full max-w-4xl mx-auto px-gutter py-space-xl space-y-space-lg text-center">
          <div className="space-y-space-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-primary">
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
              <span>Pre-Signing Checklist &amp; Scripts</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Personalized Pre-Signing Action Plans
            </h1>
            <p className="font-headline-sm italic text-body-lg text-on-surface-variant font-normal max-w-xl mx-auto">
              Select a contract to review recommended negotiation steps, ready-to-send email scripts, and move-in checklists.
            </p>
          </div>

          {/* Document Picker Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md text-left pt-space-md">
            {MOCK_RECENT_DOCUMENTS.map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}/action-plan`}
                className="group bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md border border-surface-container hover:border-primary"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">checklist</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                    {doc.filename}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {doc.property_name} • {doc.page_count} Pages
                  </p>
                </div>

                <div className="flex items-center gap-1 font-label-md text-label-md text-primary font-semibold pt-2">
                  <span>Open Action Checklist</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="pt-space-md">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Upload a New Contract</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
