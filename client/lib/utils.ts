import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`;
  if (diffHours < 48) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function riskTagLabel(tag: string | null | undefined): string {
  switch (tag) {
    case "risky": return "Risky";
    case "worth_reviewing": return "Worth Reviewing";
    case "standard": return "Standard";
    default: return "Standard";
  }
}

export function riskTagColor(tag: string | null | undefined): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (tag) {
    case "risky":
      return {
        bg: "bg-[#ffdad4]",
        text: "text-[#852b1f]",
        dot: "bg-[#852b1f]",
      };
    case "worth_reviewing":
      return {
        bg: "bg-[#ffdcc2]",
        text: "text-[#8f4e00]",
        dot: "bg-[#8f4e00]",
      };
    default:
      return {
        bg: "bg-[#bceed3]",
        text: "text-[#25533f]",
        dot: "bg-[#25533f]",
      };
  }
}
