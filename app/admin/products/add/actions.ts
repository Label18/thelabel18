// app/admin/products/add/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'product-images'

async function uploadImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null

  const ext = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) throw new Error(`Image upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function slug(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 10)
}

export async function createProduct(formData: FormData) {
  const sku = String(formData.get('sku') || '').trim()
  const name = String(formData.get('name') || '').trim()
  const category_id = String(formData.get('category_id') || '')
  const sub_category_id = String(formData.get('sub_category_id') || '') || null
  const sub_sub_category_id = String(formData.get('sub_sub_category_id') || '') || null
  const description = String(formData.get('description') || '').trim()
  const mainImageFile = formData.get('image') as File | null

  if (!sku) throw new Error('SKU is required')
  if (!name) throw new Error('Product name is required')
  if (!category_id) throw new Error('Category is required')

  const image_url = await uploadImage(mainImageFile)

  // 1. Create the product itself
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      sku,
      name,
      category_id,
      sub_category_id,
      sub_sub_category_id,
      description,
      image_url,
    })
    .select('id')
    .single()

  if (error) {
    // most likely a duplicate SKU
    throw new Error(error.message)
  }

  // 2. Create each variation (size / color / stock / price / its own image)
  const variationCount = Number(formData.get('variation_count') || 0)

  for (let i = 0; i < variationCount; i++) {
    const size = (String(formData.get(`variations[${i}][size]`) || '').trim()) || null
    const color = (String(formData.get(`variations[${i}][color]`) || '').trim()) || null
    const color_hex = (String(formData.get(`variations[${i}][color_hex]`) || '').trim()) || null
    // color_family groups shades together (e.g. "Rose Pink" / "Hot Pink" -> "Pink")
    // so a storefront search/filter for "Pink" can match every shade.
    const color_family =
      (String(formData.get(`variations[${i}][color_family]`) || '').trim()) || null
    const stock_quantity = Number(formData.get(`variations[${i}][stock]`) || 0)
    const price = Number(formData.get(`variations[${i}][price]`) || 0)
    const compareRaw = formData.get(`variations[${i}][compare_at_price]`)
    const compare_at_price = compareRaw && String(compareRaw).trim() !== '' ? Number(compareRaw) : null
    const variationImageFile = formData.get(`variations[${i}][image]`) as File | null

    const variationImageUrl = await uploadImage(variationImageFile)

    const suffix = [slug(color || ''), slug(size || '')].filter(Boolean).join('-')
    const variationSku = suffix ? `${sku}-${suffix}` : `${sku}-${i + 1}`

    const { error: varError } = await supabase.from('product_variations').insert({
      product_id: product.id,
      sku: variationSku,
      size,
      color,
      color_hex,
      color_family,
      stock_quantity,
      price,
      compare_at_price,
      image_url: variationImageUrl,
    })

    if (varError) throw new Error(`Variation ${i + 1}: ${varError.message}`)
  }

  revalidatePath('/admin/products/list')
}