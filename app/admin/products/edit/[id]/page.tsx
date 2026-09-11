// app/admin/products/edit/[id]/page.tsx
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import EditProductForm from './EditProductForm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [{ data: product }, { data: categories }, { data: subCategories }, { data: subSubCategories }] =
    await Promise.all([
      supabase
        .from('products')
        .select(
          `
          id, sku, name, description, image_url, category_id, sub_category_id, sub_sub_category_id,
          variations:product_variations ( size, color, color_hex, image_url, stock_quantity, price, compare_at_price )
        `
        )
        .eq('id', id)
        .single(),
      supabase.from('categories').select('id, name').order('priority', { ascending: true }),
      supabase.from('sub_categories').select('id, name, category_id').order('priority', { ascending: true }),
      supabase
        .from('sub_sub_categories')
        .select('id, name, sub_category_id')
        .order('priority', { ascending: true }),
    ])

  if (!product) notFound()

  return (
    <div
      className="min-h-screen bg-[#FAF7F1] px-10 py-10 font-outfit text-black"
      style={{ colorScheme: 'light' }}
    >
      <EditProductForm
        product={product}
        categories={categories ?? []}
        subCategories={subCategories ?? []}
        subSubCategories={subSubCategories ?? []}
      />
    </div>
  )
}