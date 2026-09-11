"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Address, getAddresses, addAddress, AddressInput } from "@/lib/supabase/addresses";
import AddressForm from "@/components/AddressForm";
import { decreaseStockForOrder } from "@/app/(site)/checkout/actions";

type CartRow = {
  id: string;
  quantity: number;
  product_id: string;
  variation_id: string | null;
  products: { id: string; name: string; image_url: string | null } | null;
  product_variations: {
    id: string;
    price: number;
    color: string | null;
    size: string | null;
    image_url: string | null;
    stock_quantity: number;
  } | null;
};

export default function CheckoutPage() {
  const { user, loading: authLoading, openLoginModal } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [items, setItems] = useState<CartRow[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);

  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const [{ data: cartData, error: cartErr }, addressList] = await Promise.all([
      supabase
        .from("cart_items")
        .select(
          "id, quantity, product_id, variation_id, products(id, name, image_url), product_variations(id, price, color, size, image_url, stock_quantity)"
        )
        .eq("user_id", user.id),
      getAddresses(user.id),
    ]);

    if (!cartErr) setItems((cartData ?? []) as unknown as CartRow[]);
    setAddresses(addressList);
    const def = addressList.find((a) => a.is_default) ?? addressList[0];
    setSelectedAddressId(def?.id ?? null);

    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading, loadData]);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product_variations?.price ?? 0) * item.quantity,
    0
  );
  const total = Math.max(subtotal - discount, 0);

  async function handleAddAddress(input: AddressInput) {
    if (!user) return;
    const created = await addAddress(user.id, input);
    setAddresses((prev) => {
      const next = input.is_default ? prev.map((a) => ({ ...a, is_default: false })) : prev;
      return [created, ...next];
    });
    setSelectedAddressId(created.id);
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponChecking(true);
    setCouponError(null);
    try {
      const code = couponInput.trim().toUpperCase();
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setCouponError("Invalid coupon code.");
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }

      const now = new Date();
      if (new Date(data.valid_from) > now || (data.valid_until && new Date(data.valid_until) < now)) {
        setCouponError("This coupon is not currently valid.");
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }
      if (data.usage_limit != null && data.used_count >= data.usage_limit) {
        setCouponError("This coupon has reached its usage limit.");
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }
      if (subtotal < Number(data.min_order_value)) {
        setCouponError(`Minimum order value is ₹${Number(data.min_order_value).toLocaleString()}.`);
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }

      let computedDiscount = 0;
      if (data.discount_type === "percentage") {
        computedDiscount = Math.round((subtotal * Number(data.discount_value)) / 100 * 100) / 100;
        if (data.max_discount_amount != null) {
          computedDiscount = Math.min(computedDiscount, Number(data.max_discount_amount));
        }
      } else {
        computedDiscount = Math.min(Number(data.discount_value), subtotal);
      }

      setDiscount(computedDiscount);
      setAppliedCoupon(code);
    } catch (err: any) {
      setCouponError(err?.message ?? "Couldn't apply coupon.");
    } finally {
      setCouponChecking(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponInput("");
    setCouponError(null);
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      setPlaceError("Please select or add a shipping address.");
      return;
    }
    setPlaceError(null);
    setPlacing(true);
    try {
      const itemsToDeduct = items.map((i) => ({
        variation_id: i.variation_id,
        quantity: i.quantity,
      }));

      const { data: orderId, error } = await supabase.rpc("place_order", {
        p_address_id: selectedAddressId,
        p_coupon_code: appliedCoupon,
      });
      if (error) throw error;

      router.push(`/orders/${orderId}`);
    } catch (err: any) {
      setPlaceError(err?.message ?? "Couldn't place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (!authLoading && !user) {
    return (
      <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pt-32 pb-16 px-6 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <h1
            className="text-2xl uppercase tracking-[0.15em] mb-4"
           
          >
            Checkout
          </h1>
          <p className="text-sm text-[#1A1A1A]/60 font-outfit font-light mb-6">
            Sign in to continue to checkout.
          </p>
          <button
            onClick={openLoginModal}
            className="px-8 py-3 rounded bg-[#1A1A1A] text-[#F8F6F0] text-[11px] tracking-[0.3em] uppercase font-outfit font-medium hover:bg-[#9c7d23] transition-all"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pt-24 md:pt-32 pb-16 px-6 lg:px-16">
      <div className="max-w-[1100px] mx-auto">
        <h1
          className="text-2xl md:text-3xl uppercase tracking-[0.15em] mb-10"
         
        >
          Checkout
        </h1>

        {loading ? (
          <p className="text-sm text-[#1A1A1A]/50 font-outfit font-light">Loading checkout...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[#1A1A1A]/60 font-outfit font-light">
            Your cart is empty. Add items before checking out.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Address + Items */}
            <div className="lg:col-span-7 space-y-8">
              {/* Address */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-[11px] tracking-[0.3em] uppercase font-outfit font-medium text-[#9c7d23]"
                   
                  >
                    Shipping Address
                  </h2>
                  <button
                    onClick={() => setIsAddressFormOpen(true)}
                    className="text-[10px] tracking-[0.2em] uppercase font-outfit font-medium text-[#1A1A1A]/60 hover:text-[#9c7d23]"
                  >
                    + Add New
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <p className="text-sm text-[#1A1A1A]/50 font-outfit font-light">
                    No saved addresses yet. Add one to continue.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`block p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? "border-[#9c7d23] bg-[#9c7d23]/5"
                            : "border-[#1A1A1A]/15 bg-white/60 hover:border-[#1A1A1A]/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 accent-[#9c7d23]"
                          />
                          <div className="text-sm font-outfit font-light">
                            <p className="font-medium uppercase tracking-wide text-[13px]">
                              {addr.full_name}
                              {addr.is_default && (
                                <span className="ml-2 text-[9px] tracking-widest uppercase text-[#9c7d23]">
                                  Default
                                </span>
                              )}
                            </p>
                            <p className="text-[#1A1A1A]/60 mt-0.5">
                              {addr.line1}
                              {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state}{" "}
                              {addr.postal_code}, {addr.country}
                            </p>
                            <p className="text-[#1A1A1A]/50 mt-0.5">{addr.phone}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h2
                  className="text-[11px] tracking-[0.3em] uppercase font-outfit font-medium text-[#9c7d23] mb-4"
                 
                >
                  Items ({items.length})
                </h2>
                <div className="space-y-3">
                  {items.map((item) => {
                    const variation = item.product_variations;
                    const product = item.products;
                    const image = variation?.image_url || product?.image_url;
                    const price = Number(variation?.price ?? 0);

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 bg-white/60 border border-[#1A1A1A]/10 rounded-lg p-3"
                      >
                        <div className="relative w-14 h-16 flex-shrink-0 rounded overflow-hidden bg-white border border-[#1A1A1A]/10">
                          {image && <Image src={image} alt={product?.name ?? ""} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-outfit font-medium uppercase tracking-wide truncate">
                            {product?.name}
                          </p>
                          <p className="text-[11px] text-[#1A1A1A]/50 font-outfit font-light">
                            {[variation?.color, variation?.size].filter(Boolean).join(" / ")} · Qty {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-outfit font-medium text-[#9c7d23] whitespace-nowrap">
                          ₹{(price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white/70 backdrop-blur-md border border-[#1A1A1A]/10 rounded-lg p-6 sticky top-28">
                <h2
                  className="text-[11px] tracking-[0.3em] uppercase font-outfit font-medium text-[#9c7d23] mb-5"
                 
                >
                  Order Summary
                </h2>

                {/* Coupon */}
                <div className="mb-5">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-[#9c7d23]/10 border border-[#9c7d23]/30 rounded px-3 py-2.5">
                      <span className="text-[12px] font-outfit font-medium text-[#9c7d23] tracking-wide">
                        {appliedCoupon} applied
                      </span>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/50 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon code"
                        className="flex-1 bg-white border border-[#1A1A1A]/15 rounded px-3 py-2.5 text-[13px] font-outfit font-light focus:outline-none focus:border-[#9c7d23]/60"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponChecking || !couponInput.trim()}
                        className="px-4 py-2.5 rounded border border-[#1A1A1A]/20 text-[10px] tracking-[0.2em] uppercase font-outfit font-medium hover:border-[#9c7d23] hover:text-[#9c7d23] disabled:opacity-40"
                      >
                        {couponChecking ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-red-600/90 font-outfit mt-1.5">{couponError}</p>
                  )}
                </div>

                <div className="space-y-2 text-sm font-outfit font-light border-t border-[#1A1A1A]/10 pt-4">
                  <div className="flex justify-between">
                    <span className="text-[#1A1A1A]/60">Subtotal</span>
                    <span className="font-bold text-red-600">₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#9c7d23]">
                      <span>Discount</span>
                      <span>−₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-medium pt-2 border-t border-[#1A1A1A]/10">
                    <span>Total</span>
                    <span className="font-bold text-red-600">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {placeError && (
                  <p className="text-[12px] text-red-600/90 font-outfit mt-4">{placeError}</p>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={placing || !selectedAddressId}
                  className="w-full mt-6 py-4 rounded bg-[#1A1A1A] text-[#F8F6F0] text-[11px] tracking-[0.3em] uppercase font-outfit font-medium hover:bg-[#9c7d23] transition-all disabled:opacity-50"
                 
                >
                  {placing ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddressForm
        isOpen={isAddressFormOpen}
        onClose={() => setIsAddressFormOpen(false)}
        onSave={handleAddAddress}
      />
    </main>
  );
}