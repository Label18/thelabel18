"use client";

import { useState, useMemo, useEffect } from "react";
import { ProductVariation } from "@/lib/supabase/products";
import { useAuth } from "@/contexts/AuthContext";
import { useGuestCartWishlist } from "@/contexts/GuestCartWishlistContext";
import { toast } from "react-hot-toast";
import WishlistButton from "@/components/WishlistButton";

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

  return (
    <div className="space-y-6">
      {/* Price Section */}
      <div className="flex items-baseline gap-4 pb-2 border-b border-[#1A1A1A]/10">
        {displayPrice !== null && !isNaN(displayPrice) ? (
          <>
            <p
              className="font-normal text-3xl text-[#9c7d23]"
             
            >
              ₹{displayPrice.toLocaleString()}
            </p>
            {displayComparePrice !== null && displayComparePrice > displayPrice && (
              <span className="text-base text-[#1A1A1A]/40 line-through font-outfit">
                ₹{displayComparePrice.toLocaleString()}
              </span>
            )}
          </>
        ) : priceRange ? (
          <p
            className="font-normal text-3xl text-[#9c7d23]"
           
          >
            {priceRange.min === priceRange.max
              ? `₹${priceRange.min.toLocaleString()}`
              : `₹${priceRange.min.toLocaleString()} – ₹${priceRange.max.toLocaleString()}`}
          </p>
        ) : (
          <p
            className="font-normal text-3xl text-[#9c7d23]"
           
          >
            Select Options
          </p>
        )}
      </div>

      {/* Color Selector */}
      {colors.length > 0 && (
        <div>
          <label
            className="block text-[10.5px] tracking-[0.3em] uppercase text-[#1A1A1A]/60 font-outfit font-medium mb-3"
           
          >
            Color{selectedColor ? `: ${selectedColor}` : ""}
          </label>
          <div className="flex flex-wrap gap-3">
            {colors.map(([color, hex]) => {
              const available = isColorAvailable(color);
              return (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  title={color}
                  className={`w-9 h-9 rounded-full border transition-all ${
                    selectedColor === color
                      ? "border-[#9c7d23] ring-2 ring-[#9c7d23]/30 scale-105"
                      : "border-[#1A1A1A]/20 hover:border-[#1A1A1A]/60"
                  } ${!available ? "opacity-35" : ""}`}
                  style={{ backgroundColor: hex ?? "#EAE5D9" }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {sizes.length > 0 && (
        <div>
          <label
            className="block text-[10.5px] tracking-[0.3em] uppercase text-[#1A1A1A]/60 font-outfit font-medium mb-3"
           
          >
            Size
          </label>
          <div className="flex flex-wrap gap-2.5">
            {sizes.map((size) => {
              const available = isSizeAvailable(size);
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[3.5rem] px-4 py-2.5 rounded border text-[11px] tracking-[0.2em] uppercase font-outfit font-light transition-all ${
                    selectedSize === size
                      ? "border-[#9c7d23] text-[#9c7d23] bg-[#9c7d23]/5 shadow-sm"
                      : "border-[#1A1A1A]/20 text-[#1A1A1A]/80 hover:border-[#1A1A1A]/50 bg-white"
                  } ${!available ? "opacity-40 line-through bg-[#1A1A1A]/5 text-[#1A1A1A]/40 border-dashed" : ""}`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Status */}
      <p
        className="text-[10px] tracking-[0.25em] uppercase font-outfit font-medium text-[#1A1A1A]/60"
       
      >
        {activeVariation
          ? inStock
            ? activeVariation.stock_quantity <= 5
              ? `Only ${activeVariation.stock_quantity} left in stock`
              : "In Stock & Ready"
            : "Out of Stock"
          : "Combination unavailable"}
      </p>

      {cartError && (
        <p className="text-[11px] font-outfit text-red-600/90 tracking-wide">{cartError}</p>
      )}

      {/* Add to Cart + Wishlist */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!activeVariation || !inStock || adding}
          className={`flex-1 py-4 rounded text-[11px] tracking-[0.3em] uppercase font-outfit font-medium transition-all shadow-sm ${
            activeVariation && inStock
              ? "bg-[#1A1A1A] text-[#F8F6F0] hover:bg-[#9c7d23] hover:text-white"
              : "bg-[#1A1A1A]/10 text-[#1A1A1A]/30 cursor-not-allowed"
          } ${adding ? "opacity-70 cursor-wait" : ""}`}
         
        >
          {added
            ? "Added to Cart ✓"
            : !activeVariation || !inStock
            ? "Unavailable"
            : adding
            ? "Adding..."
            : "Add to Cart"}
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
    </div>
  );
}