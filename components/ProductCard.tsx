"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { ProductWithPrice } from "@/lib/supabase/products";
import MiniWishlistButton from "./MiniWishlistButton";
import MiniCartButton from "./MiniCartButton";

export default function ProductCard({ product }: { product: ProductWithPrice }) {
  const defaultImage = product.image_url || product.product_variations[0]?.image_url;

  // Extract unique colors that have an associated image or hex code
  const colorVariations = useMemo(() => {
    if (!product.product_variations) return [];
    const uniqueColors = new Map<string, { hex: string; img: string | null }>();

    product.product_variations.forEach(v => {
      if (v.color && v.color_hex && !uniqueColors.has(v.color)) {
        uniqueColors.set(v.color, {
          hex: v.color_hex,
          img: v.image_url || null
        });
      }
    });

    return Array.from(uniqueColors.entries()).map(([color, data]) => ({
      color,
      hex: data.hex,
      img: data.img
    }));
  }, [product.product_variations]);

  const sizeVariations = useMemo(() => {
    if (!product.product_variations) return [];
    // Only extract sizes if there are no colors
    if (colorVariations.length > 0) return [];

    const uniqueSizes = new Set<string>();
    product.product_variations.forEach(v => {
      if (v.size) uniqueSizes.add(v.size);
    });

    return Array.from(uniqueSizes);
  }, [product.product_variations, colorVariations]);

  const [activeColor, setActiveColor] = useState<string | null>(colorVariations.length > 0 ? colorVariations[0].color : null);

  // Determine current image based on selected color
  const currentImage = useMemo(() => {
    if (activeColor) {
      const match = colorVariations.find(c => c.color === activeColor);
      if (match && match.img) return match.img;
    }
    return defaultImage;
  }, [activeColor, colorVariations, defaultImage]);

  // Determine current price based on selected color
  const currentPrice = useMemo(() => {
    if (!product.product_variations) return product.minPrice;
    const matchingVars = activeColor
      ? product.product_variations.filter(v => v.color === activeColor && v.price != null)
      : product.product_variations.filter(v => v.price != null);

    if (matchingVars.length > 0) {
      return Math.min(...matchingVars.map(v => Number(v.price)));
    }
    return product.minPrice;
  }, [activeColor, product.product_variations, product.minPrice]);

  // Active variation now includes stock info so the cart button knows availability
  const activeVariation = useMemo(() => {
    if (!product.product_variations || product.product_variations.length === 0) return null;
    const matchingVars = activeColor
      ? product.product_variations.filter(v => v.color === activeColor)
      : product.product_variations;

    if (matchingVars.length === 0) return null;

    // Prefer an in-stock variation among the matches, fall back to the first
    return matchingVars.find(v => v.stock_quantity > 0) ?? matchingVars[0];
  }, [activeColor, product.product_variations]);

  const activeVariationId = activeVariation?.id ?? null;
  const activeVariationInStock = (activeVariation?.stock_quantity ?? 0) > 0;

  const productUrl = activeColor
    ? `/product/${product.id}?color=${encodeURIComponent(activeColor)}`
    : `/product/${product.id}`;

  return (
    <div className="group flex flex-col rounded-2xl border border-[#1A1A1A]/10 bg-white hover:border-[#9c7d23]/40 hover:shadow-xl hover:shadow-[#9c7d23]/5 transition-all duration-500 overflow-hidden">
      <Link href={productUrl} className="relative aspect-[4/5] bg-[#F8F6F0] overflow-hidden block">
        {currentImage ? (
          <Image
            src={currentImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#1A1A1A]/20 text-[11px] uppercase tracking-widest">
            No Image
          </div>
        )}
        {!product.inStock && (
          <span className="absolute top-3 right-3 bg-[#1A1A1A] text-white text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-sm font-medium shadow-sm">
            Out of stock
          </span>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-1">
        {/* Title and Price */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-4">
          <Link href={productUrl} className="hover:text-[#9c7d23] transition-colors">
            <h3 className="font-outfit font-medium text-[13px] tracking-wide text-[#1A1A1A] line-clamp-1 uppercase">
              {product.name}
            </h3>
          </Link>
          <p className="font-outfit font-bold text-[14px] text-red-600 shrink-0">
            {currentPrice != null
              ? `₹${currentPrice.toLocaleString()}`
              : "N/A"}
          </p>
        </div>

        {/* Variations Swatches */}
        {colorVariations.length > 0 ? (
          <div className="mt-3 flex items-center gap-1.5 px-1 pb-1">
            {colorVariations.map(variant => (
              <button
                key={variant.color}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveColor(variant.color);
                }}
                title={variant.color}
                className={`w-5 h-5 rounded-full border transition-all ${
                  activeColor === variant.color
                    ? "border-[#9c7d23] ring-1 ring-[#9c7d23]/30 scale-110"
                    : "border-[#1A1A1A]/20 hover:border-[#1A1A1A]/60"
                }`}
                style={{ backgroundColor: variant.hex }}
              />
            ))}
          </div>
        ) : sizeVariations.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1 px-1 pb-1">
            {sizeVariations.map(size => (
              <span key={size} className="px-2 py-0.5 border border-[#1A1A1A]/10 rounded text-[10px] text-[#1A1A1A]/60 font-outfit uppercase">
                {size}
              </span>
            ))}
          </div>
        ) : null}

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-[#1A1A1A]/10">
          <Link
            href={productUrl}
            className="flex items-center gap-1.5 text-[#1A1A1A]/60 hover:text-[#9c7d23] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <span className="text-[9px] tracking-[0.2em] font-medium uppercase">Details</span>
          </Link>

          <div className="flex items-center gap-3 text-[#1A1A1A]/60">
            <MiniWishlistButton
              productId={product.id}
              variationId={activeVariationId}
              productName={product.name}
              productPrice={currentPrice}
              productImage={currentImage}
            />
            <MiniCartButton
              productId={product.id}
              variationId={activeVariationId}
              productName={product.name}
              productPrice={currentPrice}
              productImage={currentImage}
              color={activeColor}
              inStock={activeVariationInStock}
            />
            <Link href={productUrl} className="hover:text-[#9c7d23] transition-colors focus:text-[#9c7d23]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}