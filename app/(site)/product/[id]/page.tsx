import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById, getRelatedProducts } from "@/lib/supabase/products";
import { getCategoriesTree } from "@/lib/categories";
import ProductCard from "@/components/ProductCard";
import ProductDetailClient from "@/components/ProductDetailClient";

export const revalidate = 60;

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function ProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const initialColor = sp.color || null;

  const product = await getProductById(id);
  if (!product) notFound();

  const [categories, related] = await Promise.all([
    getCategoriesTree(),
    getRelatedProducts(product),
  ]);

  const category = categories.find((c) => c.id === product.category_id);
  const subCategory = category?.sub_categories.find((s) => s.id === product.sub_category_id);
  const subSubCategory = subCategory?.sub_sub_categories.find(
    (s) => s.id === product.sub_sub_category_id
  );

  return (
    <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pt-24 md:pt-32 pb-16 px-6 lg:px-16 selection:bg-[#d4af37]/30 selection:text-[#1A1A1A]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Luxury Breadcrumbs */}
        <nav className="flex items-center gap-2.5 mb-8 text-[10px] tracking-[0.3em] uppercase font-outfit font-medium text-[#1A1A1A]/50 flex-wrap">
          <Link href="/" className="hover:text-[#9c7d23] transition-colors">Home</Link>
          {category && (
            <>
              <span className="text-[#9c7d23]/60">/</span>
              <Link href={`/category/${category.id}`} className="hover:text-[#9c7d23] transition-colors">
                {category.name}
              </Link>
            </>
          )}
          {subCategory && (
            <>
              <span className="text-[#9c7d23]/60">/</span>
              <Link
                href={`/category/${category!.id}/${subCategory.id}`}
                className="hover:text-[#9c7d23] transition-colors"
              >
                {subCategory.name}
              </Link>
            </>
          )}
          {subSubCategory && (
            <>
              <span className="text-[#9c7d23]/60">/</span>
              <span className="text-[#1A1A1A]/80">{subSubCategory.name}</span>
            </>
          )}
        </nav>

        {/* Product Details, Image Gallery & Variations Client Component */}
        <ProductDetailClient product={product} initialColor={initialColor} />

        {/* Related Products Section (Optimized spacing top and bottom) */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#1A1A1A]/15">
            <div className="flex flex-col items-center text-center mb-10">
              <span className="font-outfit font-medium text-[10.5px] tracking-[0.4em] uppercase text-[#9c7d23] mb-2.5">
                Curated For You
              </span>
              <h2 className="text-2xl md:text-3xl font-normal text-[#1A1A1A] tracking-widest">
                YOU MAY ALSO <span className="text-[#9c7d23]">LIKE</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}