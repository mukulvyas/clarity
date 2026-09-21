"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/lib/api";
import Link from "next/link";

interface Citation {
  clause_id: string;
  section_ref?: string;
  excerpt: string;
  page_ref?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  nextAction?: string | null;
}

interface ChatInterfaceProps {
  documentId: string;
  className?: string;
}

function FormattedMessageContent({ content }: { content: string }) {
  if (!content) return null;

  let processed = content.replace(/(\s+)(\d+\.\s+\*\*)/g, "\n\n$2");
  processed = processed.replace(/(\s+)(\d+\.\s+[A-Z])/g, "\n\n$2");

  const paragraphs = processed.split(/\n+/).filter(Boolean);

  return (
    <div className="space-y-2 text-body-md leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        const parts = para.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={pIdx}>
            {parts.map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={i} className="font-semibold">
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

export default function ChatInterface({ documentId, className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I've read your document. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await sendChatMessage(documentId, userMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.answer,
          citations: response.cited_clauses,
          nextAction: response.next_action,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I ran into an error trying to answer that. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={cn("flex flex-col bg-white border shadow-sm rounded-2xl overflow-hidden h-[600px] max-h-[80vh]", className)}>
      {/* Header */}
      <div className="bg-[#fbf2ed] p-4 border-b flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#bceed3] flex items-center justify-center text-[#25533f]">
          <span className="material-symbols-outlined text-[20px]">forum</span>
        </div>
        <div>
          <h3 className="text-label-lg text-[#1e1b18]">Ask Clarity</h3>
          <p className="text-body-sm text-[#414944]">Strictly cited from your document</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "flex flex-col max-w-[85%]",
              msg.role === "user" ? "self-end items-end" : "self-start items-start"
            )}
          >
            {/* Bubble */}
            <div
              className={cn(
                "px-5 py-3 rounded-2xl text-body-md shadow-sm",
                msg.role === "user"
                  ? "bg-[#25533f] text-white rounded-br-sm"
                  : "bg-[#f5ece7] text-[#1e1b18] rounded-bl-sm"
              )}
            >
              <FormattedMessageContent content={msg.content} />
            </div>

            {/* Citations */}
            {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
              <div className="flex flex-col gap-2 mt-3 w-full">
                <span className="text-label-sm text-[#717973] uppercase tracking-wider">
                  Sources cited
                </span>
                <div className="flex flex-col gap-2">
                  {msg.citations.map((cite, cIdx) => (
                    <div
                      key={cIdx}
                      className="bg-white border p-3 rounded-lg flex flex-col gap-1.5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-label-sm text-[#1e1b18]">
                          {cite.section_ref || "General Clause"}
                        </span>
                        <Link
                          href={`/documents/${documentId}/clauses/${cite.clause_id}`}
                          className="text-label-sm text-[#25533f] hover:underline flex items-center gap-1"
                        >
                          View full
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </Link>
                      </div>
                      <p className="text-body-sm text-[#414944] italic border-l-2 border-[#bceed3] pl-2">
                        "{cite.excerpt}"
                      </p>
                      {cite.page_ref && (
                        <span className="text-body-sm text-[#717973] text-right">
                          {cite.page_ref}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Action */}
            {msg.role === "assistant" && msg.nextAction && (
              <div className="mt-3 bg-[#ffdcc2]/30 border border-[#ffdcc2] p-3 rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-[#8f4e00] text-[18px] shrink-0 mt-0.5">
                  lightbulb
                </span>
                <p className="text-body-sm text-[#8f4e00]">
                  <strong>Suggested Action:</strong> {msg.nextAction}
                </p>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="self-start items-start flex flex-col max-w-[85%]">
            <div className="px-5 py-4 rounded-2xl bg-[#f5ece7] rounded-bl-sm shadow-sm flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#717973] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#717973] rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-[#717973] rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ask about breaking the lease, pets, etc..."
            className="w-full pl-5 pr-14 py-3.5 rounded-full bg-[#f5ece7] text-[#1e1b18] placeholder-[#717973] outline-none focus:ring-2 focus:ring-[#bceed3] transition-all text-body-md"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 w-10 h-10 rounded-full bg-[#25533f] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a3a2c] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
