"use client";

import { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// --- Context for programmatic navigation (router.push) ---
const NavProgressCtx = createContext<{ start: () => void }>({ start: () => {} });
export const useNavigationProgress = () => useContext(NavProgressCtx);

export function NavigationProgressProvider({ children }: { children: React.ReactNode }) {
  const [navigating, setNavigating] = useState(false);
  const start = useCallback(() => setNavigating(true), []);
  const done = useCallback(() => setNavigating(false), []);

  return (
    <NavProgressCtx.Provider value={{ start }}>
      {children}
      <ProgressBar navigating={navigating} onDone={done} />
    </NavProgressCtx.Provider>
  );
}

// --- Progress bar visual ---
function ProgressBar({ navigating, onDone }: { navigating: boolean; onDone: () => void }) {
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "loading" | "complete">("idle");
  const prevPathname = useRef(pathname);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Start on programmatic trigger
  useEffect(() => {
    if (navigating && state === "idle") {
      setState("loading");
    }
  }, [navigating, state]);

  // Detect link clicks (covers all <Link> components automatically)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("#")) return;

      // Skip same-page links
      const targetPath = href.split("?")[0].split("#")[0];
      const currentPath = window.location.pathname;
      if (targetPath === currentPath) return;

      // Skip if modifier keys held (new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;

      setState("loading");
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  // Detect browser back/forward
  useEffect(() => {
    function handlePopState() {
      setState("loading");
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Complete when pathname changes
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;

      if (state === "loading") {
        setState("complete");
        onDone();
        timeoutRef.current = setTimeout(() => setState("idle"), 400);
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname, state, onDone]);

  if (state === "idle") return null;

  return (
    <div
      className={`fixed top-0 left-0 h-[2.5px] z-[9999] nav-progress-bar ${
        state === "loading" ? "nav-progress-loading" : "nav-progress-complete"
      }`}
      style={{
        background: "rgb(126, 34, 206)",
        boxShadow: "0 0 8px rgba(126, 34, 206, 0.4)",
      }}
    />
  );
}
