"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { constrain, pinchCrop } from "@/lib/avatar-crop";
import type { Crop, Point } from "@/lib/avatar-crop";

const INITIAL_CROP: Crop = { x: 0.5, y: 0.5, zoom: 1 };

export function AvatarEditor({ file, onCancel, onSaved }: { file: File; onCancel: () => void; onSaved: (path: string) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overviewRef = useRef<HTMLCanvasElement>(null);
  const overviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeInteractions = useRef(new Set<"pan" | "zoom">());
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pointers = useRef(new Map<number, Point>());
  const cropRef = useRef(INITIAL_CROP);
  const [crop, setCrop] = useState(INITIAL_CROP);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [overviewVisible, setOverviewVisible] = useState(false);

  const changeCrop = (update: Crop | ((current: Crop) => Crop)) => {
    const next = typeof update === "function" ? update(cropRef.current) : update;
    cropRef.current = next;
    setCrop(next);
  };

  const showOverview = () => {
    if (overviewTimer.current) clearTimeout(overviewTimer.current);
    setOverviewVisible(true);
    if (!activeInteractions.current.size) {
      overviewTimer.current = setTimeout(() => setOverviewVisible(false), 650);
    }
  };

  const beginInteraction = (kind: "pan" | "zoom") => {
    activeInteractions.current.add(kind);
    showOverview();
  };

  const endInteraction = (kind: "pan" | "zoom") => {
    activeInteractions.current.delete(kind);
    showOverview();
  };

  useEffect(() => () => {
    if (overviewTimer.current) clearTimeout(overviewTimer.current);
  }, []);

  useEffect(() => {
    dialogRef.current?.showModal();
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      if (image.naturalWidth * image.naturalHeight > 40_000_000) {
        setError("Choose an image smaller than 40 megapixels.");
        return;
      }
      imageRef.current = image;
      setReady(true);
    };
    image.onerror = () => setError("This image could not be opened. Try a JPEG, PNG, or WebP image.");
    image.src = url;
    return () => {
      image.onload = null;
      image.onerror = null;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    const image = imageRef.current;
    const context = canvasRef.current?.getContext("2d");
    if (!ready || !image || !context) return;
    const side = Math.min(image.naturalWidth, image.naturalHeight) / crop.zoom;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 512, 512);
    context.imageSmoothingQuality = "high";
    context.drawImage(image, crop.x * image.naturalWidth - side / 2, crop.y * image.naturalHeight - side / 2, side, side, 0, 0, 512, 512);

    const overview = overviewRef.current?.getContext("2d");
    if (!overview) return;
    const scale = 256 / Math.max(image.naturalWidth, image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const left = (256 - width) / 2;
    const top = (256 - height) / 2;
    const cropLeft = left + (crop.x * image.naturalWidth - side / 2) * scale;
    const cropTop = top + (crop.y * image.naturalHeight - side / 2) * scale;
    const cropSize = side * scale;
    overview.fillStyle = "#111111";
    overview.fillRect(0, 0, 256, 256);
    overview.imageSmoothingQuality = "high";
    overview.drawImage(image, left, top, width, height);
    overview.beginPath();
    overview.rect(left, top, width, height);
    overview.rect(cropLeft, cropTop, cropSize, cropSize);
    overview.fillStyle = "rgba(0, 0, 0, 0.4)";
    overview.fill("evenodd");
    overview.strokeStyle = "#ffffff";
    const outlineWidth = Math.min(5, cropSize / 3);
    overview.lineWidth = outlineWidth;
    // Inset the outline so it stays visible when the crop touches an image edge.
    overview.strokeRect(cropLeft + outlineWidth / 2, cropTop + outlineWidth / 2, cropSize - outlineWidth, cropSize - outlineWidth);
  }, [crop, ready]);

  const drag = (event: PointerEvent<HTMLCanvasElement>) => {
    const previousPoint = pointers.current.get(event.pointerId);
    const image = imageRef.current;
    if (!previousPoint || !image || saving) return;
    const previousPoints = [...pointers.current.values()];
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const frame = event.currentTarget.getBoundingClientRect();
    if (pointers.current.size === 2) {
      changeCrop(pinchCrop(cropRef.current, previousPoints as [Point, Point], [...pointers.current.values()] as [Point, Point], frame, image));
      return;
    }
    const current = cropRef.current;
    const side = Math.min(image.naturalWidth, image.naturalHeight) / current.zoom;
    changeCrop(constrain({
      ...current,
      x: current.x - (event.clientX - previousPoint.x) / frame.width * side / image.naturalWidth,
      y: current.y - (event.clientY - previousPoint.y) / frame.height * side / image.naturalHeight,
    }, image));
  };

  const endPointer = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!pointers.current.delete(event.pointerId)) return;
    if (!pointers.current.size) endInteraction("pan");
  };

  const save = async () => {
    if (!canvasRef.current || !ready || saving) return;
    setSaving(true);
    setError("");
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current!.toBlob((result) => result ? resolve(result) : reject(new Error("Could not prepare the image.")), "image/webp", 0.88);
      });
      const form = new FormData();
      form.set("image", blob, "avatar.webp");
      const response = await fetch("/api/account/avatar", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save your profile picture.");
      onSaved(result.avatarPath);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your profile picture.");
      setSaving(false);
    }
  };

  return (
    <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); if (!saving) onCancel(); }} aria-labelledby="avatar-title" aria-describedby="avatar-instructions" className="m-auto max-h-[calc(100dvh-32px)] w-[min(400px,calc(100%-32px))] overflow-y-auto border border-ink bg-canvas p-5 text-ink backdrop:bg-black/40">
      <h2 id="avatar-title" className="title-text">Profile picture</h2>
      <p id="avatar-instructions" className="mb-5 mt-2 text-xs text-secondary">Drag to position. Pinch or use the slider to zoom.</p>
      <div className="relative">
      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        tabIndex={ready && !saving ? 0 : -1}
        role="img"
        aria-label="Profile picture crop. The circle previews your displayed picture. Use arrow keys to reposition."
        className={`block aspect-square w-full touch-none border border-hairline bg-canvas-soft ${saving ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"}`}
        onKeyDown={(event) => {
          const image = imageRef.current;
          const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
          if (!image || !directions[event.key] || saving) return;
          event.preventDefault();
          showOverview();
          const [dx, dy] = directions[event.key];
          changeCrop((current) => constrain({ ...current, x: current.x + dx * 0.02 / current.zoom, y: current.y + dy * 0.02 / current.zoom }, image));
        }}
        onPointerDown={(event) => {
          if (!ready || saving || event.button !== 0 || pointers.current.size >= 2) return;
          if (event.pointerType !== "touch" && !event.isPrimary) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
          beginInteraction("pan");
        }}
        onPointerMove={drag}
        onLostPointerCapture={endPointer}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      />
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-px h-[calc(100%-2px)] w-[calc(100%-2px)]" aria-hidden="true">
          <path d="M0 0H100V100H0Z M50 0A50 50 0 0 1 50 100A50 50 0 0 1 50 0Z" fill="black" fillOpacity="0.5" fillRule="evenodd" />
          <circle cx="50" cy="50" r="49.8" fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <canvas ref={overviewRef} width={256} height={256} aria-hidden="true" className={`pointer-events-none absolute right-3 top-3 aspect-square w-1/4 max-w-24 border border-white/70 bg-ink shadow-sm transition-opacity duration-200 ${ready && overviewVisible && !saving ? "opacity-100" : "opacity-0"}`} />
      </div>
      <label htmlFor="avatar-zoom" className="mt-5 block text-[10px] font-bold uppercase text-secondary">Zoom</label>
      <input id="avatar-zoom" type="range" min="1" max="4" step="0.01" value={crop.zoom} disabled={!ready || saving} className="mt-2 h-8 w-full accent-ink" onPointerDown={(event) => {
        if (!ready || saving) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        beginInteraction("zoom");
      }} onPointerUp={() => endInteraction("zoom")} onPointerCancel={() => endInteraction("zoom")} onLostPointerCapture={() => {
        if (activeInteractions.current.has("zoom")) endInteraction("zoom");
      }} onChange={(event) => {
        const image = imageRef.current;
        if (image) {
          showOverview();
          changeCrop((current) => constrain({ ...current, zoom: Number(event.target.value) }, image));
        }
      }} />
      <p role="alert" className="mt-2 min-h-5 text-xs text-error">{error}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" disabled={saving} onClick={onCancel} className="chunky-button h-11 bg-canvas text-[10px] uppercase">Cancel</button>
        <button type="button" disabled={!ready || saving} onClick={save} className="chunky-button h-11 border-ink bg-ink text-[10px] uppercase text-canvas">{saving ? "Saving…" : "Save"}</button>
      </div>
    </dialog>
  );
}
