import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#fbf2ed] mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-5 text-[#414944]">
        <div className="flex items-center gap-3">
          <span className="text-headline-sm text-[#25533f]">Clarity</span>
          <span className="text-body-sm">© 2025 · Making legal dignity universal.</span>
        </div>
        <div className="flex items-center gap-6 text-label-sm">
          <Link href="/privacy" className="hover:text-[#25533f] transition-colors">
            Privacy Manifesto
          </Link>
          <span className="text-[#c0c9c2]">•</span>
          <Link href="/accessibility" className="hover:text-[#25533f] transition-colors">
            Accessibility
          </Link>
          <span className="text-[#c0c9c2]">•</span>
          <Link href="/legal-aid" className="hover:text-[#25533f] transition-colors">
            Legal Aid Directory
          </Link>
        </div>
      </div>
    </footer>
  );
}
