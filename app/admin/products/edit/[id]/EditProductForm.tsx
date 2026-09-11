// app/admin/products/edit/[id]/EditProductForm.tsx
'use client'

import { useMemo, useState, useTransition } from 'react'
import { Plus, Trash2, ImageOff, X } from 'lucide-react'
import { updateProduct } from './actions'

type Category = { id: string; name: string }
type SubCategory = { id: string; name: string; category_id: string }
type SubSubCategory = { id: string; name: string; sub_category_id: string }

type Variation = {
  key: string
  size: string
  color: string
  color_hex: string
  stock: string
  price: string
  compare_at_price: string
  image: File | null
  existing_image_url: string | null
}

type ExistingProduct = {
  id: string
  sku: string
  name: string
  description: string | null
  image_url: string | null
  category_id: string
  sub_category_id: string | null
  sub_sub_category_id: string | null
  variations: {
    size: string | null
    color: string | null
    color_hex: string | null
    stock_quantity: number
    price: number
    compare_at_price: number | null
    image_url: string | null
  }[]
}

function ImagePicker({
  file,
  existingUrl,
  onChange,
  label,
}: {
  file: File | null
  existingUrl: string | null
  onChange: (f: File | null) => void
  label: string
}) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : existingUrl), [file, existingUrl])

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-300">
            <ImageOff size={18} />
          </div>
        )}
      </div>
      <label className="cursor-pointer rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50">
        {file ? 'Change image' : 'Replace image'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
      {file && (
        <button type="button" onClick={() => onChange(null)} className="text-stone-400 hover:text-rose-500">
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export default function EditProductForm({
  product,
  categories,
  subCategories,
  subSubCategories,
}: {
  product: ExistingProduct
  categories: Category[]
  subCategories: SubCategory[]
  subSubCategories: SubSubCategory[]
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [categoryId, setCategoryId] = useState(product.category_id)
  const [subCategoryId, setSubCategoryId] = useState(product.sub_category_id || '')
  const [mainImage, setMainImage] = useState<File | null>(null)

  const [variations, setVariations] = useState<Variation[]>(
    product.variations.length > 0
      ? product.variations.map((v) => ({
          key: crypto.randomUUID(),
          size: v.size || '',
          color: v.color || '',
          color_hex: v.color_hex || '',
          stock: String(v.stock_quantity),
          price: String(v.price),
          compare_at_price: v.compare_at_price != null ? String(v.compare_at_price) : '',
          image: null,
          existing_image_url: v.image_url,
        }))
      : [
          {
            key: crypto.randomUUID(),
            size: '',
            color: '',
            color_hex: '',
            stock: '0',
            price: '',
            compare_at_price: '',
            image: null,
            existing_image_url: null,
          },
        ]
  )

  const filteredSubCategories = useMemo(
    () => subCategories.filter((s) => s.category_id === categoryId),
    [subCategories, categoryId]
  )
  const filteredSubSubCategories = useMemo(
    () => subSubCategories.filter((s) => s.sub_category_id === subCategoryId),
    [subSubCategories, subCategoryId]
  )

  function updateVariation(key: string, patch: Partial<Variation>) {
    setVariations((prev) => prev.map((v) => (v.key === key ? { ...v, ...patch } : v)))
  }

  function removeVariation(key: string) {
    setVariations((prev) => prev.filter((v) => v.key !== key))
  }

  function handleSubmit(formData: FormData) {
    setError(null)
    if (mainImage) formData.set('image', mainImage)
    formData.set('existing_image_url', product.image_url || '')

    formData.set('variation_count', String(variations.length))
    variations.forEach((v, i) => {
      formData.set(`variations[${i}][size]`, v.size)
      formData.set(`variations[${i}][color]`, v.color)
      formData.set(`variations[${i}][color_hex]`, v.color_hex)
      formData.set(`variations[${i}][stock]`, v.stock)
      formData.set(`variations[${i}][price]`, v.price)
      formData.set(`variations[${i}][compare_at_price]`, v.compare_at_price)
      formData.set(`variations[${i}][existing_image_url]`, v.existing_image_url || '')
      if (v.image) formData.set(`variations[${i}][image]`, v.image)
    })

    startTransition(async () => {
      try {
        await updateProduct(product.id, formData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  const inputClass =
    'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-black outline-none focus:border-black'
  const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-stone-500'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-black">Edit Product</h1>
        <p className="mt-1 text-sm text-stone-600">{product.name}</p>
      </div>

      <form action={handleSubmit} className="space-y-8">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-stone-500">
            Product Details
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClass}>SKU Number</label>
              <input name="sku" required defaultValue={product.sku} className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Product Name</label>
              <input name="name" required defaultValue={product.name} className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Category</label>
              <select
                name="category_id"
                required
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value)
                  setSubCategoryId('')
                }}
                className={inputClass}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Sub Category</label>
              <select
                name="sub_category_id"
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                disabled={!categoryId}
                className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <option value="">
                  {categoryId ? 'Select sub category (optional)' : 'Choose a category first'}
                </option>
                {filteredSubCategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className={labelClass}>Sub Sub Category</label>
              <select
                name="sub_sub_category_id"
                defaultValue={product.sub_sub_category_id || ''}
                disabled={!subCategoryId}
                className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-xs`}
              >
                <option value="">
                  {subCategoryId ? 'Select sub sub category (optional)' : 'Choose a sub category first'}
                </option>
                {filteredSubSubCategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={product.description || ''}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className={labelClass}>Overall Product Image</label>
              <ImagePicker
                file={mainImage}
                existingUrl={product.image_url}
                onChange={setMainImage}
                label="Product image"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Variations</h2>
            <button
              type="button"
              onClick={() =>
                setVariations((prev) => [
                  ...prev,
                  {
                    key: crypto.randomUUID(),
                    size: '',
                    color: '',
                    color_hex: '',
                    stock: '0',
                    price: '',
                    compare_at_price: '',
                    image: null,
                    existing_image_url: null,
                  },
                ])
              }
              className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              <Plus size={14} />
              Add Variation
            </button>
          </div>

          <div className="space-y-4">
            {variations.map((v, i) => (
              <div key={v.key} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Variation {i + 1}
                  </span>
                  {variations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariation(v.key)}
                      className="text-stone-400 hover:text-rose-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-stone-500">Size</label>
                    <input
                      value={v.size}
                      onChange={(e) => updateVariation(v.key, { size: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-stone-500">Color</label>
                    <input
                      value={v.color}
                      onChange={(e) => updateVariation(v.key, { color: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-stone-500">Swatch</label>
                    <input
                      type="color"
                      value={v.color_hex || '#000000'}
                      onChange={(e) => updateVariation(v.key, { color_hex: e.target.value })}
                      className="h-[42px] w-full cursor-pointer rounded-xl border border-stone-300 bg-white p-1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-stone-500">Stock Amount</label>
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) => updateVariation(v.key, { stock: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-stone-500">Selling Price</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      required
                      value={v.price}
                      onChange={(e) => updateVariation(v.key, { price: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-stone-500">Compare-at Price</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={v.compare_at_price}
                      onChange={(e) => updateVariation(v.key, { compare_at_price: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-2 space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-medium text-stone-500">
                      Image for this variation
                    </label>
                    <ImagePicker
                      file={v.image}
                      existingUrl={v.existing_image_url}
                      onChange={(f) => updateVariation(v.key, { image: f })}
                      label={`${v.color || 'Variation'} image`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-sm text-rose-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-black py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto sm:px-10"
        >
          {pending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}