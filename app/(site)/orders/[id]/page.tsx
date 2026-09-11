"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  coupon_code: string | null;
  created_at: string;
  ship_full_name: string;
  ship_phone: string;
  ship_line1: string;
  ship_line2: string | null;
  ship_city: string;
  ship_state: string;
  ship_postal_code: string;
  ship_country: string;
};

type OrderItem = {
  id: string;
  product_id: string;
  variation_id: string | null;
  product_name: string;
  variation_label: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  product_variations: { image_url: string | null } | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const { user, loading: authLoading, openLoginModal } = useAuth();
  const supabase = createClient();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user || !orderId) return;

    (async () => {
      setLoading(true);
      setError(null);

      const [{ data: orderData, error: orderErr }, { data: itemsData, error: itemsErr }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).single(),
        supabase
          .from("order_items")
          .select("id, product_id, variation_id, product_name, variation_label, unit_price, quantity, line_total, product_variations(image_url)")
          .eq("order_id", orderId),
      ]);

      if (orderErr || !orderData) {
        setError("Order not found.");
        setLoading(false);
        return;
      }
      if (itemsErr) {
        setError(itemsErr.message);
      }

      setOrder(orderData as Order);
      setItems((itemsData ?? []) as unknown as OrderItem[]);
      setLoading(false);
    })();
  }, [authLoading, user, orderId, supabase]);

  if (!authLoading && !user) {
    return (
      <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pt-32 pb-16 px-6 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <h1
            className="text-2xl uppercase tracking-[0.15em] mb-4"
          >
            Order Details
          </h1>
          <p className="text-sm text-[#1A1A1A]/60 font-outfit font-light mb-6">
            Sign in to view this order.
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

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pt-32 pb-16 px-6 flex items-center justify-center">
        <p className="text-sm text-[#1A1A1A]/50 font-outfit font-light">Loading order...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pt-32 pb-16 px-6 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-sm text-[#1A1A1A]/60 font-outfit font-light mb-6">
            {error ?? "Order not found."}
          </p>
          <Link
            href="/orders"
            className="inline-block px-8 py-3 rounded bg-[#1A1A1A] text-[#F8F6F0] text-[11px] tracking-[0.3em] uppercase font-outfit font-medium hover:bg-[#9c7d23] transition-all"
          >
            View All Orders
          </Link>
        </div>
      </main>
    );
  }

  const orderDate = new Date(order.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pt-24 md:pt-32 pb-16 px-6 lg:px-16">
      <div className="max-w-[900px] mx-auto">
        {/* Confirmation header */}
        <div className="text-center mb-10">
          <p className="text-[10.5px] tracking-[0.4em] uppercase font-outfit font-medium text-[#9c7d23] mb-3">
            Order Confirmed
          </p>
          <h1
            className="text-2xl md:text-3xl uppercase tracking-[0.1em] mb-2"
          >
            Thank You
          </h1>
          <p className="text-sm text-[#1A1A1A]/60 font-outfit font-light">
            Order #{order.id.slice(0, 8).toUpperCase()} · Placed {orderDate}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items + Address */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2
                className="text-[11px] tracking-[0.3em] uppercase font-outfit font-medium text-[#9c7d23] mb-4"
              >
                Items
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 bg-white/70 backdrop-blur-md border border-[#1A1A1A]/10 rounded-lg p-4"
                  >
                    <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-white border border-[#1A1A1A]/10">
                      {item.product_variations?.image_url ? (
                        <Image
                          src={item.product_variations.image_url}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] uppercase tracking-widest text-[#1A1A1A]/30">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.product_id}`}
                        className="text-sm font-outfit font-medium uppercase tracking-wide hover:text-[#9c7d23] transition-colors line-clamp-2"
                      >
                        {item.product_name}
                      </Link>
                      <p className="text-[11px] text-[#1A1A1A]/50 font-outfit font-light mt-1">
                        {item.variation_label ? `${item.variation_label} · ` : ""}Qty {item.quantity}
                      </p>
                    </div>
                    <p
                      className="text-sm font-outfit font-medium text-[#9c7d23] whitespace-nowrap"
                    >
                      ₹{Number(item.line_total).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2
                className="text-[11px] tracking-[0.3em] uppercase font-outfit font-medium text-[#9c7d23] mb-4"
              >
                Shipping Address
              </h2>
              <div className="bg-white/70 backdrop-blur-md border border-[#1A1A1A]/10 rounded-lg p-5 text-sm font-outfit font-light">
                <p className="font-medium uppercase tracking-wide text-[13px] mb-1">{order.ship_full_name}</p>
                <p className="text-[#1A1A1A]/60">
                  {order.ship_line1}
                  {order.ship_line2 ? `, ${order.ship_line2}` : ""}, {order.ship_city}, {order.ship_state}{" "}
                  {order.ship_postal_code}, {order.ship_country}
                </p>
                <p className="text-[#1A1A1A]/50 mt-1">{order.ship_phone}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white/70 backdrop-blur-md border border-[#1A1A1A]/10 rounded-lg p-6 sticky top-28">
              <h2
                className="text-[11px] tracking-[0.3em] uppercase font-outfit font-medium text-[#9c7d23] mb-5"
              >
                Order Summary
              </h2>

              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/50 font-outfit font-medium">
                  Status
                </span>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#9c7d23] font-outfit font-medium">
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>

              <div className="space-y-2 text-sm font-outfit font-light border-t border-[#1A1A1A]/10 pt-4">
                <div className="flex justify-between">
                  <span className="text-[#1A1A1A]/60">Subtotal</span>
                  <span>₹{Number(order.subtotal).toLocaleString()}</span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-[#9c7d23]">
                    <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                    <span>−₹{Number(order.discount_amount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-medium pt-2 border-t border-[#1A1A1A]/10">
                  <span>Total</span>
                  <span>₹{Number(order.total).toLocaleString()}</span>
                </div>
              </div>

              <Link
                href="/orders"
                className="block w-full mt-6 py-3.5 rounded border border-[#1A1A1A]/20 text-center text-[11px] tracking-[0.3em] uppercase font-outfit font-medium hover:border-[#9c7d23] hover:text-[#9c7d23] transition-all"
              >
                View All Orders
              </Link>
              <Link
                href="/shop"
                className="block w-full mt-3 py-3.5 rounded bg-[#1A1A1A] text-[#F8F6F0] text-center text-[11px] tracking-[0.3em] uppercase font-outfit font-medium hover:bg-[#9c7d23] transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}