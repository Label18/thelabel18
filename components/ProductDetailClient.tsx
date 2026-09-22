"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import { Product, ProductVariation } from "@/lib/supabase/products";
import { useAuth } from "@/contexts/AuthContext";

import { Sparkles, CheckCircle2, Shield, Award, Scissors, Share2 } from "lucide-react";

export default function ProductDetailClient({ product, initialColor }: { product: Product, initialColor?: string | null }) {
  const { openLoginModal } = useAuth();

  const variations = product.product_variations ?? [];

  const firstColor = initialColor || (variations.find((v) => v.color)?.color ?? null);
  const [selectedColor, setSelectedColor] = useState<string | null>(firstColor);

  const initialVariation = useMemo(() => {
    if (initialColor) {
      const match = variations.find(v => v.color === initialColor);
      if (match) return match;
    }
    return variations[0] ?? null;
  }, [initialColor, variations]);

  const [activeVariation, setActiveVariation] = useState<ProductVariation | null>(initialVariation);

  const images = useMemo(() => {
    const list: { src: string; color: string | null }[] = [];

    if (product.image_url) {
      list.push({ src: product.image_url, color: null });
    }

    const seen = new Set(list.map((i) => i.src));
    for (const v of variations as ProductVariation[]) {
      if (v.image_url && !seen.has(v.image_url)) {
        seen.add(v.image_url);
        list.push({ src: v.image_url, color: v.color });
      }
    }

    return list;
  }, [product, variations]);

  const initialImageIndex = useMemo(() => {
    if (!firstColor) return 0;
    const idx = images.findIndex((img) => img.color === firstColor);
    return idx !== -1 ? idx : 0;
  }, [images, firstColor]);

  const [activeImageIndex, setActiveImageIndex] = useState(initialImageIndex);

  const handleColorChange = useCallback((color: string | null) => {
    setSelectedColor((prev) => (prev === color ? prev : color));
    if (!color) return;

    const matchingImageIndex = images.findIndex((img) => img.color === color);
    if (matchingImageIndex !== -1) {
      setActiveImageIndex((prevIdx) => (prevIdx === matchingImageIndex ? prevIdx : matchingImageIndex));
    }
  }, [images]);

  const handleVariantChange = useCallback((variant: ProductVariation | null) => {
    setActiveVariation((prev) => (prev === variant ? prev : variant));
    if (variant?.color) {
      setSelectedColor((prev) => (prev === variant.color ? prev : variant.color));
      const matchingImageIndex = images.findIndex((img) => img.color === variant.color);
      if (matchingImageIndex !== -1) {
        setActiveImageIndex((prevIdx) => (prevIdx === matchingImageIndex ? prevIdx : matchingImageIndex));
      }
    }
  }, [images]);

  function handleThumbnailClick(index: number) {
    setActiveImageIndex(index);
    const targetColor = images[index]?.color;
    if (targetColor) {
      setSelectedColor(targetColor);
    }
  }

  // --- Share Logic ---
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share canceled or failed", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // --- Magnifier Logic ---
  const [magnifier, setMagnifier] = useState({ show: false, x: 0, y: 0, cursorX: 0, cursorY: 0 });

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const elem = e.currentTarget;
    const { top, left, width, height } = elem.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - left) / width) * 100;
    const y = ((clientY - top) / height) * 100;
    
    setMagnifier({
      show: true,
      x,
      y,
      cursorX: clientX - left,
      cursorY: clientY - top
    });
  };

  const hideMagnifier = () => setMagnifier(prev => ({ ...prev, show: false }));

  const hasNoVariations = variations.length === 0;
  const currentImage = images[activeImageIndex]?.src || product.image_url;

  return (
    <div className="w-full space-y-12">
      {/* Top Section: Gallery & Variant Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Mobile Title & SKU (Visible on mobile/tablet) */}
          <div className="block lg:hidden mb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#9c7d23] text-[9.5px] tracking-[0.25em] uppercase font-outfit font-semibold">
                <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                <span>SKU: {product.sku}</span>
              </div>
              <button 
                onClick={handleShare}
                className="p-2 rounded-full bg-white border border-[#D4AF37]/30 text-[#9c7d23] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all shadow-sm active:scale-95"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl tracking-wide uppercase text-[#1A1A1A] font-normal leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-4 items-start">

            {/* Small Thumbnails Column */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[580px] max-w-full pb-2 sm:pb-0 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleThumbnailClick(idx)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden border transition-all duration-300 ${
                      activeImageIndex === idx
                        ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-md scale-[1.02]"
                        : "border-[#D4AF37]/25 opacity-65 hover:opacity-100 hover:border-[#D4AF37]/60"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Big Image Container */}
            <div 
              className="relative flex-1 aspect-[3/4] max-h-[640px] w-full rounded-2xl overflow-hidden bg-white border border-[#D4AF37]/35 shadow-[0_8px_30px_rgba(212,175,55,0.08)] group cursor-crosshair touch-none"
              onMouseMove={handlePointerMove}
              onMouseEnter={() => setMagnifier(prev => ({ ...prev, show: true }))}
              onMouseLeave={hideMagnifier}
              onTouchMove={handlePointerMove}
              onTouchStart={() => setMagnifier(prev => ({ ...prev, show: true }))}
              onTouchEnd={hideMagnifier}
            >
              {/* Luxury Hallmark Overlay Badge */}
              <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#D4AF37]/40 text-[#F5E6C8] text-[9px] uppercase tracking-[0.2em] font-medium shadow-md pointer-events-none">
                <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                <span>Pure Mulberry Silk</span>
              </div>

              {currentImage ? (
                <>
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Full Container Magnifier */}
                  {magnifier.show && (
                    <div 
                      className="absolute inset-0 z-20 bg-white pointer-events-none"
                      style={{
                        backgroundImage: `url(${currentImage})`,
                        backgroundPosition: `${magnifier.x}% ${magnifier.y}%`,
                        backgroundSize: '250%',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1A1A1A]/40 text-xs uppercase tracking-[0.3em]">
                  No Image Available
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Title & Selector Card */}
        <div className="lg:col-span-5 bg-white border border-[#D4AF37]/35 p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgba(212,175,55,0.12)] transition-all">
          
          {/* Desktop Title & SKU (Hidden on mobile/tablet) */}
          <div className="hidden lg:block mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#9c7d23] text-[9.5px] tracking-[0.25em] uppercase font-outfit font-semibold">
                <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                <span>SKU: {product.sku}</span>
              </div>
              <button 
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#D4AF37]/30 text-[#9c7d23] text-xs font-medium uppercase tracking-wider hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all shadow-sm active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl tracking-wide uppercase text-[#1A1A1A] font-normal leading-tight">
              {product.name}
            </h1>
          </div>

          {hasNoVariations ? (
            <p className="text-xs tracking-[0.2em] uppercase font-outfit font-light text-[#1A1A1A]/50 py-4">
              This product has no purchasable options currently.
            </p>
          ) : (
            <ProductVariantSelector
              productId={product.id}
              productName={product.name}
              productImage={product.image_url}
              variations={variations}
              selectedColorProp={selectedColor}
              onColorChange={handleColorChange}
              onVariantChange={handleVariantChange}
              onRequireLogin={openLoginModal}
            />
          )}
        </div>

      </div>

      {/* Bottom Section: Description & Craftsmanship Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Description Box */}
        {product.description && (
          <div className="lg:col-span-8 bg-white border border-[#D4AF37]/35 p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#D4AF37]/25">
              <Sparkles className="w-4 h-4 text-[#9c7d23]" />
              <h2 className="text-xs uppercase tracking-[0.25em] font-outfit font-semibold text-[#9c7d23]">
                Atelier Narrative &amp; Craftsmanship
              </h2>
            </div>
            <p className="text-[#1A1A1A]/85 font-outfit font-light text-sm sm:text-[15px] leading-[2.1] tracking-wide whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* Heritage Specs & Reference Box */}
        <div className={`space-y-6 ${product.description ? "lg:col-span-4" : "lg:col-span-12"}`}>
          <div className="bg-white border border-[#D4AF37]/35 p-6 sm:p-8 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D4AF37]/25">
              <Award className="w-4 h-4 text-[#9c7d23]" />
              <h3 className="text-xs uppercase tracking-[0.25em] font-outfit font-semibold text-[#9c7d23]">
                Heritage Assurance
              </h3>
            </div>
            <ul className="space-y-3 text-xs font-outfit text-[#1A1A1A]/80">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#9c7d23] flex-shrink-0" />
                <span>100% Pure Mulberry Silk Mark</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#9c7d23] flex-shrink-0" />
                <span>Authentic Handloom Gold Zari Checks</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#9c7d23] flex-shrink-0" />
                <span>Handcrafted by Master Artisans</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#9c7d23] flex-shrink-0" />
                <span>Care: Professional Dry Clean Only</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-[#D4AF37]/35 p-5 sm:p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <span className="text-[10.5px] tracking-[0.25em] uppercase font-outfit font-medium text-[#1A1A1A]/60">
              Atelier Ref SKU
            </span>
            <span className="text-xs tracking-[0.2em] uppercase font-outfit font-bold text-[#9c7d23]">
              {(activeVariation as any)?.sku || product.sku}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}