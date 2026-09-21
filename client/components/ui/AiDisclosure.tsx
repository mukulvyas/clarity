import { cn } from "@/lib/utils";

interface AiDisclosureProps {
  className?: string;
}

export default function AiDisclosure({ className }: AiDisclosureProps) {
  return (
    <div
      className={cn(
        "w-full max-w-2xl px-5 py-2 rounded-full bg-[#f5ece7] flex items-center justify-center gap-2 text-center",
        className
      )}
    >
      <span className="material-symbols-outlined text-[#25533f] text-[18px] shrink-0">
        verified_user
      </span>
      <p className="text-body-sm text-[#414944]">
        <strong className="text-label-sm text-[#1e1b18]">
          AI-generated — not a substitute for legal advice.
        </strong>{" "}
        Clarity is an educational translation companion to help you understand
        your documents clearly.
      </p>
    </div>
  );
}
