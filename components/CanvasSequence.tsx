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
  focalPointY?: "top" | "center";
  offsetY?: number;
}

export default function CanvasSequence({
  sequences,
  className = "",
  triggerRef,
  bgColor = "black",
  fitMode = "auto",
  lazy = false,
  focalPointY = "center",
  offsetY = 0,
}: CanvasSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
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
    [fitMode]
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

  const renderFrameIndex = useCallback(
    (
      targetIndex: number,
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      imgList: HTMLImageElement[]
    ) => {
      const best = getBestAvailableImage(targetIndex, imgList);
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

      if (
        canvasRef.current &&
        lastRenderedIndexRef.current !== null &&
        images[lastRenderedIndexRef.current]
      ) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          renderFrameIndex(
            lastRenderedIndexRef.current,
            ctx,
            canvasRef.current,
            images
          );
        }
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [images, renderFrameIndex]);

  // Load image sequence when active
  useEffect(() => {
    if (!shouldLoad) return;

    const loadedImages: HTMLImageElement[] = [];
    let globalFrameIndex = 0;

    sequences.forEach((seq) => {
      const ext = seq.extension || "jpg";
      const padLength = seq.digits ?? 3;
      const start = seq.startFrame || 1;
      for (let i = 0; i < seq.frameCount; i++) {
        const frameIndex = start + i;
        const img = new Image();
        const paddedIndex = frameIndex.toString().padStart(padLength, "0");
        img.src = `${seq.path}${paddedIndex}.${ext}`;

        const currentGlobalIndex = globalFrameIndex++;

        img.onload = () => {
          if (currentGlobalIndex === 0 && canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              renderFrameIndex(0, ctx, canvasRef.current, loadedImages);
            }
          }
        };
        loadedImages.push(img);
      }
    });

    setImages(loadedImages);
  }, [sequences, shouldLoad, renderFrameIndex]);

  // GSAP scroll-bound timeline
  useGSAP(
    () => {
      if (!triggerRef.current || images.length === 0 || !canvasRef.current)
        return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Render initial frame immediately once timeline binds
      renderFrameIndex(
        Math.round(frameRef.current.frame),
        ctx,
        canvas,
        images
      );

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        },
      });

      timeline.to(frameRef.current, {
        frame: totalFrames - 1,
        snap: "frame",
        ease: "none",
        onUpdate: () => {
          const currentFrame = Math.round(frameRef.current.frame);
          renderFrameIndex(currentFrame, ctx, canvas, images);
        },
      });

      return () => {
        timeline.kill();
      };
    },
    { dependencies: [images, triggerRef, renderFrameIndex], scope: triggerRef }
  );

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}
