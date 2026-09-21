import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById, getRelatedProducts } from "@/lib/supabase/products";
import { getCategoriesTree } from "@/lib/categories";
import ProductCard from "@/components/ProductCard";
import ProductDetailClient from "@/components/ProductDetailClient";
import { Sparkles, ArrowRight } from "lucide-react";

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
    <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pb-24 selection:bg-[#D4AF37]/30 selection:text-[#1A1A1A] pt-20 sm:pt-24">
      {/* 1. DUAL COMPOSITION: Luxury Dark Hero Banner Header */}
      <div className="relative w-full overflow-hidden border-b border-[#222] bg-[#0A0A0A] py-10 sm:py-14 mb-8 sm:mb-12 text-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] rounded-full blur-[140px] bg-[#D4AF37]/12" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)`,
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          {/* Atelier Hallmark Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-[#F5E6C8] text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium mb-3 shadow-md">
            <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
            <span>The Label 18 • Atelier Edition</span>
          </div>

          {/* Luxury Breadcrumb Bar */}
          <nav className="flex items-center justify-center gap-2 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-outfit text-white/60 flex-wrap mb-3">
            <Link href="/" className="hover:text-[#F5E6C8] transition-colors">Home</Link>
            <span className="text-[#D4AF37]/60">/</span>
            <Link href="/shop" className="hover:text-[#F5E6C8] transition-colors">Shop</Link>
            {category && (
              <>
                <span className="text-[#D4AF37]/60">/</span>
                <Link href={`/categories/${category.id}`} className="hover:text-[#F5E6C8] transition-colors">
                  {category.name}
                </Link>
              </>
            )}
            {subCategory && (
              <>
                <span className="text-[#D4AF37]/60">/</span>
                <span className="text-[#F5E6C8]/90">{subCategory.name}</span>
              </>
            )}
            {subSubCategory && (
              <>
                <span className="text-[#D4AF37]/60">/</span>
                <span className="text-[#F5E6C8]">{subSubCategory.name}</span>
              </>
            )}
          </nav>

          {/* Product Banner Heading */}
          <h1 className="mb-2">
            <span className="block font-outfit text-xs sm:text-sm font-light tracking-[0.22em] uppercase text-white/75">
              Signature Royal Edit
            </span>
            <span className="block font-outfit text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.08em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FBF5E8] via-[#E6C35C] to-[#C59B27] drop-shadow-[0_2px_15px_rgba(212,175,55,0.35)] mt-1">
              {product.name}
            </span>
          </h1>

          <div className="w-10 h-[1.5px] bg-[#D4AF37]/60 my-2.5" />

          {/* Brand Craftsmanship Guarantees */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 text-[9.5px] sm:text-[11px] tracking-[0.2em] uppercase text-white/70 font-outfit mt-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#D4AF37]" /> Pure Mulberry Silk</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#D4AF37]" /> Authentic Gold Zari</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#D4AF37]" /> Insured Express Delivery</span>
          </div>
        </div>
      </div>

      {/* 2. DUAL COMPOSITION: Warm Cream & Gold Luxury Catalog Area */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Product Details, Image Gallery & Variations Client Component */}
        <ProductDetailClient product={product} initialColor={initialColor} />

        {/* Related Products Section ("You May Also Like") */}
        {related.length > 0 && (
          <div className="mt-20 pt-16 border-t border-[#D4AF37]/25">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#9c7d23] text-[9.5px] tracking-[0.25em] uppercase font-outfit font-semibold mb-3">
                <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                <span>The Label 18 • Complete The Ensemble</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#1A1A1A] tracking-wider uppercase font-normal">
                YOU MAY ALSO <span className="text-[#9c7d23]">LIKE</span>
              </h2>
              <div className="w-10 h-[1.5px] bg-[#D4AF37]/60 my-3" />
              <p className="text-xs tracking-[0.2em] uppercase font-outfit text-[#1A1A1A]/60">
                Curated royal couture &amp; handcrafted heirlooms to accompany this piece
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
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