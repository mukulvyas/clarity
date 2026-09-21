"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/app/auth/actions";
import { MOCK_DOCUMENT_ID } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const pathname = usePathname();
  const [fontSizeLevel, setFontSizeLevel] = useState<"sm" | "md" | "lg">("md");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [user, setUser] = useState<{
    fullName: string;
    email: string;
    initial: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const meta = user.user_metadata || {};
        const first = meta.first_name || "";
        const last = meta.last_name || "";
        const fullName = meta.full_name || [first, last].filter(Boolean).join(" ") || user.email?.split("@")[0] || "User";
        const email = user.email || "";
        const initial = (first[0] || fullName[0] || "U").toUpperCase();
        setUser({ fullName, email, initial });
      } else {
        setUser(null);
      }
    }
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const first = meta.first_name || "";
        const last = meta.last_name || "";
        const fullName = meta.full_name || [first, last].filter(Boolean).join(" ") || session.user.email?.split("@")[0] || "User";
        const email = session.user.email || "";
        const initial = (first[0] || fullName[0] || "U").toUpperCase();
        setUser({ fullName, email, initial });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const docIdMatch = pathname.match(/^\/documents\/([^\/]+)/);
  const activeDocumentId = docIdMatch ? docIdMatch[1] : MOCK_DOCUMENT_ID;

  // Global font size adjustment on document body
  const handleFontSizeChange = (level: "sm" | "md" | "lg") => {
    setFontSizeLevel(level);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (level === "sm") root.style.fontSize = "14px";
      if (level === "md") root.style.fontSize = "16px";
      if (level === "lg") root.style.fontSize = "18px";
    }
  };

  // Text-To-Speech Read Aloud toggle
  const toggleReadAloud = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const pageText = document.body.innerText.slice(0, 500);
      const utterance = new SpeechSynthesisUtterance(
        `Reading screen summary: ${pageText.replace(/\n+/g, " ")}`
      );
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const NAV_ITEMS = [
    { label: "Home / Upload", href: "/", match: /^\/$/ },
    {
      label: "My Documents",
      href: "/documents",
      match: /^\/documents(\/|$)/,
    },
    { label: "Compare", href: "/compare", match: /^\/compare/ },
    {
      label: "Ask Clarity",
      href: `/documents/${activeDocumentId}/chat`,
      match: /^\/chat|^\/documents\/[^\/]+\/chat/,
    },
    {
      label: "Action Plan",
      href: `/documents/${activeDocumentId}/action-plan`,
      match: /^\/action-plan|^\/documents\/[^\/]+\/action-plan/,
    },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_12px_rgba(44,40,37,0.04)]">
      <div className="h-20 max-w-7xl mx-auto px-gutter flex items-center justify-between gap-space-md">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-space-sm shrink-0 group">
          <ClarityLogo />
          <div className="hidden sm:flex flex-col">
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight group-hover:text-primary-container transition-colors">
              Clarity
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
              Personal Legal Companion
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Pill */}
        <nav className="hidden xl:flex items-center gap-1.5 p-1 rounded-full bg-surface-container-low">
          {NAV_ITEMS.map((item) => {
            const isActive = item.match.test(pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "px-4 py-2 rounded-full font-label-md text-label-md transition-all",
                  isActive
                    ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-space-sm shrink-0">
          {/* Private & Encrypted Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest shadow-[0_2px_8px_rgba(44,40,37,0.03)]">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Private &amp; Encrypted
            </span>
          </div>

          {/* Text Size Magnification Control */}
          <div className="hidden md:flex items-center rounded-full bg-surface-container p-1">
            <button
              onClick={() => handleFontSizeChange("sm")}
              className={cn(
                "px-2 py-1 rounded-full font-label-sm text-label-sm transition-colors",
                fontSizeLevel === "sm"
                  ? "bg-surface-container-lowest text-primary font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                  : "text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface"
              )}
              type="button"
              aria-label="Small font size"
            >
              A-
            </button>
            <button
              onClick={() => handleFontSizeChange("md")}
              className={cn(
                "px-2.5 py-1 rounded-full font-label-sm text-label-sm transition-colors",
                fontSizeLevel === "md"
                  ? "bg-surface-container-lowest text-primary font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                  : "text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface"
              )}
              type="button"
              aria-label="Default font size"
            >
              A
            </button>
            <button
              onClick={() => handleFontSizeChange("lg")}
              className={cn(
                "px-2 py-1 rounded-full font-label-sm text-label-sm transition-colors",
                fontSizeLevel === "lg"
                  ? "bg-surface-container-lowest text-primary font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                  : "text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface"
              )}
              type="button"
              aria-label="Large font size"
            >
              A+
            </button>
          </div>

          {/* Read Aloud Button */}
          <button
            onClick={toggleReadAloud}
            className={cn(
              "hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-label-sm text-label-sm transition-all shadow-[0_2px_8px_rgba(44,40,37,0.04)]",
              isSpeaking
                ? "bg-tertiary-fixed text-on-tertiary-fixed-variant animate-pulse"
                : "bg-primary-fixed text-on-primary-fixed-variant hover:bg-primary-fixed-dim"
            )}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSpeaking ? "stop" : "graphic_eq"}
            </span>
            <span>{isSpeaking ? "Pause Audio" : "Read Aloud"}</span>
          </button>

          {/* Account Profile Dropdown */}
          {user ? (
            <div className="relative group pl-1">
              <button
                className="flex items-center gap-1 p-1 rounded-full hover:bg-surface-container transition-colors"
                aria-label="User profile menu"
              >
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-semibold ring-2 ring-surface-container">
                  {user.initial}
                </div>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  expand_more
                </span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(44,40,37,0.12)] border border-surface-container-highest opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
                <div className="px-3 py-2 border-b border-surface-container">
                  <p className="font-label-md text-label-md text-on-surface truncate">{user.fullName}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{user.email}</p>
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full text-left px-3 py-2.5 rounded-xl font-label-md text-label-md text-error hover:bg-surface-container transition-colors flex items-center gap-2 mt-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Log out
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2">
              <Link
                href="/login"
                className="font-label-md text-label-md text-on-surface hover:text-primary transition-colors px-3 py-1.5 rounded-full"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="font-label-md text-label-md bg-primary text-on-primary px-3.5 py-1.5 rounded-full hover:bg-primary-container transition-colors shadow-sm"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <MobileMenu pathname={pathname} navItems={NAV_ITEMS} />
        </div>
      </div>
    </header>
  );
}

function ClarityLogo() {
  return (
    <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
      <svg
        className="w-6 h-6 text-on-primary"
        fill="none"
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect fill="#F5ECE7" height="52" rx="6" width="44" x="18" y="14" />
        <path
          d="M28 28H52M28 36H46M28 44H40"
          stroke="#3E6B56"
          strokeLinecap="round"
          strokeWidth="3.5"
        />
        <circle cx="56" cy="22" fill="#FEA047" r="9" />
      </svg>
    </div>
  );
}

function MobileMenu({
  pathname,
  navItems,
}: {
  pathname: string;
  navItems: any[];
}) {
  return (
    <div className="xl:hidden">
      <details className="relative">
        <summary className="list-none cursor-pointer p-2 rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-[24px] text-on-surface-variant">
            menu
          </span>
        </summary>
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(44,40,37,0.12)] border border-surface-container-highest p-2 z-50">
          {navItems.map((item) => {
            const isActive = item.match.test(pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "block px-4 py-3 rounded-xl font-label-md text-label-md transition-colors",
                  isActive
                    ? "bg-primary-fixed text-on-primary-fixed-variant font-semibold"
                    : "text-on-surface hover:bg-surface-container"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </details>
    </div>
  );
}
