"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryTree } from "@/lib/categories";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface HeroBannerProps {
  clothingCategory?: CategoryTree;
  jewelleryCategory?: CategoryTree;
}

const slides = [
  {
    id: "saree",
    badge: "THE LABEL 18 • HANDLOOM SILKS",
    slideNumber: "01",
    totalSlides: "03",
    line1: "ROYAL HERITAGE",
    line2: "SILK SAREES",
    subtitle: "Pure Mulberry Silk • Authentic Gold Zari",
    description: "Timeless royal drapes woven with metallic gold zari checks and an authentic heirloom pallu.",
    image: "/images/thelabel18_saree_clean.jpg",
    objectPosition: "object-top",
    modelTag: "Brand Shoot",
    lookTitle: "Royal Sapphire Silk Drape",
    lookSubtitle: "Pure Handloom Zari with Artisanal Blouse",
    tabLabel: "Sarees",
    craftBadges: ["Pure Silk", "Gold Zari", "Handloom"],
    ctaPrimary: "Explore Sarees",
    ctaSecondary: "View Clothing",
    glowColor: "rgba(212, 175, 55, 0.22)",
  },
  {
    id: "jewellery",
    badge: "THE LABEL 18 • HEIRLOOM EDITIONS",
    slideNumber: "02",
    totalSlides: "03",
    line1: "FINE HEIRLOOM",
    line2: "JEWELLERY",
    subtitle: "Polki Diamonds • Colombian Emeralds • 22K Gold",
    description: "Mastercrafted heirloom ornaments forged with uncut diamonds and precious gemstones.",
    image: "/images/jellwerys.jpg",
    objectPosition: "object-[85%_center]",
    modelTag: "Heirloom Edition",
    lookTitle: "Royal Gold Choker & Earrings",
    lookSubtitle: "22K Gold Bridal Heritage Set",
    tabLabel: "Jewellery",
    craftBadges: ["22K Gold", "Certified Gems", "Hand-set Polki"],
    ctaPrimary: "Explore Jewellery",
    ctaSecondary: "View Ornaments",
    glowColor: "rgba(220, 160, 60, 0.25)",
  },
  {
    id: "couture",
    badge: "THE LABEL 18 • HAUTE COUTURE",
    slideNumber: "03",
    totalSlides: "03",
    line1: "IMPERIAL ZARDOZI",
    line2: "COUTURE",
    subtitle: "Sage Raw Silk • Intricate Pearl Needlework",
    description: "Hand-embroidered by veteran karigars using pearls, sequins, and metallic needlework.",
    image: "/images/thelabel18_couture_clean.jpg",
    objectPosition: "object-top",
    modelTag: "Brand Shoot",
    lookTitle: "Sage Green Zardozi Ensemble",
    lookSubtitle: "Embroidered Raw Silk with Chiffon Dupatta",
    tabLabel: "Couture",
    craftBadges: ["Zardozi Work", "Raw Silk", "Bespoke Fit"],
    ctaPrimary: "Explore Couture",
    ctaSecondary: "Bespoke Fitting",
    glowColor: "rgba(180, 195, 140, 0.22)",
  },
];

