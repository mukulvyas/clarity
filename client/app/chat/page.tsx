"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { listUserDocuments, type UserDocument } from "@/lib/api";
import { MOCK_RECENT_DOCUMENTS } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/client";

export default function ChatPickerPage() {
  const [userDocs, setUserDocs] = useState<UserDocument[]>([]);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocs() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsAuth(true);
          const docs = await listUserDocuments();
          setUserDocs(docs);
        }
      } catch (err) {
        console.error("Failed to load documents", err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
      <Header />

      <main className="w-full pt-20 bg-background min-h-[calc(100vh-140px)] flex-grow">
        <div className="w-full max-w-4xl mx-auto px-gutter py-space-xl space-y-space-lg text-center">
          <div className="space-y-space-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-primary">
              <span className="material-symbols-outlined text-[16px]">forum</span>
              <span>Grounded Contract Q&amp;A</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Ask Clarity Anything About Your Contract
            </h1>
            <p className="font-headline-sm italic text-body-lg text-on-surface-variant font-normal max-w-xl mx-auto">
              Select a document from your private vault to start asking grounded questions with exact clause citations.
            </p>
          </div>

          {/* Document Picker Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md text-left pt-space-md">
            {isAuth && userDocs.length > 0 ? (
              userDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}/chat`}
                  className="group bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md border border-surface-container hover:border-primary"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[22px]">description</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors" title={doc.filename}>
                      {doc.filename}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {doc.page_count ? `${doc.page_count} Pages` : "Uploaded Document"} • {doc.status}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 font-label-md text-label-md text-primary font-semibold pt-2">
                    <span>Start Q&amp;A Chat</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              MOCK_RECENT_DOCUMENTS.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}/chat`}
                  className="group bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md border border-surface-container hover:border-primary"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[22px]">description</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                      {doc.filename}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {doc.property_name} • {doc.page_count} Pages
                    </p>
                  </div>

                  <div className="flex items-center gap-1 font-label-md text-label-md text-primary font-semibold pt-2">
                    <span>Start Q&amp;A Chat</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="pt-space-md">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Upload a New Agreement</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
