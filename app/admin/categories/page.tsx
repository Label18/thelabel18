import { createClient } from '@supabase/supabase-js'
import CategoriesClient, { type Category } from './CategoriesClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function CategoriesPage() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, description, image_url, priority, is_visible')
    .order('priority', { ascending: true })

  if (error) {
    return (
      <div
        className="min-h-screen bg-[#FAF7F1] px-10 py-10 font-outfit text-[#141414]"
        style={{ colorScheme: 'light' }}
      >
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-600">
          Failed to load categories: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-[#FAF7F1] px-10 py-10 font-outfit text-[#141414]"
      style={{ colorScheme: 'light' }}
    >
      <CategoriesClient categories={(data ?? []) as Category[]} />
    </div>
  )
}