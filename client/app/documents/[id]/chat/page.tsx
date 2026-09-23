"use client";

import { useState, useRef, useEffect, use } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  getDocumentSummary,
  sendChatMessage,
  getChatHistory,
  clearChatHistory,
  type DocumentSummary,
  type CitedClause,
} from "@/lib/api";
import { getMockDocumentMetadata, getMockSuggestedQuestions, getMockClauseJumpers } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  cited_clauses?: CitedClause[];
  next_action?: string | null;
}

function FormattedMessageContent({ content }: { content: string }) {
  if (!content) return null;

  // Pre-process content: separate squished inline numbered items onto new paragraphs
  let processed = content.replace(/(\s+)(\d+\.\s+\*\*)/g, "\n\n$2");
  processed = processed.replace(/(\s+)(\d+\.\s+[A-Z])/g, "\n\n$2");

  const paragraphs = processed.split(/\n+/).filter(Boolean);

  return (
    <div className="space-y-2.5 text-body-md leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        const parts = para.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={pIdx}>
            {parts.map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={i} className="font-semibold text-on-surface">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function DocumentChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.id;

  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I have thoroughly analyzed your agreement. Ask me any question—every answer I give will cite the exact section and page of your agreement.",
      cited_clauses: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadDocAndHistory() {
      try {
        const [docData, historyData] = await Promise.all([
          getDocumentSummary(documentId).catch(() => null),
          getChatHistory(documentId).catch(() => ({ document_id: documentId, messages: [] })),
        ]);

        if (docData) setSummary(docData);

        const welcomeMsg: Message = {
          id: "welcome",
          role: "assistant",
          content: docData
            ? `Hello! I have thoroughly analyzed your ${docData.filename}. Ask me any question—like key obligations, payment terms, or termination rules. Every answer I give will cite the exact section and page of your agreement.`
            : "Hello! I have thoroughly analyzed your agreement. Ask me any question—every answer I give will cite the exact section and page of your agreement.",
          cited_clauses: [],
        };

        if (historyData.messages && historyData.messages.length > 0) {
          const loadedMsgs: Message[] = historyData.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            cited_clauses: m.cited_clauses,
          }));
          setMessages([welcomeMsg, ...loadedMsgs]);
        } else {
          setMessages([welcomeMsg]);
        }
      } catch (err) {
        console.error("Failed to load document summary or chat history", err);
      }
    }
    loadDocAndHistory();
  }, [documentId]);

  const handleClearHistory = async () => {
    if (isClearing) return;
    const confirmClear = window.confirm("Are you sure you want to clear your conversation history for this document?");
    if (!confirmClear) return;

    setIsClearing(true);
    try {
      await clearChatHistory(documentId);
      const welcomeMsg: Message = {
        id: "welcome",
        role: "assistant",
        content: summary
          ? `Hello! I have thoroughly analyzed your ${summary.filename}. Ask me any question—like key obligations, payment terms, or termination rules. Every answer I give will cite the exact section and page of your agreement.`
          : "Hello! I have thoroughly analyzed your agreement. Ask me any question—every answer I give will cite the exact section and page of your agreement.",
        cited_clauses: [],
      };
      setMessages([welcomeMsg]);
    } catch (err) {
      console.error("Failed to clear chat history", err);
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const question = textToSend || input;
    if (!question.trim() || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const historyToSend = messages
        .filter((m) => m.id !== "welcome")
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await sendChatMessage(documentId, question, historyToSend);
      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: response.answer,
        cited_clauses: response.cited_clauses,
        next_action: response.next_action,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat message failed", err);
    } finally {
      setLoading(false);
    }
  };

  const metadataItems = getMockDocumentMetadata(documentId);
  const suggestedQuestions = getMockSuggestedQuestions(documentId);
  const clauseJumpers = getMockClauseJumpers(documentId);

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
      <Header />

      <main className="w-full pt-20 bg-background min-h-[calc(100vh-140px)] flex-grow">
        <div className="max-w-7xl mx-auto w-full px-gutter py-space-md">
          <div className="flex flex-col lg:flex-row gap-gutter items-start">
            {/* ── Left Sidebar: Document Context Panel (28% desktop) ── */}
            <aside className="w-full lg:w-[28%] shrink-0 flex flex-col gap-space-md">
              {/* Document Badge Card */}
              <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-md relative overflow-hidden border border-surface-container">
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary-fixed/25 blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between gap-space-xs mb-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="p-2 rounded-lg bg-surface-container text-primary material-symbols-outlined text-[20px]">
                      description
                    </span>
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                        Verified Document
                      </span>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface leading-tight line-clamp-2">
                        {summary?.filename || "Verified Contract"}
                      </h2>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-semibold shrink-0">
                    {summary?.page_count || 5} Pages
                  </span>
                </div>

                <div className="space-y-1.5 py-space-xs text-on-surface-variant font-body-sm text-body-sm border-t border-surface-container">
                  {metadataItems.map((meta, idx) => (
                    <div key={idx} className="flex items-center justify-between pt-0.5">
                      <span>{meta.label}</span>
                      <span className="font-label-md text-label-md text-on-surface font-medium">{meta.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-space-sm pt-space-sm bg-surface-container-low rounded-lg p-space-sm border border-surface-container">
                  <div className="flex items-center gap-1.5 text-primary mb-1">
                    <span className="material-symbols-outlined text-[16px]">verified_user</span>
                    <span className="font-label-sm text-label-sm font-semibold">100% Parsed &amp; Grounded</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Every assertion is cross-checked against exact clauses. No general internet advice.
                  </p>
                </div>
              </div>

              {/* Quick Clause Jumpers */}
              <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm border border-surface-container">
                <div className="flex items-center justify-between mb-space-sm">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Quick Clause Jumpers</h3>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold">{clauseJumpers.length} Key Areas</span>
                </div>
                <div className="space-y-2">
                  {clauseJumpers.map((jumper, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(jumper.query)}
                      className="w-full text-left p-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high transition-all flex items-center justify-between group shadow-sm border border-surface-container"
                      type="button"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("w-2 h-2 rounded-full shrink-0", jumper.color)} />
                        <span className="font-body-sm text-body-sm text-on-surface font-medium truncate">{jumper.ref}</span>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform shrink-0">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* ── Right Main Panel: Ask Clarity Grounded Chat (72% desktop) ── */}
            <main className="w-full lg:w-[72%] flex flex-col gap-space-md min-h-[680px]">
              {/* AI Disclosure Banner */}
              <div className="p-3.5 rounded-xl bg-surface-container flex items-center justify-between gap-2 border border-surface-container-high">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    <strong className="font-label-sm text-on-surface">AI-generated — not a substitute for legal advice.</strong> Answers are grounded strictly in your uploaded agreement.
                  </p>
                </div>
              </div>

              {/* Chat Controls & History Status */}
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-medium">
                    <span className="material-symbols-outlined text-[15px]">history</span>
                    <span>
                      {messages.length > 1
                        ? `${messages.filter((m) => m.role === "user").length} Questions in History`
                        : "New Conversation"}
                    </span>
                  </span>
                </div>

                {messages.length > 1 && (
                  <button
                    onClick={handleClearHistory}
                    disabled={isClearing}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container hover:bg-error/15 text-on-surface-variant hover:text-error font-label-sm text-label-sm transition-colors"
                    title="Clear conversation history"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    <span>{isClearing ? "Clearing..." : "Clear History"}</span>
                  </button>
                )}
              </div>

              {/* Suggested Questions Quick Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="px-3.5 py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm shadow-sm transition-all whitespace-nowrap border border-surface-container shrink-0"
                    type="button"
                  >
                    “{q}”
                  </button>
                ))}
              </div>

              {/* Chat Thread Container */}
              <div
                role="log"
                aria-live="polite"
                aria-label="Conversation messages"
                className="flex-1 bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-md min-h-[480px] border border-surface-container overflow-y-auto max-h-[600px]"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col gap-2 max-w-[88%]",
                      msg.role === "user" ? "self-end items-end" : "self-start items-start"
                    )}
                  >
                    {msg.role === "user" ? (
                      <div className="p-3.5 rounded-2xl bg-primary-container text-on-primary font-body-md text-body-md shadow-sm rounded-br-xs">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="p-space-md rounded-2xl bg-surface-container-low text-on-surface font-body-md text-body-md shadow-sm rounded-bl-xs border border-surface-container space-y-3 w-full">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">auto_awesome</span>
                          <span className="font-label-sm text-label-sm uppercase tracking-wider">Clarity Answer</span>
                        </div>

                        <FormattedMessageContent content={msg.content} />

                        {/* Citation Cards */}
                        {msg.cited_clauses && msg.cited_clauses.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-surface-container">
                            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
                              Cited Grounding (Exact Source)
                            </span>
                            {msg.cited_clauses.map((c, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-3 rounded-xl bg-surface-container-lowest text-on-surface-variant text-body-sm font-body-sm border border-surface-container italic"
                              >
                                <div className="flex items-center justify-between not-italic font-label-sm text-label-sm font-semibold text-primary mb-1">
                                  <span>{c.section_ref} ({c.page_ref})</span>
                                </div>
                                “{c.excerpt}”
                              </div>
                            ))}
                          </div>
                        )}

                        {msg.next_action && (
                          <div className="p-2.5 rounded-xl bg-primary-fixed/40 text-on-primary-fixed-variant font-body-sm text-body-sm font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">arrow_forward</span>
                            <span>Suggested next step: {msg.next_action}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="self-start flex items-center gap-2 p-3 rounded-2xl bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm" role="status">
                    <span className="material-symbols-outlined text-[18px] text-primary animate-spin" aria-hidden="true">sync</span>
                    <span>Clarity is analyzing your document and building citations...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  aria-label="Ask a question about your agreement"
                  placeholder="Ask a question about your lease (e.g. 'Can I sublet my apartment?')..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="w-full pl-5 pr-14 py-4 rounded-full bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm border border-outline-variant focus:border-primary outline-none transition-colors"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  className="absolute right-2 w-10 h-10 rounded-full bg-primary text-on-primary hover:bg-primary-container disabled:opacity-40 transition-all flex items-center justify-center shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">send</span>
                </button>
              </div>
            </main>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
