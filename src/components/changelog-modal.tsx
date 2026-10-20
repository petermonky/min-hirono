"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { changelog } from "@/data/changelog";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function ChangelogModal({ onDismiss }: { onDismiss: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closingRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backdropPress = useRef(false);
  const [closing, setClosing] = useState(false);

  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialogRef.current?.close();
      return;
    }
    setClosing(true);
    // Still close if the browser does not dispatch the animation-end event.
    closeTimer.current = setTimeout(() => dialogRef.current?.close(), 150);
  };

  useEffect(() => {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const body = document.body;
    const root = document.documentElement;
    const previousPadding = body.style.paddingRight;
    const previousOverflow = root.style.overflow;
    const previousScrollBehavior = root.style.scrollBehavior;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    const paddingRight = parseFloat(getComputedStyle(body).paddingRight) || 0;

    // Lock the viewport without changing the sticky header's containing block.
    body.style.paddingRight = `${paddingRight + scrollbarWidth}px`;
    root.style.overflow = "hidden";
    const preventBackdropScroll = (event: TouchEvent) => {
      const dialog = dialogRef.current;
      const touch = event.touches[0];
      if (!dialog || !touch) return;
      const bounds = dialog.getBoundingClientRect();
      if (touch.clientX < bounds.left || touch.clientX > bounds.right || touch.clientY < bounds.top || touch.clientY > bounds.bottom) {
        event.preventDefault();
      }
    };
    document.addEventListener("touchmove", preventBackdropScroll, { passive: false });
    if (!dialogRef.current?.open) dialogRef.current?.showModal();

    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      document.removeEventListener("touchmove", preventBackdropScroll);
      body.style.paddingRight = previousPadding;
      root.style.overflow = previousOverflow;
      root.style.scrollBehavior = "auto";
      window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onDismiss}
      onCancel={(event) => { event.preventDefault(); requestClose(); }}
      onPointerDown={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        backdropPress.current = event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
      }}
      onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
        if (backdropPress.current && event.target === event.currentTarget && outside) requestClose();
        backdropPress.current = false;
      }}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && event.animationName === "changelog-out") dialogRef.current?.close();
      }}
      data-closing={closing}
      aria-labelledby="changelog-title"
      className="changelog-modal m-auto max-h-[calc(100dvh-40px)] w-[min(520px,calc(100%-40px))] overflow-y-auto overscroll-contain border border-ink bg-canvas p-0 text-ink"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-hairline bg-canvas px-6 py-4">
        <h2 id="changelog-title" className="display-sm">Changelog</h2>
        <button type="button" onClick={requestClose} aria-label="Close changelog" className="grid size-11 shrink-0 place-items-center">
          <Icon name="x" className="size-5" />
        </button>
      </div>
      <div className="px-6 pb-2">
        {changelog.map((release) => (
          <section key={release.date} aria-labelledby={`changelog-${release.date}`} className="border-b border-hairline py-6 last:border-b-0">
            <h3 id={`changelog-${release.date}`} className="mb-5 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase text-secondary">
              <time dateTime={release.date}>{dateFormatter.format(new Date(`${release.date}T12:00:00Z`))}</time>
              {release.status === "unreleased" && <span className="bg-canvas-soft px-2 py-1 text-mute">Unreleased</span>}
            </h3>
            <ul className="space-y-5">
              {release.updates.map((update) => (
                <li key={update.title}>
                  <h4 className="text-sm font-bold">{update.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-secondary">{update.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </dialog>
  );
}
