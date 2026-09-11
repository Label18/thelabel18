"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import ProductVariantSelector from "@/components/ProductVariantSelector";
import { Product, ProductVariation } from "@/lib/supabase/products";
import { useAuth } from "@/contexts/AuthContext";

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

  const hasNoVariations = variations.length === 0;
  const currentImage = images[activeImageIndex]?.src || product.image_url;

  return (
    <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] py-12 px-6 lg:px-16 selection:bg-[#d4af37]/30 selection:text-[#1A1A1A]">
      <div className="max-w-[1400px] mx-auto space-y-10">

        {/* Top Section: Gallery & Variant Selector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* Left Column: Gallery & Mobile Title */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Mobile Title & SKU (Visible only on lg and below) */}
            <div className="block lg:hidden mb-2">
              <p className="text-[10px] sm:text-[10.5px] tracking-[0.4em] uppercase font-outfit font-medium text-[#9c7d23] mb-2">
                SKU: {product.sku}
              </p>
              <h1 className="font-normal text-2xl sm:text-3xl md:text-4xl tracking-[0.05em] uppercase text-[#1A1A1A]">
                {product.name}
              </h1>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-4">

            {/* Small Thumbnails Column */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px] max-w-full pb-2 sm:pb-0 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleThumbnailClick(idx)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 rounded overflow-hidden border transition-all ${activeImageIndex === idx
                      ? "border-[#9c7d23] ring-2 ring-[#9c7d23]/30 opacity-100"
                      : "border-[#1A1A1A]/15 opacity-60 hover:opacity-100"
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
            <div className="relative flex-1 aspect-[4/5] max-h-[520px] w-full rounded-lg overflow-hidden bg-white border border-[#1A1A1A]/10 shadow-sm">
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-all duration-500 ease-out"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1A1A1A]/40 text-xs uppercase tracking-[0.3em]">
                  No Image Available
                </div>
              )}
            </div>

          </div>

          </div>

          {/* Right Column: Title & Selector */}
          <div className="lg:col-span-5 bg-white/70 backdrop-blur-md border border-[#1A1A1A]/10 p-6 sm:p-8 md:p-10 rounded-lg shadow-sm">
            
            {/* Desktop Title & SKU (Hidden on lg and below) */}
            <div className="hidden lg:block">
              <p className="text-[10.5px] tracking-[0.4em] uppercase font-outfit font-medium text-[#9c7d23] mb-2">
                SKU: {product.sku}
              </p>
              <h1 className="font-normal text-3xl md:text-4xl tracking-[0.05em] uppercase text-[#1A1A1A] mb-6">
                {product.name}
              </h1>
            </div>

            {hasNoVariations ? (
              <p className="text-xs tracking-[0.2em] uppercase font-outfit font-light text-[#1A1A1A]/50 py-4">
                This product has no purchasable options yet.
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

        {/* Bottom Section: Description & Active Reference Boxes Sitting Below the Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-17 space-y-6">

            {/* Description Box */}
            {product.description && (
              <div className="bg-white/70 backdrop-blur-md border border-[#1A1A1A]/10 p-6 md:p-8 rounded-lg shadow-sm">
                <h2 className="text-[11px] tracking-[0.3em] uppercase font-outfit font-medium text-[#9c7d23] mb-3">
                  Description
                </h2>
                <p className="text-[#1A1A1A]/80 font-outfit font-light text-sm leading-[1.9] tracking-wide whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Active Reference Box */}
            <div className="bg-white/70 backdrop-blur-md border border-[#1A1A1A]/10 p-6 md:p-8 rounded-lg shadow-sm flex justify-between items-center">
              <span className="text-[10px] tracking-[0.3em] uppercase font-outfit font-medium text-[#1A1A1A]/50">
                Active Reference
              </span>
              <span className="text-[11px] tracking-[0.2em] uppercase font-outfit font-medium text-[#9c7d23]">
                {(activeVariation as any)?.sku || product.sku}
              </span>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}