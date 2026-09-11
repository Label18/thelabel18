"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGuestCartWishlist } from "@/contexts/GuestCartWishlistContext";
import { createClient } from "@/lib/supabase/client";
import LoginModal from "@/components/LoginModal";

type CartRow = {
  id: string;
  quantity: number;
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
    size: string | null;
    color: string | null;
    color_hex: string | null;
    price: number;
    compare_at_price: number | null;
    stock_quantity: number;
    sku: string;
    image_url: string | null;
  } | null;
};

// Both logged-in (Supabase) and guest (localStorage) rows get normalized
// into this shape so the render logic below doesn't need to branch.
type DisplayCartItem = {
  key: string; // cart_items.id for users, `${productId}-${variationId}` for guests
  productId: string;
  variationId: string | null;
  quantity: number;
  name: string;
  image: string | null;
  color: string | null;
  size: string | null;
  sku: string | null;
  price: number;
  stockQuantity: number | null; // null = unknown
};

export default function CartPage() {
  const {
    user,
    loading: authLoading,
    updateCartQuantity,
    removeFromCart,
    refreshCart,
  } = useAuth();
  const guest = useGuestCartWishlist();
  const supabase = createClient();
  const router = useRouter();

  const [rows, setRows] = useState<CartRow[]>([]);
  const [guestDisplayItems, setGuestDisplayItems] = useState<DisplayCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  // Login modal for checkout — opened locally on this page instead of
  // relying on a global openLoginModal, so we can redirect to /checkout
  // as soon as login succeeds.
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const redirectToCheckoutRef = useRef(false);

  const loadCart = useCallback(async () => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        "id, quantity, product_id, variation_id, products(id, name, sku, image_url), product_variations(id, size, color, color_hex, price, compare_at_price, stock_quantity, sku, image_url)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as unknown as CartRow[]);
    }
    setLoading(false);
  }, [user, supabase]);

  // Guests: merge the cached localStorage entries with fresh price/stock
  // from Supabase so displayed prices and stock are never stale.
  const loadGuestCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    const localItems = guest.cart ?? [];
    if (localItems.length === 0) {
      setGuestDisplayItems([]);
      setLoading(false);
      return;
    }

    const variationIds = [
      ...new Set(localItems.map((i) => i.variationId).filter(Boolean)),
    ] as string[];

    let freshById = new Map<string, any>();
    if (variationIds.length > 0) {
      const { data, error } = await supabase
        .from("product_variations")
        .select("id, size, color, color_hex, price, compare_at_price, stock_quantity, sku, image_url")
        .in("id", variationIds);

      if (error) {
        setError(error.message);
      } else {
        freshById = new Map((data ?? []).map((v: any) => [v.id, v]));
      }
    }

    const display: DisplayCartItem[] = localItems.map((item) => {
      const fresh = item.variationId ? freshById.get(item.variationId) : null;
      return {
        key: `${item.productId}-${item.variationId ?? "default"}`,
        productId: item.productId,
        variationId: item.variationId ?? null,
        quantity: item.quantity,
        name: item.name,
        image: fresh?.image_url ?? item.image ?? null,
        color: fresh?.color ?? item.color ?? null,
        size: fresh?.size ?? item.size ?? null,
        sku: fresh?.sku ?? null,
        price: fresh?.price != null ? Number(fresh.price) : item.price,
        stockQuantity: fresh?.stock_quantity ?? null,
      };
    });

    setGuestDisplayItems(display);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guest.cart, supabase]);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      loadCart();
    } else {
      loadGuestCart();
    }
  }, [authLoading, user, loadCart, loadGuestCart]);

  // Once login succeeds while the modal was opened for checkout, close it
  // and go straight to /checkout instead of leaving the user on /cart.
  useEffect(() => {
    if (user && redirectToCheckoutRef.current) {
      redirectToCheckoutRef.current = false;
      setIsLoginOpen(false);
      router.push("/checkout");
    }
  }, [user, router]);

  function setPending(key: string, on: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  const displayItems: DisplayCartItem[] = useMemo(() => {
    if (user) {
      return rows.map((item) => {
        const variation = item.product_variations;
        const product = item.products;
        return {
          key: item.id,
          productId: item.product_id,
          variationId: item.variation_id,
          quantity: item.quantity,
          name: product?.name ?? "Product",
          image: variation?.image_url || product?.image_url || null,
          color: variation?.color ?? null,
          size: variation?.size ?? null,
          sku: variation?.sku ?? null,
          price: Number(variation?.price ?? 0),
          stockQuantity: variation?.stock_quantity ?? null,
        };
      });
    }
    return guestDisplayItems;
  }, [user, rows, guestDisplayItems]);

  async function handleQuantityChange(item: DisplayCartItem, next: number) {
    if (next < 1) return;
    setPending(item.key, true);
    try {
      if (user) {
        await updateCartQuantity(item.key, next);
        await loadCart();
        await refreshCart();
      } else {
        guest.updateQuantity(item.productId, item.variationId, next); // ← was guest.updateCartQuantity
        await loadGuestCart();
      }
    } catch (err: any) {
      setError(err?.message ?? "Couldn't update quantity.");
    } finally {
      setPending(item.key, false);
    }
  }

  async function handleRemove(item: DisplayCartItem) {
    setPending(item.key, true);
    try {
      if (user) {
        await removeFromCart(item.key);
        await loadCart();
        await refreshCart();
      } else {
        guest.removeFromCart(item.productId, item.variationId);
        await loadGuestCart();
      }
    } catch (err: any) {
      setError(err?.message ?? "Couldn't remove item.");
    } finally {
      setPending(item.key, false);
    }
  }

  function handleCheckout() {
    if (!user) {
      redirectToCheckoutRef.current = true;
      setIsLoginOpen(true);
      return;
    }
    router.push("/checkout");
  }

  const subtotal = displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasOutOfStockItem = displayItems.some((item) => (item.stockQuantity ?? 1) <= 0);

  return (
    <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pt-24 md:pt-32 pb-16 px-6 lg:px-16">
      <div className="max-w-[1000px] mx-auto">
        <h1
          className="text-2xl md:text-3xl uppercase tracking-[0.15em] mb-10"

        >
          Your Cart
        </h1>

        {error && (
          <p className="text-[12px] font-outfit text-red-600/90 mb-6">{error}</p>
        )}

        {authLoading || loading ? (
          <p className="text-sm text-[#1A1A1A]/50 font-outfit font-light">Loading cart...</p>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-[#1A1A1A]/60 font-outfit font-light mb-6">
              Your cart is empty.
            </p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 rounded bg-[#1A1A1A] text-[#F8F6F0] text-[11px] tracking-[0.3em] uppercase font-outfit font-medium hover:bg-[#9c7d23] transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Items */}
            <div className="lg:col-span-8 space-y-4">
              {displayItems.map((item) => {
                const isPending = pendingIds.has(item.key);
                const outOfStock = (item.stockQuantity ?? 1) <= 0;

                return (
                  <div
                    key={item.key}
                    className="flex gap-4 bg-white/70 backdrop-blur-md border border-[#1A1A1A]/10 rounded-lg p-4 md:p-5"
                  >
                    <div className="relative w-20 h-24 md:w-24 md:h-28 flex-shrink-0 rounded overflow-hidden bg-white border border-[#1A1A1A]/10">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] uppercase tracking-widest text-[#1A1A1A]/30">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/product/${item.productId}`}
                          className="text-sm md:text-base font-outfit font-medium uppercase tracking-wide hover:text-[#9c7d23] transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11px] text-[#1A1A1A]/50 font-outfit font-light mt-1">
                          {[item.color, item.size].filter(Boolean).join(" / ") || item.sku}
                        </p>
                        {outOfStock && (
                          <p className="text-[10px] uppercase tracking-widest text-red-600/80 font-outfit font-medium mt-1">
                            Out of stock
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-[#1A1A1A]/20 rounded">
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            disabled={isPending || item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-[#1A1A1A]/70 hover:text-[#9c7d23] disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-outfit">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            disabled={isPending}
                            className="w-8 h-8 flex items-center justify-center text-[#1A1A1A]/70 hover:text-[#9c7d23] disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <p
                          className="text-base font-outfit font-medium text-[#9c7d23]"

                        >
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemove(item)}
                        disabled={isPending}
                        className="self-start mt-2 text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 hover:text-red-600/80 font-outfit transition-colors disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white/70 backdrop-blur-md border border-[#1A1A1A]/10 rounded-lg p-6 sticky top-28">
                <h2
                  className="text-[11px] tracking-[0.3em] uppercase font-outfit font-medium text-[#9c7d23] mb-5"

                >
                  Order Summary
                </h2>
                <div className="flex justify-between text-sm font-outfit font-light mb-2">
                  <span className="text-[#1A1A1A]/60">Subtotal</span>
                  <span className="font-bold text-red-600">₹{subtotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-[#1A1A1A]/40 font-outfit font-light mb-5">
                  Shipping and taxes calculated at checkout.
                </p>

                {hasOutOfStockItem && (
                  <p className="text-[11px] text-red-600/90 font-outfit mb-3">
                    Remove out-of-stock items before checking out.
                  </p>
                )}

                {!user && (
                  <p className="text-[11px] text-[#1A1A1A]/50 font-outfit mb-3">
                    You&apos;ll need to sign in to check out.
                  </p>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={hasOutOfStockItem}
                  className="w-full py-4 rounded bg-[#1A1A1A] text-[#F8F6F0] text-[11px] tracking-[0.3em] uppercase font-outfit font-medium hover:bg-[#9c7d23] transition-all disabled:opacity-50 disabled:cursor-not-allowed"

                >
                  {user ? "Checkout" : "Login to Checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          redirectToCheckoutRef.current = false;
        }}
      />
    </main>
  );
}