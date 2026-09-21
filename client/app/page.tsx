"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { uploadDocument, listUserDocuments, type UploadErrorResponse, type UserDocument } from "@/lib/api";
import { MOCK_RECENT_DOCUMENTS, MOCK_DOCUMENT_ID } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type UploadState =
  | { type: "idle" }
  | { type: "dragging" }
  | { type: "uploading"; filename: string }
  | { type: "processing"; documentId: string; filename: string }
  | { type: "error"; error: UploadErrorResponse | string };

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ type: "idle" });
  const [greeting, setGreeting] = useState("Good morning");
  const [userName, setUserName] = useState<string | null>(null);
  const [userDocs, setUserDocs] = useState<UserDocument[]>([]);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Dynamic greeting based on current local hour
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }

    const supabase = createClient();
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuth(true);
        const meta = user.user_metadata || {};
        const first = meta.first_name || meta.full_name?.split(" ")[0] || user.email?.split("@")[0] || "";
        if (first) setUserName(first);

        const docs = await listUserDocuments();
        setUserDocs(docs);
      } else {
        setIsAuth(false);
      }
    }
    loadUserData();
  }, []);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];

      setUploadState({ type: "uploading", filename: file.name });

      try {
        const response = await uploadDocument(file);

        if (response.status === "error" && "error_type" in response) {
          setUploadState({ type: "error", error: response });
          router.push(
            `/upload-error?${new URLSearchParams({
              document_id: response.document_id,
              score: String(response.legibility_score),
              message: response.message,
            })}`
          );
          return;
        }

        setUploadState({
          type: "processing",
          documentId: response.document_id,
          filename: response.filename,
        });

        // Navigate to document summary
        router.push(`/documents/${response.document_id}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
        setUploadState({ type: "error", error: message });
      }
    },
    [router]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState((s) => (s.type === "idle" ? { type: "dragging" } : s));
  };

  const onDragLeave = () => {
    setUploadState((s) => (s.type === "dragging" ? { type: "idle" } : s));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const isUploading =
    uploadState.type === "uploading" || uploadState.type === "processing";

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
      <Header />

      <main className="w-full pt-20 bg-background min-h-[calc(100vh-140px)] flex-grow">
        <div className="flex flex-col w-full">
          {/* Subtle ambient decorative background blur blobs */}
          <div className="relative w-full max-w-7xl mx-auto px-gutter py-space-lg flex flex-col gap-space-xl overflow-hidden">
            <div className="absolute -top-24 right-10 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-1/3 -left-20 w-80 h-80 bg-secondary-fixed/40 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* ── Friendly Welcoming Header ──────────────────────────── */}
            <section className="flex flex-col md:flex-row items-start md:items-end justify-between gap-space-md pt-space-xs">
              <div className="max-w-3xl flex flex-col gap-space-xs">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high w-fit">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Sanctuary of Clarity
                  </span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight leading-tight">
                  {greeting}, {userName || "there"}.<br />
                  <span className="text-primary italic font-normal">
                    Let’s make sense of your paperwork together.
                  </span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant pt-1 max-w-2xl">
                  Upload any contract, rental agreement, loan form, or insurance policy. We’ll translate the fine print into plain, human English in seconds.
                </p>
              </div>

              {/* Quick Trust Indicators Widget */}
              <div className="flex items-center gap-space-sm bg-surface-container-lowest p-space-sm rounded-xl shadow-sm shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">lock_reset</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Zero Data Retention</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Ephemeral sandbox encryption</span>
                </div>
              </div>
            </section>

            {/* ── Tactile Paper Upload Deck ─────────────────────────── */}
            <section className="w-full flex flex-col items-center">
              <div
                id="drop-zone"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                  "w-full relative group bg-surface-container-low transition-all duration-300 rounded-[1.25rem] p-space-lg md:p-space-xl shadow-sm hover:shadow-md flex flex-col items-center text-center overflow-hidden cursor-pointer border-2 border-dashed border-transparent",
                  uploadState.type === "dragging" && "border-primary bg-primary-fixed/20 shadow-md",
                  isUploading && "pointer-events-none opacity-80"
                )}
              >
                {/* Inner paper background */}
                <div className="absolute inset-2 md:inset-3.5 rounded-xl bg-surface-container-lowest/80 pointer-events-none -z-0" />
                <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/40 to-transparent pointer-events-none" />

                {/* Card Content */}
                <div className="relative z-10 max-w-2xl flex flex-col items-center gap-space-md">
                  {/* Organic Illustrated Stamp */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary-fixed/40 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500 ease-out" />
                    <svg
                      className="w-20 h-20 text-primary transition-transform duration-300 group-hover:-rotate-3"
                      fill="none"
                      viewBox="0 0 80 80"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect fill="#F5ECE7" height="52" rx="6" width="44" x="18" y="14" />
                      <path d="M28 28H52M28 36H46M28 44H40" stroke="#3E6B56" strokeLinecap="round" strokeWidth="3" />
                      <circle cx="56" cy="22" fill="#FEA047" fillOpacity="0.9" r="10" />
                      <path d="M56 16V28M50 22H62" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2.5" />
                      <circle cx="26" cy="54" fill="#3E6B56" r="4" />
                    </svg>
                    <span className="material-symbols-outlined absolute -bottom-1 -right-1 text-secondary text-[24px] animate-bounce">
                      auto_awesome
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-space-xs">
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      {isUploading ? "Reading and translating your agreement..." : "Drop your agreement here to unlock calm"}
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                      {isUploading
                        ? "Clarity AI is processing every clause, mapping risks, and creating your plain-English translation."
                        : "Drag and drop any file — PDF, DOCX, scans, or receipts. Files are processed instantaneously and never stored or used for model training."}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {!isUploading && (
                    <div className="flex flex-wrap items-center justify-center gap-space-sm pt-2 w-full">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm hover:scale-[1.02] hover:bg-primary transition-all">
                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                        <span>Upload document (PDF, DOCX, or Image)</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleFiles(e.target.files)}
                        />
                      </label>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-variant transition-colors"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px] text-primary">photo_camera</span>
                        <span>Scan with Phone Camera</span>
                      </button>
                    </div>
                  )}

                  {/* Micro drag hint */}
                  <div className="flex items-center gap-2 text-on-surface-variant pt-1">
                    <span className="material-symbols-outlined text-[16px] text-outline">drag_indicator</span>
                    <span className="font-label-sm text-label-sm">Maximum file size: 50MB • Multi-page contracts accepted</span>
                  </div>
                </div>
              </div>

              {/* Legal Reassurance Banner */}
              <div className="mt-space-sm w-full max-w-2xl px-space-md py-space-xs rounded-full bg-surface-container flex items-center justify-center gap-2 text-center">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0">verified_user</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  <strong className="font-label-sm text-on-surface">AI-generated — not a substitute for legal advice.</strong> Clarity is an educational translation companion to help you understand your documents clearly.
                </p>
              </div>
            </section>

            {/* ── 3 Self-Guided Workflow Pathways ──────────────────── */}
            <section className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">Self-guided pathways</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Choose what you need help with right now</h3>
                </div>
                <span className="hidden md:inline-flex font-body-sm text-body-sm text-on-surface-variant">No lawyer fees • 100% plain language</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {/* Pathway 1: Simplify */}
                <Link
                  href={`/documents/${MOCK_DOCUMENT_ID}`}
                  className="group bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md relative overflow-hidden border border-surface-container"
                >
                  <div className="flex flex-col gap-space-xs">
                    <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary mb-1">
                      <span className="material-symbols-outlined text-[26px]">translate</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-primary font-semibold">Pathway 01</span>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                      Simplify a Document
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Get a 30-second bottom line summary and clause-by-clause breakdown in plain English.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 font-label-md text-label-md text-primary pt-2 group-hover:translate-x-1 transition-transform">
                    <span>View Sample Lease</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </div>
                </Link>

                {/* Pathway 2: Compare */}
                <Link
                  href="/compare"
                  className="group bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md relative overflow-hidden border border-surface-container"
                >
                  <div className="flex flex-col gap-space-xs">
                    <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary mb-1">
                      <span className="material-symbols-outlined text-[26px]">balance</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">Pathway 02</span>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-secondary transition-colors">
                      Compare Two Versions
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Compare initial draft vs revised contract to see what improved, changed, or got worse.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 font-label-md text-label-md text-secondary pt-2 group-hover:translate-x-1 transition-transform">
                    <span>Launch Comparison</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </div>
                </Link>

                {/* Pathway 3: Ask a Question */}
                <Link
                  href={`/documents/${MOCK_DOCUMENT_ID}/chat`}
                  className="group bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md relative overflow-hidden border border-surface-container"
                >
                  <div className="flex flex-col gap-space-xs">
                    <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary mb-1">
                      <span className="material-symbols-outlined text-[26px]">forum</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-tertiary font-semibold">Pathway 03</span>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-tertiary transition-colors">
                      Ask Grounded Questions
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Chat directly with your contract. Every answer cites exact clauses and page numbers.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 font-label-md text-label-md text-tertiary pt-2 group-hover:translate-x-1 transition-transform">
                    <span>Ask Ask Clarity</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </div>
                </Link>
              </div>
            </section>

            {/* ── Recent Documents Section ───────────────────────────── */}
            <section className="flex flex-col gap-space-md pb-space-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">Your Private Vault</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Agreements</h3>
                </div>
                <Link
                  href="/documents"
                  className="inline-flex items-center gap-1.5 font-label-md text-label-md text-primary hover:underline"
                >
                  <span>View all documents</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {isAuth && userDocs.length > 0 ? (
                  userDocs.slice(0, 6).map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-sm border border-surface-container"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                            {doc.page_count ? `${doc.page_count} Pages` : "Document"}
                          </span>
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold capitalize",
                              doc.status === "ready"
                                ? "bg-primary-fixed text-on-primary-fixed-variant"
                                : doc.status === "processing"
                                ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                                : "bg-error/15 text-error"
                            )}
                          >
                            {doc.status}
                          </span>
                        </div>

                        <h4 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 pt-1" title={doc.filename}>
                          {doc.filename}
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Uploaded {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "Recently"}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-surface-container flex items-center justify-between">
                        <Link
                          href={`/documents/${doc.id}`}
                          className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:text-primary-container font-semibold"
                        >
                          <span>Review Analysis</span>
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </Link>
                        <Link
                          href={`/documents/${doc.id}/chat`}
                          className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
                          title="Ask Questions"
                        >
                          <span className="material-symbols-outlined text-[18px]">chat</span>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  MOCK_RECENT_DOCUMENTS.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-sm border border-surface-container"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                            {doc.page_count ? `${doc.page_count} Pages` : "PDF Document"}
                          </span>
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold",
                              doc.risk_badge_color === "tertiary"
                                ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                                : doc.risk_badge_color === "secondary"
                                ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                                : "bg-primary-fixed text-on-primary-fixed-variant"
                            )}
                          >
                            {doc.risk_summary}
                          </span>
                        </div>

                        <h4 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 pt-1">
                          {doc.filename}
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {doc.property_name || "Sample Agreement"}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-surface-container flex items-center justify-between">
                        <Link
                          href={`/documents/${doc.id}`}
                          className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:text-primary-container font-semibold"
                        >
                          <span>Review Analysis</span>
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </Link>
                        <Link
                          href={`/documents/${doc.id}/chat`}
                          className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
                          title="Ask Questions"
                        >
                          <span className="material-symbols-outlined text-[18px]">chat</span>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
