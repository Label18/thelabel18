"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export interface SequenceConfig {
  path: string; // e.g., "/sequence1/ezgif-frame-"
  frameCount: number; // e.g., 240
  extension?: string; // e.g., "png" or "jpg", defaults to "jpg"
  digits?: number; // e.g., 6, defaults to 3
  startFrame?: number; // e.g., 5, defaults to 1
}

interface CanvasSequenceProps {
  sequences: SequenceConfig[];
  className?: string;
  triggerRef: React.RefObject<HTMLElement | null>;
  bgColor?: string;
  fitMode?: "cover" | "contain-height" | "auto";
  lazy?: boolean;
  priority?: boolean;
  focalPointY?: "top" | "center";
  offsetY?: number;
}

/** How many frames to load in the initial high-priority batch */
const PRIORITY_BATCH = 5;
/** How many frames to load per background batch */
const BATCH_SIZE = 20;
/** Delay between background batches (ms) */
const BATCH_DELAY = 60;

export default function CanvasSequence({
  sequences,
  className = "",
  triggerRef,
  bgColor = "black",
  fitMode = "auto",
  lazy = false,
  priority = false,
  focalPointY = "center",
  offsetY = 0,
}: CanvasSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Stable ref for images — GSAP reads from this without re-binding
  const imagesRef = useRef<HTMLImageElement[]>([]);
  // Single boolean state to trigger initial GSAP bind (only fires once)
  const [imagesReady, setImagesReady] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const frameRef = useRef({ frame: 0 });
  const lastRenderedIndexRef = useRef<number | null>(null);

  const totalFrames = sequences.reduce((acc, seq) => acc + seq.frameCount, 0);

  // Lazy loading activation: observe triggerRef with generous margin
  useEffect(() => {
    if (!lazy || shouldLoad) return;

    const el = triggerRef.current;
    if (!el) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "1200px 0px" } // Start preloading 1200px before section comes into view
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy, shouldLoad, triggerRef]);

  const drawImageOnly = useCallback(
    (
      img: HTMLImageElement,
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement
    ) => {
      if (!img.naturalWidth || !img.naturalHeight) return;

      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const imgAspect = imgWidth / imgHeight;
      const canvasAspect = canvas.width / canvas.height;

      let ratio: number;
      let centerShift_x: number;
      let centerShift_y: number;

      if (fitMode === "cover") {
        const hRatio = canvas.width / imgWidth;
        const vRatio = canvas.height / imgHeight;
        ratio = Math.max(hRatio, vRatio);
        centerShift_x = (canvas.width - imgWidth * ratio) / 2;
        if (focalPointY === "top") {
          const scaledH = imgHeight * ratio;
          centerShift_y = scaledH > canvas.height
            ? Math.max(canvas.height - scaledH, offsetY)
            : offsetY;
        } else {
          centerShift_y = (canvas.height - imgHeight * ratio) / 2 + offsetY;
        }
      } else if (
        fitMode === "contain-height" ||
        (fitMode === "auto" && imgAspect < 0.9 && canvasAspect > imgAspect)
      ) {
        ratio = canvas.height / imgHeight;
        centerShift_x = (canvas.width - imgWidth * ratio) / 2;
        centerShift_y = offsetY;
      } else {
        const hRatio = canvas.width / imgWidth;
        const vRatio = canvas.height / imgHeight;
        ratio = Math.max(hRatio, vRatio);
        centerShift_x = (canvas.width - imgWidth * ratio) / 2;
        if (focalPointY === "top") {
          const scaledH = imgHeight * ratio;
          centerShift_y = scaledH > canvas.height
            ? Math.max(canvas.height - scaledH, offsetY)
            : offsetY;
        } else {
          centerShift_y = (canvas.height - imgHeight * ratio) / 2 + offsetY;
        }
      }

      ctx.drawImage(
        img,
        0,
        0,
        imgWidth,
        imgHeight,
        centerShift_x,
        centerShift_y,
        imgWidth * ratio,
        imgHeight * ratio
      );
    },
    [fitMode, focalPointY, offsetY]
  );

  // Finds closest loaded frame to avoid any blank/black screens during scroll
  const getBestAvailableImage = useCallback(
    (targetIndex: number, imgList: HTMLImageElement[]) => {
      if (!imgList || imgList.length === 0) return null;

      // 1. Requested frame is loaded and ready
      const target = imgList[targetIndex];
      if (target && target.complete && target.naturalWidth > 0) {
        return { img: target, index: targetIndex };
      }

      // 2. Search backwards for closest previously loaded frame
      for (let i = targetIndex - 1; i >= 0; i--) {
        const candidate = imgList[i];
        if (candidate && candidate.complete && candidate.naturalWidth > 0) {
          return { img: candidate, index: i };
        }
      }

      // 3. Fallback to last successfully rendered frame
      if (lastRenderedIndexRef.current !== null) {
        const last = imgList[lastRenderedIndexRef.current];
        if (last && last.complete && last.naturalWidth > 0) {
          return { img: last, index: lastRenderedIndexRef.current };
        }
      }

      // 4. Search forwards for any available frame (e.g. initial frames)
      for (let i = targetIndex + 1; i < imgList.length; i++) {
        const candidate = imgList[i];
        if (candidate && candidate.complete && candidate.naturalWidth > 0) {
          return { img: candidate, index: i };
        }
      }

      return null;
    },
    []
  );

  const renderFrame = useCallback(
    (
      targetIndex: number,
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement
    ) => {
      const best = getBestAvailableImage(targetIndex, imagesRef.current);
      if (!best) return; // Keep current canvas content if no frame is ready yet

      lastRenderedIndexRef.current = best.index;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.globalAlpha = 1;

      // Only fill background if image doesn't cover completely
      if (fitMode !== "cover" && bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      drawImageOnly(best.img, ctx, canvas);
    },
    [bgColor, drawImageOnly, fitMode, getBestAvailableImage]
  );

  // Set canvas dimensions immediately on mount and handle resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!canvasRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = window.innerWidth * dpr;
      canvasRef.current.height = window.innerHeight * dpr;

      if (canvasRef.current && lastRenderedIndexRef.current !== null) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          renderFrame(lastRenderedIndexRef.current, ctx, canvasRef.current);
        }
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [renderFrame]);

  // Build frame URLs once
  const buildFrameUrls = useCallback(() => {
    const urls: string[] = [];
    sequences.forEach((seq) => {
      const ext = seq.extension || "jpg";
      const padLength = seq.digits ?? 3;
      const start = seq.startFrame ?? 1;
      for (let i = 0; i < seq.frameCount; i++) {
        const frameIndex = start + i;
        const paddedIndex = frameIndex.toString().padStart(padLength, "0");
        urls.push(`${seq.path}${paddedIndex}.${ext}`);
      }
    });
    return urls;
  }, [sequences]);

  // Progressive image loading: load first PRIORITY_BATCH frames immediately,
  // then load remaining in batches of BATCH_SIZE with delays.
  // Images are stored in imagesRef (stable) — no state updates after initial bind.
  useEffect(() => {
    if (!shouldLoad) return;

    const urls = buildFrameUrls();
    const imgArray: HTMLImageElement[] = new Array(urls.length);
    imagesRef.current = imgArray;
    let cancelled = false;

    // Helper: load a single frame by index and return a promise
    const loadFrame = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        imgArray[index] = img;

        img.onload = () => {
          // Draw frame 0 to canvas immediately when it arrives
          if (index === 0 && canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              renderFrame(0, ctx, canvasRef.current);
            }
          }
          resolve();
        };
        img.onerror = () => resolve(); // Don't block batch on a single failure
        img.src = urls[index];
      });
    };

    // Phase 1: Load priority batch (first N frames) immediately
    const priorityEnd = Math.min(PRIORITY_BATCH, urls.length);
    const priorityPromises: Promise<void>[] = [];
    for (let i = 0; i < priorityEnd; i++) {
      priorityPromises.push(loadFrame(i));
    }

    // Once priority frames are loaded, signal GSAP to bind (one-time)
    Promise.all(priorityPromises).then(() => {
      if (cancelled) return;
      setImagesReady(true);

      // Phase 2: Load remaining frames in background batches
      // No state updates needed — GSAP reads directly from imagesRef
      let batchStart = priorityEnd;

      const loadNextBatch = () => {
        if (cancelled || batchStart >= urls.length) return;

        const batchEnd = Math.min(batchStart + BATCH_SIZE, urls.length);
        const batchPromises: Promise<void>[] = [];
        for (let i = batchStart; i < batchEnd; i++) {
          batchPromises.push(loadFrame(i));
        }

        batchStart = batchEnd;

        Promise.all(batchPromises).then(() => {
          if (cancelled) return;
          if (batchStart < urls.length) {
            if (typeof requestIdleCallback !== "undefined") {
              requestIdleCallback(() => setTimeout(loadNextBatch, BATCH_DELAY));
            } else {
              setTimeout(loadNextBatch, BATCH_DELAY);
            }
          }
        });
      };

      // Start background loading after a short pause to let the UI settle
      setTimeout(loadNextBatch, 100);
    });

    return () => {
      cancelled = true;
    };
  }, [shouldLoad, buildFrameUrls, renderFrame]);

  // GSAP scroll-bound timeline — binds once when imagesReady becomes true
  useGSAP(
    () => {
      if (!triggerRef.current || !imagesReady || !canvasRef.current)
        return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Render initial frame immediately once timeline binds
      renderFrame(
        Math.round(frameRef.current.frame),
        ctx,
        canvas
      );

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      timeline.to(frameRef.current, {
        frame: totalFrames - 1,
        snap: "frame",
        ease: "none",
        onUpdate: () => {
          const currentFrame = Math.round(frameRef.current.frame);
          renderFrame(currentFrame, ctx, canvas);
        },
      });

      return () => {
        timeline.kill();
      };
    },
    { dependencies: [imagesReady, triggerRef, renderFrame], scope: triggerRef }
  );

  return (
    <>
      {/* Preload hint for the very first frame when priority is set */}
      {priority && sequences[0] && (
        <link
          rel="preload"
          as="image"
          href={`${sequences[0].path}${(sequences[0].startFrame ?? 1).toString().padStart(sequences[0].digits ?? 3, "0")}.${sequences[0].extension || "jpg"}`}
        />
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover ${className}`}
      />
    </>
  );
}

