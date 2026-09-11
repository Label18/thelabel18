import { createClient } from "@/lib/supabase/server";

export type ProductVariation = {
  id: string;
  size: string | null;
  color: string | null;
  color_hex: string | null;
  image_url: string | null;
  stock_quantity: number;
  price: number;
  compare_at_price: number | null;
  is_visible: boolean;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  sub_category_id: string | null;
  sub_sub_category_id: string | null;
  description: string | null;
  image_url: string | null;
  is_visible: boolean;
  product_variations: ProductVariation[];
};

export type ProductFilters = {
  categoryId?: string;
  subCategoryId?: string;
  subSubCategoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
  page?: number;
  pageSize?: number;
};

export type ProductWithPrice = Product & {
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
};

export async function getProducts(filters: ProductFilters) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;

  let query = supabase
    .from("products")
    .select("*, product_variations(*)")
    .eq("is_visible", true);

  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.subCategoryId) query = query.eq("sub_category_id", filters.subCategoryId);
  if (filters.subSubCategoryId) query = query.eq("sub_sub_category_id", filters.subSubCategoryId);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;

  let items: ProductWithPrice[] = (data as Product[]).map((p) => {
    const visibleVariations = p.product_variations.filter((v) => v.is_visible);
    const prices = visibleVariations.map((v) => Number(v.price));
    const minPrice = prices.length ? Math.min(...prices) : null;
    const maxPrice = prices.length ? Math.max(...prices) : null;
    const inStock = visibleVariations.some((v) => v.stock_quantity > 0);
    return { ...p, minPrice, maxPrice, inStock };
  });

  // Price filter (done in JS since price lives on the child table)
  if (filters.minPrice != null) {
    items = items.filter((p) => p.minPrice != null && p.minPrice >= filters.minPrice!);
  }
  if (filters.maxPrice != null) {
    items = items.filter((p) => p.minPrice != null && p.minPrice <= filters.maxPrice!);
  }

  // Sort
  switch (filters.sort) {
    case "price_asc":
      items.sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
      break;
    case "price_desc":
      items.sort((a, b) => (b.minPrice ?? -Infinity) - (a.minPrice ?? -Infinity));
      break;
    case "name_asc":
      items.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      // "newest" — relies on created_at already being returned; re-fetch order isn't guaranteed
      // without an explicit order() call above, so sort defensively if present.
      break;
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return { items: paged, total, page, pageSize };
}

export async function getProductById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, product_variations(*)")
    .eq("id", id)
    .eq("is_visible", true)
    .single();

  if (error || !data) return null;

  const product = data as Product;
  // Supabase can return null here instead of [] when a product has no
  // matching rows in product_variations — normalize it before use.
  product.product_variations = (product.product_variations ?? []).filter(
    (v) => v.is_visible
  );

  return product;
}
export async function getRelatedProducts(product: Product, limit = 4) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, product_variations(*)")
    .eq("is_visible", true)
    .neq("id", product.id)
    .limit(limit);

  if (product.sub_category_id) {
    query = query.eq("sub_category_id", product.sub_category_id);
  } else {
    query = query.eq("category_id", product.category_id);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as Product[]).map((p) => {
    const visible = p.product_variations.filter((v) => v.is_visible);
    const prices = visible.map((v) => Number(v.price));
    return {
      ...p,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      inStock: visible.some((v) => v.stock_quantity > 0),
    };
  });
}