"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_items: { id: string }[];
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const { user, loading: authLoading, openLoginModal } = useAuth();
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error: ordersErr } = await supabase
        .from("orders")
        .select("id, status, total, created_at, order_items(id)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersErr) {
        setError(ordersErr.message);
        setLoading(false);
        return;
      }

      setOrders((data ?? []) as unknown as Order[]);
      setLoading(false);
    })();
  }, [authLoading, user, supabase]);

  if (!authLoading && !user) {
    return (
      <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pt-32 pb-16 px-6 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <h1
            className="text-2xl uppercase tracking-[0.15em] mb-4"
          >
            My Orders
          </h1>
          <p className="text-sm text-[#1A1A1A]/60 font-outfit font-light mb-6">
            Sign in to view your orders.
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

  if (authLoading || loading) {
    return (
      <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pt-32 pb-16 px-6 flex items-center justify-center">
        <p className="text-sm text-[#1A1A1A]/50 font-outfit font-light">Loading orders...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pt-32 pb-16 px-6 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-sm text-[#1A1A1A]/60 font-outfit font-light mb-6">{error}</p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 rounded bg-[#1A1A1A] text-[#F8F6F0] text-[11px] tracking-[0.3em] uppercase font-outfit font-medium hover:bg-[#9c7d23] transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pt-32 pb-16 px-6 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <h1
            className="text-2xl uppercase tracking-[0.15em] mb-4"
          >
            My Orders
          </h1>
          <p className="text-sm text-[#1A1A1A]/60 font-outfit font-light mb-6">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 rounded bg-[#1A1A1A] text-[#F8F6F0] text-[11px] tracking-[0.3em] uppercase font-outfit font-medium hover:bg-[#9c7d23] transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pt-24 md:pt-32 pb-16 px-6 lg:px-16">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-10">
          <p className="text-[10.5px] tracking-[0.4em] uppercase font-outfit font-medium text-[#9c7d23] mb-3">
            Account
          </p>
          <h1
            className="text-2xl md:text-3xl uppercase tracking-[0.1em] mb-2"
          >
            My Orders
          </h1>
          <p className="text-sm text-[#1A1A1A]/60 font-outfit font-light">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const orderDate = new Date(order.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const itemCount = order.order_items?.length ?? 0;

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white/70 backdrop-blur-md border border-[#1A1A1A]/10 rounded-lg p-5 md:p-6 hover:border-[#9c7d23]/40 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm font-outfit font-medium uppercase tracking-wide">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[11px] text-[#1A1A1A]/50 font-outfit font-light mt-1">
                      Placed {orderDate} · {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#9c7d23] font-outfit font-medium">
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    <p
                      className="text-sm font-outfit font-medium whitespace-nowrap"
                    >
                      ₹{Number(order.total).toLocaleString()}
                    </p>
                    <span className="text-[#1A1A1A]/30 text-lg">›</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}