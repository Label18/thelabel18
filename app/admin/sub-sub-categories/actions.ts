'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

// Uses the service-role key so the admin backend can bypass RLS.
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client — this file only runs on the server.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'subsubcategory-images'

// Priority only needs to be unique among sub-sub-categories that share the
// same parent sub-category.
async function assertPriorityIsUnique(subCategoryId: string, priority: number, excludeId?: string) {
  let query = supabase
    .from('sub_sub_categories')
    .select('id', { count: 'exact', head: true })
    .eq('sub_category_id', subCategoryId)
    .eq('priority', priority)

  if (excludeId) query = query.neq('id', excludeId)

  const { count, error } = await query

  if (error) throw new Error(error.message)
  if (count && count > 0) {
    throw new Error(`Priority ${priority} is already in use by another sub-sub-category in this sub-category`)
  }
}

export async function addSubSubCategory(formData: FormData) {
  const sub_category_id = String(formData.get('sub_category_id') || '').trim()
  const name = String(formData.get('name') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const priority = Number(formData.get('priority') || 0)
  const file = formData.get('image') as File | null

  if (!sub_category_id) throw new Error('Parent sub-category is required')
  if (!name) throw new Error('Sub-sub-category name is required')
  if (!file || file.size === 0) throw new Error('An image is required')

  await assertPriorityIsUnique(sub_category_id, priority)

  const ext = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const image_url = publicUrl.publicUrl

  const { error } = await supabase.from('sub_sub_categories').insert({
    sub_category_id,
    name,
    description,
    priority,
    image_url,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/sub-sub-categories')
}

export async function updateSubSubCategory(id: string, formData: FormData) {
  const sub_category_id = String(formData.get('sub_category_id') || '').trim()
  const name = String(formData.get('name') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const priority = Number(formData.get('priority') || 0)
  const file = formData.get('image') as File | null
  const existingImageUrl = String(formData.get('existingImageUrl') || '') || null

  if (!sub_category_id) throw new Error('Parent sub-category is required')
  if (!name) throw new Error('Sub-sub-category name is required')
  if (!existingImageUrl && (!file || file.size === 0)) {
    throw new Error('An image is required')
  }

  await assertPriorityIsUnique(sub_category_id, priority, id)

  let image_url = existingImageUrl

  if (file && file.size > 0) {
    if (existingImageUrl) {
      const oldPath = existingImageUrl.split(`${BUCKET}/`)[1]
      if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath])
    }

    const ext = file.name.split('.').pop()
    const path = `${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })

    if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

    const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path)
    image_url = publicUrl.publicUrl
  }

  const { error } = await supabase
    .from('sub_sub_categories')
    .update({ sub_category_id, name, description, priority, image_url })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/sub-sub-categories')
}

export async function toggleSubSubCategoryVisibility(id: string, nextValue: boolean) {
  const { error } = await supabase
    .from('sub_sub_categories')
    .update({ is_visible: nextValue })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/sub-sub-categories')
}

export async function updateSubSubCategoryPriority(id: string, subCategoryId: string, priority: number) {
  await assertPriorityIsUnique(subCategoryId, priority, id)

  const { error } = await supabase
    .from('sub_sub_categories')
    .update({ priority })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/sub-sub-categories')
}

export async function deleteSubSubCategory(id: string, imageUrl: string | null) {
  if (imageUrl) {
    const path = imageUrl.split(`${BUCKET}/`)[1]
    if (path) await supabase.storage.from(BUCKET).remove([path])
  }

  const { error } = await supabase.from('sub_sub_categories').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/sub-sub-categories')
}