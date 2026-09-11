'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

// Uses the service-role key so the admin backend can bypass RLS.
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client — this file only runs on the server.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'subcategory-images'

// Priority only needs to be unique among sub-categories that share the same
// parent category — two different parents can each have a "priority 1" child.
async function assertPriorityIsUnique(categoryId: string, priority: number, excludeId?: string) {
  let query = supabase
    .from('sub_categories')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .eq('priority', priority)

  if (excludeId) query = query.neq('id', excludeId)

  const { count, error } = await query

  if (error) throw new Error(error.message)
  if (count && count > 0) {
    throw new Error(`Priority ${priority} is already in use by another sub-category in this category`)
  }
}

export async function addSubCategory(formData: FormData) {
  const category_id = String(formData.get('category_id') || '').trim()
  const name = String(formData.get('name') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const priority = Number(formData.get('priority') || 0)
  const file = formData.get('image') as File | null

  if (!category_id) throw new Error('Parent category is required')
  if (!name) throw new Error('Sub-category name is required')
  if (!file || file.size === 0) throw new Error('An image is required')

  await assertPriorityIsUnique(category_id, priority)

  const ext = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const image_url = publicUrl.publicUrl

  const { error } = await supabase.from('sub_categories').insert({
    category_id,
    name,
    description,
    priority,
    image_url,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/sub-categories')
}

export async function updateSubCategory(id: string, formData: FormData) {
  const category_id = String(formData.get('category_id') || '').trim()
  const name = String(formData.get('name') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const priority = Number(formData.get('priority') || 0)
  const file = formData.get('image') as File | null
  const existingImageUrl = String(formData.get('existingImageUrl') || '') || null

  if (!category_id) throw new Error('Parent category is required')
  if (!name) throw new Error('Sub-category name is required')
  // Image is compulsory: either an existing image must remain, or a new one
  // must be uploaded in this request.
  if (!existingImageUrl && (!file || file.size === 0)) {
    throw new Error('An image is required')
  }

  await assertPriorityIsUnique(category_id, priority, id)

  let image_url = existingImageUrl

  if (file && file.size > 0) {
    // remove old image if one exists, then upload the new one
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
    .from('sub_categories')
    .update({ category_id, name, description, priority, image_url })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/sub-categories')
}

export async function toggleSubCategoryVisibility(id: string, nextValue: boolean) {
  const { error } = await supabase
    .from('sub_categories')
    .update({ is_visible: nextValue })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/sub-categories')
}

export async function updateSubCategoryPriority(id: string, categoryId: string, priority: number) {
  await assertPriorityIsUnique(categoryId, priority, id)

  const { error } = await supabase
    .from('sub_categories')
    .update({ priority })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/sub-categories')
}

export async function deleteSubCategory(id: string, imageUrl: string | null) {
  // best-effort: also remove the file from storage if it exists
  if (imageUrl) {
    const path = imageUrl.split(`${BUCKET}/`)[1]
    if (path) await supabase.storage.from(BUCKET).remove([path])
  }

  const { error } = await supabase.from('sub_categories').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/sub-categories')
}