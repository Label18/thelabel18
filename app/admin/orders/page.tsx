// app/admin/orders/page.tsx
import { createClient } from '@supabase/supabase-js'
import OrdersClient, { type StoreOrder } from './OrdersClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminOrdersPage() {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      id, status, subtotal, discount_amount, total, coupon_code, created_at,
      ship_full_name, ship_phone, ship_line1, ship_line2, ship_city, ship_state, ship_postal_code, ship_country,
      items:order_items (
        id, product_id, variation_id, product_name, variation_label, unit_price, quantity, line_total,
        product_variations ( image_url, size, color, sku )
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return (
      <div
        className="min-h-screen bg-[#FAF7F1] px-10 py-10 font-outfit text-black"
        style={{ colorScheme: 'light' }}
      >
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-600">
          Failed to load orders: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-[#FAF7F1] px-10 py-10 font-outfit text-black"
      style={{ colorScheme: 'light' }}
    >
      <OrdersClient orders={(data ?? []) as unknown as StoreOrder[]} />
    </div>
  )
}