export default function HeroBanner({ clothingCategory, jewelleryCategory }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const slideDuration = 3000; // Exact 3-second cycle
  const tickInterval = 30;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  }, []);

  // 3-second continuous rotation
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (tickInterval / slideDuration) * 100;
      });
    }, tickInterval);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const active = slides[currentSlide];

  const getPrimaryHref = (idx: number) => {
    if (idx === 1) {
      return jewelleryCategory ? `/categories/${jewelleryCategory.id}` : "/shop?category=jewellery";
    }
    return clothingCategory ? `/categories/${clothingCategory.id}` : "/shop?category=clothing";
  };

  const getSecondaryHref = (idx: number) => {
    if (idx === 1) return "/shop?category=jewellery";
    return "/shop?category=clothing";
  };

  return (
    <section
      className="relative w-full bg-[#080808] text-white overflow-hidden pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-8 border-b border-[#222]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="The Label 18 Hero Showcase"
    >
      {/* 1. Dynamic Ambient Colored Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentSlide ? "opacity-25" : "opacity-0"
            }`}
          >
            <div
              className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-[130px]"
              style={{ background: s.glowColor }}
            />
            <div
              className="absolute -bottom-1/4 -left-1/4 w-[45vw] h-[45vw] rounded-full blur-[110px]"
              style={{ background: s.glowColor }}
            />
          </div>
        ))}

        {/* Fine gold stardust grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/90 via-transparent to-[#080808]" />
      </div>

      {/* 2. Main Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
          
          {/* Left Column: Clean 2-Line Headline, Concise Text & Independent Rows (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1">
            
            {/* Top Bar: Compact Badge & Slide Counter */}
            <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-[#F5E6C8] text-[9px] sm:text-[10px] uppercase tracking-[0.18em] font-medium shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                <span>{active.badge}</span>
              </div>

              {/* Minimalist 01 / 03 Counter */}
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-white/50 tracking-widest">
                <span className="text-[#D4AF37] font-semibold text-xs">{active.slideNumber}</span>
                <span className="w-4 h-[1px] bg-[#D4AF37]/40" />
                <span>{active.totalSlides}</span>
              </div>
            </div>

            {/* Main Headline - Strict 2 Distinct Lines with Regal Typography (No font distortion) */}
            <h1 className="mb-2 sm:mb-2.5">
              <span className="block font-outfit text-lg sm:text-2xl lg:text-3xl font-light tracking-[0.14em] uppercase text-white/90 leading-tight">
                {active.line1}
              </span>
              <span className="block font-outfit text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.08em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FBF5E8] via-[#E6C35C] to-[#C59B27] drop-shadow-[0_2px_15px_rgba(212,175,55,0.35)] leading-tight mt-0.5">
                {active.line2}
              </span>
            </h1>

            {/* Subtitle Accent Line */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 sm:w-7 h-[1.5px] bg-[#D4AF37] shrink-0" />
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#E6C35C] font-medium">
                {active.subtitle}
              </p>
            </div>

            {/* Concise 1-Sentence Narrative */}
            <p className="text-white/80 text-[11px] sm:text-xs md:text-sm font-light leading-relaxed mb-3 max-w-lg">
              {active.description}
            </p>

            {/* Compact Craft Highlight Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3.5 sm:mb-4">
              {active.craftBadges.map((craft, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/75 text-[9px] sm:text-[10px] tracking-wider"
                >
                  <Sparkles className="w-2 h-2 text-[#D4AF37]" />
                  <span>{craft}</span>
                </div>
              ))}
            </div>

            {/* Dedicated Row 1: ACTION BUTTONS ONLY */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3.5 mb-3 sm:mb-4">
              <Link
                href={getPrimaryHref(currentSlide)}
                className="justify-center group inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#F5E6C8] via-[#E6C35C] to-[#D4AF37] text-black font-semibold text-[10px] sm:text-xs tracking-[0.14em] uppercase shadow-[0_4px_18px_rgba(212,175,55,0.4)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.6)] transition-all duration-300 active:scale-95"
              >
                <span>{active.ctaPrimary}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href={getSecondaryHref(currentSlide)}
                className="justify-center inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-full bg-black/50 backdrop-blur-md border border-[#D4AF37]/40 text-[#F5E6C8] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] font-medium text-[10px] sm:text-xs tracking-[0.14em] uppercase transition-all duration-300 active:scale-95"
              >
                <span>{active.ctaSecondary}</span>
              </Link>
            </div>

            {/* Dedicated Row 2: SEPARATE SLIDE NAVIGATION DOCK */}
            <div className="flex items-center justify-between sm:justify-start gap-2 pt-2 border-t border-white/10">
              {/* Slide Tabs Switcher */}
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/15">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentSlide(idx);
                      setProgress(0);
                    }}
                    className={`px-3 py-1 rounded-full text-[9px] sm:text-[10px] uppercase tracking-[0.12em] transition-all duration-300 ${
                      currentSlide === idx
                        ? "bg-gradient-to-r from-[#F5E6C8] to-[#D4AF37] text-black font-bold shadow-sm"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {s.tabLabel}
                  </button>
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-1">
                <button
                  onClick={prevSlide}
                  aria-label="Previous Slide"
                  className="w-7 h-7 rounded-full text-white/70 hover:text-white hover:bg-white/10 border border-white/15 flex items-center justify-center transition-all active:scale-90"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next Slide"
                  className="w-7 h-7 rounded-full text-white/70 hover:text-white hover:bg-white/10 border border-white/15 flex items-center justify-center transition-all active:scale-90"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3-Second Autoplay Progress Indicator */}
            <div className="w-full max-w-xs mt-2 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F5E6C8] to-[#D4AF37] transition-all duration-30 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

          </div>

          {/* Right Column: Framed Portrait Showcase (Scaled Down for Refined Proportions) */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center items-center">
            <div className="relative w-full max-w-[210px] sm:max-w-[240px] md:max-w-[260px] lg:max-w-[300px] xl:max-w-[320px] group">
              
              {/* Outer Golden Aura Glow */}
              <div
                className="absolute -inset-1.5 rounded-2xl opacity-40 blur-lg transition-all duration-700 group-hover:opacity-60"
                style={{ background: active.glowColor }}
              />

              {/* Luxury Frame Container */}
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-[#D4AF37]/50 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.9)] bg-[#121212]">
                
                {/* Image Aspect Ratio Box (Compact & Elegant) */}
                <div className="relative w-full aspect-[3/3.8] overflow-hidden bg-neutral-950">
                  {slides.map((s, idx) => {
                    const isActive = idx === currentSlide;
                    return (
                      <div
                        key={s.id}
                        className={`absolute inset-0 transition-all duration-700 ease-out ${
                          isActive
                            ? "opacity-100 scale-100 pointer-events-auto"
                            : "opacity-0 scale-105 pointer-events-none"
                        }`}
                      >
                        <Image
                          src={s.image}
                          alt={`${s.line1} ${s.line2} - The Label 18`}
                          fill
                          priority={idx === 0}
                          sizes="(max-width: 640px) 210px, (max-width: 1024px) 260px, 320px"
                          className={`object-cover ${s.objectPosition} transition-transform duration-[3000ms] group-hover:scale-105`}
                        />
                        {/* Gentle bottom gradient for caption clarity */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                      </div>
                    );
                  })}

                  {/* Top-Right Seal Badge */}
                  <div className="absolute top-2 right-2 z-20">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-[#D4AF37]/60 shadow text-[8px] sm:text-[9px] tracking-[0.16em] uppercase text-[#F5E6C8] font-medium">
                      <Sparkles className="w-2 h-2 text-[#D4AF37]" />
                      <span>The Label 18 Original</span>
                    </div>
                  </div>

                  {/* Bottom Floating Look Card */}
                  <div className="absolute bottom-2 left-2 right-2 z-20">
                    <div className="p-2 rounded-lg bg-black/80 backdrop-blur-md border border-[#D4AF37]/40 shadow-lg">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[8px] font-mono tracking-[0.18em] uppercase text-[#D4AF37]">
                          ✦ {active.modelTag}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider text-white/50">
                          {active.tabLabel}
                        </span>
                      </div>
                      <h3 className="font-outfit text-[11px] sm:text-xs font-medium text-white tracking-wide leading-tight truncate">
                        {active.lookTitle}
                      </h3>
                      <p className="text-[9px] text-white/70 tracking-wide font-light truncate mt-0.5">
                        {active.lookSubtitle}
                      </p>
                    </div>
                  </div>

                  {/* Subtle Gold Corner Accents */}
                  <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#D4AF37]/60 pointer-events-none" />
                  <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#D4AF37]/60 pointer-events-none" />
                  <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#D4AF37]/60 pointer-events-none" />
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#D4AF37]/60 pointer-events-none" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
