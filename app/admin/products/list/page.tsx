// app/admin/products/list/page.tsx
import { createClient } from '@supabase/supabase-js'
import ProductsListClient, { type ProductRow } from './ProductsListClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function ProductsListPage() {
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id, sku, name, description, image_url, is_visible, created_at,
      category:categories ( name ),
      sub_category:sub_categories ( name ),
      sub_sub_category:sub_sub_categories ( name ),
      variations:product_variations (
        id, sku, size, color, color_hex, image_url,
        stock_quantity, price, compare_at_price, is_visible
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div
        className="min-h-screen bg-[#FAF7F1] px-10 py-10 font-outfit text-black"
        style={{ colorScheme: 'light' }}
      >
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-600">
          Failed to load products: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-[#FAF7F1] px-10 py-10 font-outfit text-black"
      style={{ colorScheme: 'light' }}
    >
      <ProductsListClient products={(data ?? []) as unknown as ProductRow[]} />
    </div>
  )
}