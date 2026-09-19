"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useGuestCartWishlist } from "@/contexts/GuestCartWishlistContext";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

type WishlistRow = {
  id: string;
  product_id: string;
  variation_id: string | null;
  products: {
    id: string;
    name: string;
    sku: string;
    image_url: string | null;
  } | null;
  product_variations: {
    id: string;
    price: number;
    compare_at_price: number | null;
    stock_quantity: number;
    color: string | null;
    size: string | null;
    image_url: string | null;
  } | null;
};

type DisplayWishlistItem = {
  key: string;
  productId: string;
  variationId: string | null;
  name: string;
  image: string | null;
  color: string | null;
  size: string | null;
  price: number | null;
  stockQuantity: number | null;
};

export default function WishlistPage() {
  const {
    user,
    loading: authLoading,
    toggleWishlist,
    addToCart,
    refreshWishlist,
    refreshCart,
  } = useAuth();
  const guest = useGuestCartWishlist();
  const supabase = createClient();

  const [rows, setRows] = useState<WishlistRow[]>([]);
  const [guestDisplayItems, setGuestDisplayItems] = useState<DisplayWishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [movedIds, setMovedIds] = useState<Set<string>>(new Set());

  const loadWishlist = useCallback(async () => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("wishlist")
      .select(`
        id, product_id, variation_id, 
        products(
          id, name, sku, image_url, is_visible,
          category_id, sub_category_id, sub_sub_category_id,
          category:categories(is_visible),
          sub_category:sub_categories(is_visible),
          sub_sub_category:sub_sub_categories(is_visible)
        ), 
        product_variations(id, price, compare_at_price, stock_quantity, color, size, image_url)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      const isVis = (cat: any, id: string | null) => {
        if (id && !cat) return false;
        if (!cat) return true;
        if (Array.isArray(cat)) return cat.length > 0 ? cat[0].is_visible !== false : true;
        return cat.is_visible !== false;
      };

      const validData = (data ?? []).filter((item) => {
        const p = item.products as any;
        if (!p || p.is_visible === false) return false;
        if (!isVis(p.category || p.categories, p.category_id)) return false;
        if (!isVis(p.sub_category || p.sub_categories, p.sub_category_id)) return false;
        if (!isVis(p.sub_sub_category || p.sub_sub_categories, p.sub_sub_category_id)) return false;
        return true;
      });
      setRows(validData as unknown as WishlistRow[]);
    }
    setLoading(false);
  }, [user, supabase]);

  // Guests: merge cached localStorage entries with fresh price/stock from
  // Supabase so displayed data is never stale.
  const loadGuestWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);

    const localItems = guest.wishlist ?? [];
    if (localItems.length === 0) {
      setGuestDisplayItems([]);
      setLoading(false);
      return;
    }

    const variationIds = [
      ...new Set(localItems.map((i) => i.variationId).filter(Boolean)),
    ] as string[];

    let freshById = new Map<string, any>();
    const productIds = [...new Set(localItems.map((i) => i.productId))];
    const visibleProductIds = new Set<string>();

    if (productIds.length > 0) {
      const { data } = await supabase
        .from("products")
        .select(`
          id, is_visible,
          category_id, sub_category_id, sub_sub_category_id,
          category:categories(is_visible),
          sub_category:sub_categories(is_visible),
          sub_sub_category:sub_sub_categories(is_visible)
        `)
        .in("id", productIds);

      if (data) {
        const isVis = (cat: any, id: string | null) => {
          if (id && !cat) return false;
          if (!cat) return true;
          if (Array.isArray(cat)) return cat.length > 0 ? cat[0].is_visible !== false : true;
          return cat.is_visible !== false;
        };

        data.forEach((p: any) => {
          if (
            p.is_visible !== false &&
            isVis(p.category || p.categories, p.category_id) &&
            isVis(p.sub_category || p.sub_categories, p.sub_category_id) &&
            isVis(p.sub_sub_category || p.sub_sub_categories, p.sub_sub_category_id)
          ) {
            visibleProductIds.add(p.id);
          }
        });
      }
    }

    if (variationIds.length > 0) {
      const { data, error } = await supabase
        .from("product_variations")
        .select("id, price, compare_at_price, stock_quantity, color, size, image_url")
        .in("id", variationIds);

      if (error) {
        setError(error.message);
      } else {
        freshById = new Map((data ?? []).map((v: any) => [v.id, v]));
      }
    }

    const display: DisplayWishlistItem[] = localItems
      .filter((item) => visibleProductIds.has(item.productId))
      .map((item) => {
      const fresh = item.variationId ? freshById.get(item.variationId) : null;
      return {
        key: `${item.productId}-${item.variationId ?? "default"}`,
        productId: item.productId,
        variationId: item.variationId ?? null,
        name: item.name,
        image: fresh?.image_url ?? item.image ?? null,
        color: fresh?.color ?? null,
        size: fresh?.size ?? null,
        price: fresh?.price != null ? Number(fresh.price) : item.price,
        stockQuantity: fresh?.stock_quantity ?? null,
      };
    });

    setGuestDisplayItems(display);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guest.wishlist, supabase]);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      loadWishlist();
    } else {
      loadGuestWishlist();
    }
  }, [authLoading, user, loadWishlist, loadGuestWishlist]);

  function setPending(key: string, on: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  const displayItems: DisplayWishlistItem[] = useMemo(() => {
    if (user) {
      return rows.map((item) => {
        const product = item.products;
        const variation = item.product_variations;
        return {
          key: item.id,
          productId: item.product_id,
          variationId: item.variation_id,
          name: product?.name ?? "Product",
          image: variation?.image_url || product?.image_url || null,
          color: variation?.color ?? null,
          size: variation?.size ?? null,
          price: variation?.price != null ? Number(variation.price) : null,
          stockQuantity: variation?.stock_quantity ?? null,
        };
      });
    }
    return guestDisplayItems;
  }, [user, rows, guestDisplayItems]);

  async function handleRemove(item: DisplayWishlistItem) {
    setPending(item.key, true);
    try {
      if (user) {
        const { error: delError } = await supabase.from("wishlist").delete().eq("id", item.key);
        if (delError) throw delError;
        await loadWishlist();
        await refreshWishlist();
      } else {
        guest.removeFromWishlist(item.productId, item.variationId);
        await loadGuestWishlist();
      }
      toast.success("Removed from wishlist");
    } catch (err: any) {
      const msg = err?.message ?? "Couldn't remove item.";
      setError(msg);
      toast.error(msg);
    } finally {
      setPending(item.key, false);
    }
  }

  async function handleMoveToCart(item: DisplayWishlistItem) {
    if (!item.variationId) return; // no specific variation saved — send them to the product page instead
    setPending(item.key, true);
    try {
      if (user) {
        await addToCart(item.productId, item.variationId, 1);
        await refreshCart();
      } else {
        guest.addToCart(
          {
            productId: item.productId,
            variationId: item.variationId,
            name: item.name,
            price: item.price ?? 0,
            image: item.image,
            color: item.color,
            size: item.size,
          },
          1
        );
      }
      setMovedIds((prev) => new Set(prev).add(item.key));
      toast.success("Moved to cart");
    } catch (err: any) {
      const msg = err?.message ?? "Couldn't add to cart.";
      setError(msg);
      toast.error(msg);
    } finally {
      setPending(item.key, false);
    }
  }

  return (
    <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pt-24 md:pt-32 pb-16 px-6 lg:px-16">
      <div className="max-w-[1400px] mx-auto">
        <h1
          className="text-2xl md:text-3xl uppercase tracking-[0.15em] mb-10"
         
        >
          Your Wishlist
        </h1>

        {error && (
          <p className="text-[12px] font-outfit text-red-600/90 mb-6">{error}</p>
        )}

        {authLoading || loading ? (
          <p className="text-sm text-[#1A1A1A]/50 font-outfit font-light">Loading wishlist...</p>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-[#1A1A1A]/60 font-outfit font-light mb-6">
              Your wishlist is empty.
            </p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 rounded bg-[#1A1A1A] text-[#F8F6F0] text-[11px] tracking-[0.3em] uppercase font-outfit font-medium hover:bg-[#9c7d23] transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayItems.map((item) => {
              const isPending = pendingIds.has(item.key);
              const outOfStock = item.stockQuantity != null ? item.stockQuantity <= 0 : false;
              const moved = movedIds.has(item.key);

              return (
                <div
                  key={item.key}
                  className="bg-white/70 backdrop-blur-md border border-[#1A1A1A]/10 rounded-lg overflow-hidden group"
                >
                  <Link href={`/product/${item.productId}`} className="relative block aspect-[4/5] bg-white">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-[#1A1A1A]/30">
                        No Image
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(item);
                      }}
                      disabled={isPending}
                      title="Remove from wishlist"
                      className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-[#1A1A1A]/60 hover:text-red-600 shadow-sm disabled:opacity-40"
                    >
                      ✕
                    </button>
                  </Link>

                  <div className="p-4">
                    <Link
                      href={`/product/${item.productId}`}
                      className="block text-sm font-outfit font-medium uppercase tracking-wide hover:text-[#9c7d23] transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>

                    {(item.color || item.size) && (
                      <p className="text-[11px] text-[#1A1A1A]/50 font-outfit font-light mt-1">
                        {[item.color, item.size].filter(Boolean).join(" / ")}
                      </p>
                    )}

                    {item.price !== null && (
                      <p
                        className="text-base font-outfit font-medium text-[#9c7d23] mt-2"
                       
                      >
                        ₹{item.price.toLocaleString()}
                      </p>
                    )}

                    {outOfStock && (
                      <p className="text-[10px] uppercase tracking-widest text-red-600/80 font-outfit font-medium mt-1">
                        Out of stock
                      </p>
                    )}

                    {item.variationId ? (
                      <button
                        onClick={() => handleMoveToCart(item)}
                        disabled={isPending || outOfStock || moved}
                        className="w-full mt-3 py-2.5 rounded text-[10px] tracking-[0.25em] uppercase font-outfit font-medium bg-[#1A1A1A] text-[#F8F6F0] hover:bg-[#9c7d23] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {moved ? "Added ✓" : outOfStock ? "Unavailable" : "Move to Cart"}
                      </button>
                    ) : (
                      <Link
                        href={`/product/${item.productId}`}
                        className="block w-full mt-3 py-2.5 rounded text-[10px] tracking-[0.25em] uppercase font-outfit font-medium bg-[#1A1A1A] text-[#F8F6F0] hover:bg-[#9c7d23] transition-all text-center"
                      >
                        Select Options
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}