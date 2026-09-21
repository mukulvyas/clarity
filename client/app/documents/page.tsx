"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { listUserDocuments, type UserDocument } from "@/lib/api";
import { MOCK_RECENT_DOCUMENTS } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function MyDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<"all" | "ready" | "processing" | "error">("all");
  const [userDocs, setUserDocs] = useState<UserDocument[]>([]);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserVault() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsAuth(true);
          const docs = await listUserDocuments();
          setUserDocs(docs);
        } else {
          setIsAuth(false);
        }
      } catch (err) {
        console.error("Failed to load documents", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUserVault();
  }, []);

  const filteredUserDocs = userDocs.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterTag === "all") return matchesSearch;
    return matchesSearch && doc.status === filterTag;
  });

  const filteredMockDocs = MOCK_RECENT_DOCUMENTS.filter((doc) => {
    const matchesSearch =
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.property_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
      <Header />

      <main className="w-full pt-20 bg-background min-h-[calc(100vh-140px)] flex-grow">
        <div className="w-full max-w-7xl mx-auto px-gutter py-space-lg space-y-space-lg">
          {/* Header Strip */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-primary mb-2">
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                <span>Document History &amp; Summary</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                My Documents
              </h1>
              <p className="font-headline-sm italic text-body-lg text-on-surface-variant mt-1 font-normal">
                Your private vault of analyzed contracts, leases, and agreements.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Upload New Document</span>
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-container-low p-4 rounded-xl shadow-sm border border-surface-container">
            <div className="relative w-full md:w-96">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[20px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Search documents by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm outline-none border border-outline-variant focus:border-primary transition-colors"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-full w-full md:w-auto overflow-x-auto">
              <button
                onClick={() => setFilterTag("all")}
                className={cn(
                  "px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all whitespace-nowrap",
                  filterTag === "all"
                    ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                All ({isAuth ? userDocs.length : MOCK_RECENT_DOCUMENTS.length})
              </button>
              <button
                onClick={() => setFilterTag("ready")}
                className={cn(
                  "px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all flex items-center gap-1 whitespace-nowrap",
                  filterTag === "ready"
                    ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-primary" />
                Ready
              </button>
              <button
                onClick={() => setFilterTag("processing")}
                className={cn(
                  "px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all flex items-center gap-1 whitespace-nowrap",
                  filterTag === "processing"
                    ? "bg-surface-container-lowest text-secondary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-secondary-container" />
                Processing
              </button>
              <button
                onClick={() => setFilterTag("error")}
                className={cn(
                  "px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all flex items-center gap-1 whitespace-nowrap",
                  filterTag === "error"
                    ? "bg-surface-container-lowest text-error font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-error" />
                Errors
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px] animate-spin text-primary">progress_activity</span>
              <p className="font-body-sm text-body-sm">Loading your private vault...</p>
            </div>
          )}

          {/* User's Isolated Documents */}
          {!isLoading && isAuth && userDocs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              {filteredUserDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md border border-surface-container"
                >
                  <div className="space-y-3">
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

                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1" title={doc.filename}>
                        {doc.filename}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        Uploaded {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "Recently"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-surface-container">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-md text-label-md hover:bg-primary-fixed-dim transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">read_more</span>
                      <span>View Plain-English Summary</span>
                    </Link>

                    <div className="grid grid-cols-2 gap-1 pt-1">
                      <Link
                        href={`/documents/${doc.id}/chat`}
                        className="px-2 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-center font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        <span>Ask Questions</span>
                      </Link>
                      <Link
                        href={`/documents/${doc.id}/action-plan`}
                        className="px-2 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-center font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">task_alt</span>
                        <span>Action Plan</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty User Vault State */}
          {!isLoading && isAuth && userDocs.length === 0 && (
            <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-12 text-center flex flex-col items-center gap-4 border border-surface-container shadow-sm max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-2">
                <span className="material-symbols-outlined text-[32px]">lock</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Your Private Vault is Ready
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                You haven&apos;t uploaded any agreements yet. Any document you upload will be stored here with strict isolation, so only you can access it.
              </p>
              <Link
                href="/"
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                <span>Upload Your First Agreement</span>
              </Link>
            </div>
          )}

          {/* Guest / Unauthenticated Mode: Demo Agreements */}
          {!isLoading && !isAuth && (
            <div className="space-y-6">
              <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Viewing demo agreements. <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link> or <Link href="/signup" className="text-primary font-semibold hover:underline">Sign up</Link> to save your private documents in your personal vault.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {filteredMockDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md border border-surface-container"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                          {doc.page_count} Pages
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

                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">
                          {doc.filename}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          {doc.property_name}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-surface-container">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-md text-label-md hover:bg-primary-fixed-dim transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">read_more</span>
                        <span>View Plain-English Summary</span>
                      </Link>

                      <div className="grid grid-cols-3 gap-1 pt-1">
                        <Link
                          href={`/documents/${doc.id}/chat`}
                          className="px-2 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-center font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">chat</span>
                          <span>Ask</span>
                        </Link>
                        <Link
                          href={`/documents/${doc.id}/action-plan`}
                          className="px-2 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-center font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">task_alt</span>
                          <span>Plan</span>
                        </Link>
                        <Link
                          href="/compare"
                          className="px-2 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-center font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">balance</span>
                          <span>Diff</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
