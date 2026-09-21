"use client";

import { useState, useMemo, useEffect } from "react";
import { ProductVariation } from "@/lib/supabase/products";
import { useAuth } from "@/contexts/AuthContext";
import { useGuestCartWishlist } from "@/contexts/GuestCartWishlistContext";
import { toast } from "react-hot-toast";
import WishlistButton from "@/components/WishlistButton";
import { ShoppingBag, CheckCircle2, Sparkles, ShieldCheck, Truck, Clock } from "lucide-react";

export default function ProductVariantSelector({
  productId,
  productName,
  productImage,
  variations = [],
  selectedColorProp,
  onColorChange,
  onVariantChange,
  onRequireLogin,
}: {
  productId: string;
  // Used only for the guest (localStorage) cart/wishlist entry, so it has
  // enough info to render on /cart and /wishlist without a DB lookup.
  // Ignored for logged-in users.
  productName?: string;
  productImage?: string | null;
  variations?: ProductVariation[];
  selectedColorProp?: string | null;
  onColorChange?: (color: string | null) => void;
  onVariantChange?: (variant: ProductVariation | null) => void;
  onRequireLogin?: (reason?: string) => void;
}) {
  const { user, addToCart, refreshCart } = useAuth();
  const guest = useGuestCartWishlist();

  const sizes = useMemo(
    () => [...new Set(variations.map((v) => v.size).filter(Boolean))] as string[],
    [variations]
  );

  const colors = useMemo(
    () =>
      [
        ...new Map(
          variations
            .filter((v) => v.color)
            .map((v) => [v.color, v.color_hex])
        ).entries(),
      ] as [string, string | null][],
    [variations]
  );

  const initialVariation = useMemo(() => {
    return variations.find((v) => v.stock_quantity >= 0) ?? variations[0] ?? null;
  }, [variations]);

  const [selectedSize, setSelectedSize] = useState<string | null>(initialVariation?.size ?? sizes[0] ?? null);
  const [selectedColor, setSelectedColor] = useState<string | null>(selectedColorProp ?? initialVariation?.color ?? colors[0]?.[0] ?? null);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // Guarded sync: Only update state if prop is different to prevent infinite loop loops
  useEffect(() => {
    if (selectedColorProp !== undefined && selectedColorProp !== selectedColor) {
      setSelectedColor(selectedColorProp);
    }
  }, [selectedColorProp, selectedColor]);

  function handleColorSelect(color: string) {
    setSelectedColor(color);
    onColorChange?.(color);

    const matchingSizeForColor = variations.find(
      (v) => v.color === color && v.size === selectedSize && v.stock_quantity > 0
    );
    if (!matchingSizeForColor) {
      const alternative = variations.find((v) => v.color === color && v.stock_quantity > 0);
      if (alternative?.size) {
        setSelectedSize(alternative.size);
      }
    }
  }

  const activeVariation = useMemo(() => {
    let match = variations.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
    if (match) return match;

    if (selectedColor) {
      match = variations.find((v) => v.color === selectedColor);
      if (match) return match;
    }

    if (selectedSize) {
      match = variations.find((v) => v.size === selectedSize);
      if (match) return match;
    }

    return variations[0] ?? null;
  }, [variations, selectedSize, selectedColor]);

  useEffect(() => {
    onVariantChange?.(activeVariation ?? null);
  }, [activeVariation, onVariantChange]);

  const inStock = (activeVariation?.stock_quantity ?? 0) > 0;

  const priceRange = useMemo(() => {
    const prices = variations.map((v) => Number(v.price)).filter((p) => Number.isFinite(p));
    if (prices.length === 0) return null;
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [variations]);

  function isSizeAvailable(size: string) {
    if (selectedColor) {
      return variations.some((v) => v.size === size && v.color === selectedColor && v.stock_quantity > 0);
    }
    return variations.some((v) => v.size === size && v.stock_quantity > 0);
  }

  function isColorAvailable(color: string) {
    if (selectedSize) {
      return variations.some((v) => v.color === color && v.size === selectedSize && v.stock_quantity > 0);
    }
    return variations.some((v) => v.color === color && v.stock_quantity > 0);
  }

  const displayPrice = activeVariation?.price ? Number(activeVariation.price) : null;
  const displayComparePrice = activeVariation?.compare_at_price ? Number(activeVariation.compare_at_price) : null;

  async function handleAddToCart() {
    if (!activeVariation || !inStock) return;

    if (user) {
      setCartError(null);
      setAdding(true);
      try {
        await addToCart(productId, activeVariation.id, 1);
        await refreshCart();
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      } catch (err) {
        console.error("Add to cart failed:", err);
        setCartError("Couldn't add to cart. Please try again.");
      } finally {
        setAdding(false);
      }
      return;
    }

    // Guest: save locally — no login required.
    guest.addToCart(
      {
        productId,
        variationId: activeVariation.id,
        name: productName ?? "Product",
        price: displayPrice ?? 0,
        image: productImage ?? null,
        color: selectedColor,
        size: selectedSize,
      },
      1
    );
    setAdded(true);
    toast.success("Added to cart");
    setTimeout(() => setAdded(false), 2000);
  }

  const discountPercent =
    displayComparePrice && displayPrice && displayComparePrice > displayPrice
      ? Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100)
      : null;

  return (
    <div className="space-y-6">
      {/* Price Section */}
      <div className="flex flex-wrap items-baseline gap-3.5 pb-4 border-b border-[#D4AF37]/25">
        {displayPrice !== null && !isNaN(displayPrice) ? (
          <>
            <p className="font-serif text-3xl sm:text-4xl text-[#9c7d23] font-normal tracking-wide">
              ₹{displayPrice.toLocaleString()}
            </p>
            {displayComparePrice !== null && displayComparePrice > displayPrice && (
              <span className="text-base sm:text-lg text-[#1A1A1A]/40 line-through font-outfit font-light">
                ₹{displayComparePrice.toLocaleString()}
              </span>
            )}
            {discountPercent !== null && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#9c7d23] text-[10px] tracking-widest uppercase font-bold border border-[#D4AF37]/35">
                {discountPercent}% OFF
              </span>
            )}
          </>
        ) : priceRange ? (
          <p className="font-serif text-3xl sm:text-4xl text-[#9c7d23] font-normal tracking-wide">
            {priceRange.min === priceRange.max
              ? `₹${priceRange.min.toLocaleString()}`
              : `₹${priceRange.min.toLocaleString()} – ₹${priceRange.max.toLocaleString()}`}
          </p>
        ) : (
          <p className="font-serif text-2xl sm:text-3xl text-[#9c7d23] font-normal tracking-wide">
            Select Options
          </p>
        )}
      </div>

      {/* Color Selector */}
      {colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10.5px] tracking-[0.3em] uppercase text-[#1A1A1A]/70 font-outfit font-semibold">
              Color: <span className="text-[#9c7d23] normal-case">{selectedColor || "Select Color"}</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map(([color, hex]) => {
              const available = isColorAvailable(color);
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  title={color}
                  className={`w-9 h-9 rounded-full border transition-all relative ${
                    isSelected
                      ? "ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-white scale-110 shadow-md border-black/20"
                      : "border-black/15 hover:scale-105 hover:border-[#D4AF37]/60"
                  } ${!available ? "opacity-35" : ""}`}
                  style={{ backgroundColor: hex ?? "#EAE5D9" }}
                >
                  {isSelected && (
                    <span className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10.5px] tracking-[0.3em] uppercase text-[#1A1A1A]/70 font-outfit font-semibold">
              Size: <span className="text-[#9c7d23] normal-case">{selectedSize || "Select Size"}</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {sizes.map((size) => {
              const available = isSizeAvailable(size);
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[3.5rem] px-4 py-2 rounded-xl text-xs tracking-wider uppercase font-outfit transition-all ${
                    isSelected
                      ? "border border-[#D4AF37] text-[#1A1A1A] bg-[#D4AF37]/20 font-semibold shadow-sm"
                      : "border border-[#D4AF37]/35 text-[#1A1A1A]/80 hover:border-[#D4AF37] hover:text-[#1A1A1A] bg-white font-normal"
                  } ${
                    !available
                      ? "opacity-40 line-through bg-black/[0.02] text-[#1A1A1A]/40 border-dashed border-[#1A1A1A]/20 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Status Indicator */}
      <div className="flex items-center gap-2 text-[10.5px] tracking-[0.2em] uppercase font-outfit font-medium">
        {activeVariation ? (
          inStock ? (
            activeVariation.stock_quantity <= 5 ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-700">
                  Only {activeVariation.stock_quantity} left in private atelier
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700">In Stock • Ready to Dispatch</span>
              </>
            )
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-rose-700">Currently Sold Out</span>
            </>
          )
        ) : (
          <span className="text-[#1A1A1A]/50">Please select an option</span>
        )}
      </div>

      {cartError && (
        <p className="text-[11px] font-outfit text-red-600/90 tracking-wide">{cartError}</p>
      )}

      {/* Add to Cart + Wishlist Action Bar */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={!activeVariation || !inStock || adding}
          className={`flex-1 py-4 px-6 rounded-full text-xs font-bold tracking-[0.2em] uppercase font-outfit transition-all duration-300 shadow-md flex items-center justify-center gap-2 ${
            activeVariation && inStock
              ? "bg-gradient-to-r from-[#F5E6C8] via-[#E6C35C] to-[#D4AF37] text-black hover:brightness-105 active:scale-[0.98] shadow-[0_4px_20px_rgba(212,175,55,0.35)]"
              : "bg-[#1A1A1A]/10 text-[#1A1A1A]/35 cursor-not-allowed"
          } ${adding ? "opacity-75 cursor-wait" : ""}`}
        >
          {added ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>Added To Bag ✓</span>
            </>
          ) : !activeVariation || !inStock ? (
            <span>Sold Out</span>
          ) : adding ? (
            <span>Adding To Bag...</span>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-black" />
              <span>Add To Cart</span>
            </>
          )}
        </button>

        <WishlistButton
          productId={productId}
          variationId={activeVariation?.id ?? null}
          productName={productName}
          productPrice={displayPrice}
          productImage={productImage}
          onRequireLogin={onRequireLogin}
        />
      </div>

      {/* Concierge Trust Pillars */}
      <div className="pt-4 border-t border-[#D4AF37]/20 grid grid-cols-2 gap-3 text-[10px] uppercase font-outfit tracking-widest text-[#1A1A1A]/70">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#9c7d23] flex-shrink-0" />
          <span>100% Pure Silk</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#9c7d23] flex-shrink-0" />
          <span>Hallmarked Purity</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-[#9c7d23] flex-shrink-0" />
          <span>Insured Express Shipping</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#9c7d23] flex-shrink-0" />
          <span>Dispatches in 24-48h</span>
        </div>
      </div>
    </div>
  );
}