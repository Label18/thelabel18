// app/admin/products/list/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function toggleProductVisibility(id: string, nextValue: boolean) {
  const { error } = await supabase.from('products').update({ is_visible: nextValue }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/products/list')
}

export async function toggleVariationVisibility(id: string, nextValue: boolean) {
  const { error } = await supabase
    .from('product_variations')
    .update({ is_visible: nextValue })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/products/list')
}

export async function deleteProduct(id: string, imageUrl: string | null) {
  if (imageUrl) {
    const path = imageUrl.split('product-images/')[1]
    if (path) await supabase.storage.from('product-images').remove([path])
  }

  // variation images aren't auto-deleted from storage here to keep this fast —
  // the DB rows cascade-delete via the FK, which is what matters for the list.
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/products/list')
}