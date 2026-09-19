import { createClient } from '@supabase/supabase-js'
import ProductForm from './ProductForm'

export const dynamic = 'force-dynamic'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AddProductPage() {
  const [{ data: categories }, { data: subCategories }, { data: subSubCategories }] =
    await Promise.all([
      supabase.from('categories').select('id, name').order('priority', { ascending: true }),
      supabase
        .from('sub_categories')
        .select('id, name, category_id')
        .order('priority', { ascending: true }),
      supabase
        .from('sub_sub_categories')
        .select('id, name, sub_category_id')
        .order('priority', { ascending: true }),
    ])

  return (
    <div
      className="min-h-screen bg-[#FAF7F1] px-4 py-6 md:px-10 md:py-10 font-outfit text-black"
      style={{ colorScheme: 'light' }}
    >
      <ProductForm
        categories={categories ?? []}
        subCategories={subCategories ?? []}
        subSubCategories={subSubCategories ?? []}
      />
    </div>
  )
}