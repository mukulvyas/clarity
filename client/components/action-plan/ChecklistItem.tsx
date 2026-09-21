"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { updateActionItem } from "@/lib/api";

export interface ActionItem {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  suggested_script?: string | null;
}

interface ChecklistItemProps {
  documentId: string;
  item: ActionItem;
  onStatusChange: (id: string, newStatus: string) => void;
}

export default function ChecklistItem({ documentId, item, onStatusChange }: ChecklistItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCompleted = item.status === "completed";

  const handleToggle = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    const newStatus = isCompleted ? "pending" : "completed";
    
    // Optimistic update
    onStatusChange(item.id, newStatus);
    
    try {
      await updateActionItem(documentId, item.id, newStatus as "pending" | "completed");
    } catch (err) {
      // Revert on failure
      onStatusChange(item.id, item.status);
      console.error("Failed to update status", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = () => {
    if (!item.suggested_script) return;
    navigator.clipboard.writeText(item.suggested_script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "bg-white border rounded-2xl p-5 shadow-sm flex flex-col gap-4 transition-all duration-300",
        isCompleted && "opacity-60 bg-gray-50/50"
      )}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isUpdating}
          className={cn(
            "w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-1 transition-colors",
            isCompleted
              ? "bg-[#25533f] border-[#25533f] text-white"
              : "border-[#717973] hover:border-[#25533f]"
          )}
        >
          {isCompleted && <span className="material-symbols-outlined text-[16px]">check</span>}
        </button>
        <div className="flex flex-col gap-1 w-full">
          <h4
            className={cn(
              "text-headline-sm transition-all",
              isCompleted ? "text-[#717973] line-through decoration-[#717973]/50" : "text-[#1e1b18]"
            )}
          >
            {item.title}
          </h4>
          <p className="text-body-md text-[#414944]">{item.description}</p>
        </div>
      </div>

      {item.suggested_script && !isCompleted && (
        <div className="ml-10 bg-[#f5ece7] rounded-xl p-4 flex flex-col gap-3 relative group">
          <div className="flex items-center gap-2 text-[#25533f]">
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span className="text-label-sm uppercase tracking-wider">Suggested Script</span>
          </div>
          <p className="text-body-sm text-[#414944] font-medium leading-relaxed font-serif">
            "{item.suggested_script}"
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-white/50 text-[#414944] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">
              {copied ? "check" : "content_copy"}
            </span>
            {copied && <span className="text-label-sm">Copied!</span>}
          </button>
        </div>
      )}
    </div>
  );
}
