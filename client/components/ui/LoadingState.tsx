import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({
  message = "Loading...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 w-full py-12",
        className
      )}
    >
      <div className="w-10 h-10 border-4 border-[#bceed3] border-t-[#25533f] rounded-full animate-spin" />
      <span className="text-body-md text-[#414944]">{message}</span>
    </div>
  );
}
