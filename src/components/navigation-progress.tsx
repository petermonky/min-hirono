"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type ProgressState = "idle" | "starting" | "loading" | "complete";

const MINIMUM_VISIBLE_TIME = 180;
const COMPLETION_TIME = 180;
const SAFETY_TIMEOUT = 15_000;

function browserLocationKey() {
  return `${window.location.pathname}?${new URLSearchParams(window.location.search).toString()}`;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locationKey = `${pathname}?${searchParams.toString()}`;
  const previousLocation = useRef(locationKey);
  const stateRef = useRef<ProgressState>("idle");
  const startedAt = useRef(0);
  const animationFrame = useRef<number | null>(null);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<ProgressState>("idle");

  const clearTimers = useCallback(() => {
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
    if (completionTimer.current) clearTimeout(completionTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    animationFrame.current = null;
    completionTimer.current = null;
    hideTimer.current = null;
    safetyTimer.current = null;
  }, []);

  const finish = useCallback(() => {
    if (stateRef.current === "idle" || stateRef.current === "complete") return;
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
    animationFrame.current = null;
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    safetyTimer.current = null;

    const delay = Math.max(0, MINIMUM_VISIBLE_TIME - (performance.now() - startedAt.current));
    if (completionTimer.current) clearTimeout(completionTimer.current);
    completionTimer.current = setTimeout(() => {
      stateRef.current = "complete";
      setState("complete");
      hideTimer.current = setTimeout(() => {
        stateRef.current = "idle";
        setState("idle");
      }, COMPLETION_TIME);
    }, delay);
  }, []);

  const start = useCallback(() => {
    clearTimers();
    startedAt.current = performance.now();
    stateRef.current = "starting";
    setState("starting");
    animationFrame.current = requestAnimationFrame(() => {
      animationFrame.current = requestAnimationFrame(() => {
        stateRef.current = "loading";
        setState("loading");
        animationFrame.current = null;
      });
    });
    safetyTimer.current = setTimeout(finish, SAFETY_TIMEOUT);
  }, [clearTimers, finish]);

  useEffect(() => {
    if (previousLocation.current === locationKey) return;
    previousLocation.current = locationKey;
    finish();
  }, [finish, locationKey]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
      ) return;

      const element = event.target instanceof Element ? event.target.closest("a") : null;
      if (!element || element.hasAttribute("download")) return;
      if (element.target && element.target !== "_self") return;

      const href = element.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const destination = new URL(element.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (`${destination.pathname}${destination.search}` === `${window.location.pathname}${window.location.search}`) return;
      start();
    };

    const handleHistoryNavigation = () => {
      const routeAlreadyCommitted = previousLocation.current === browserLocationKey();
      start();
      if (routeAlreadyCommitted) finish();
    };
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handleHistoryNavigation);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handleHistoryNavigation);
      clearTimers();
    };
  }, [clearTimers, finish, start]);

  return (
    <div className="navigation-progress" data-state={state} aria-hidden="true">
      <span className="navigation-progress-bar" />
    </div>
  );
}
