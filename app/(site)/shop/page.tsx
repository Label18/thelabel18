import { getCategoriesTree, type CategoryTree } from "@/lib/categories";
import { getProducts } from "@/lib/supabase/products";
import ProductFilters from "@/components/ProductFilters";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

type Crumb = { label: string; href?: string };

// Walks the category tree to resolve the active category/sub/subsub names
// from the search params, so the breadcrumb reflects the real filter chain.
function buildBreadcrumbs(
  categories: CategoryTree[],
  params: { category?: string; sub?: string; subsub?: string }
): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Home", href: "/" }];

  if (!params.category) {
    crumbs.push({ label: "Shop" });
    return crumbs;
  }

  crumbs.push({ label: "Shop", href: "/shop" });

  const cat = categories.find((c) => c.id === params.category);
  if (!cat) return crumbs;

  const catHref = `/shop?category=${cat.id}`;
  if (!params.sub) {
    crumbs.push({ label: cat.name });
    return crumbs;
  }
  crumbs.push({ label: cat.name, href: catHref });

  const sub = cat.sub_categories.find((s) => s.id === params.sub);
  if (!sub) return crumbs;

  const subHref = `${catHref}&sub=${sub.id}`;
  if (!params.subsub) {
    crumbs.push({ label: sub.name });
    return crumbs;
  }
  crumbs.push({ label: sub.name, href: subHref });

  const leaf = sub.sub_sub_categories.find((l) => l.id === params.subsub);
  if (leaf) crumbs.push({ label: leaf.name });

  return crumbs;
}

function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-thin">
      <ol className="flex items-center gap-x-2 font-outfit font-light text-[11px] tracking-[0.15em] uppercase w-max">
        {crumbs.map((crumb, i) => (
          <li key={i} className="flex items-center gap-x-2">
            {i > 0 && <span className="text-[#9c7d23]/50">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="text-[#1A1A1A]/50 hover:text-[#9c7d23] transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[#1A1A1A]" aria-current="page">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const categories = await getCategoriesTree();

  const page = params.page ? parseInt(params.page) : 1;
  const { items, total, pageSize } = await getProducts({
    categoryId: params.category,
    subCategoryId: params.sub,
    subSubCategoryId: params.subsub,
    search: params.q,
    minPrice: params.min ? Number(params.min) : undefined,
    maxPrice: params.max ? Number(params.max) : undefined,
    sort: (params.sort as any) ?? "newest",
    page,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const crumbs = buildBreadcrumbs(categories, {
    category: params.category,
    sub: params.sub,
    subsub: params.subsub,
  });

  return (
    <main className="min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pb-24 selection:bg-[#9c7d23]/30 selection:text-[#1A1A1A]">
      {/* Hero Banner */}
      <div 
        className="relative w-full h-[45vh] min-h-[360px] flex items-center justify-center mb-14 overflow-hidden bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop')` 
        }}
      >
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/45"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8F6F0] via-transparent to-black/30"></div>
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d4af37] via-transparent to-transparent"></div>
        
        {/* Clean Serif Editorial Typography (Non-Italic) */}
        <div className="relative z-10 text-center px-6 pt-10 max-w-3xl flex flex-col items-center justify-center h-full w-full">
          <span className="font-outfit font-light text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-[#d4af37] mb-3 block drop-shadow-md">
            The Collection
          </span>
          <h1 className="font-serif font-light text-3xl md:text-5xl lg:text-6xl text-white tracking-wide drop-shadow-xl">
            Shop The Edit
          </h1>
          <div className="w-10 h-[1px] bg-[#d4af37]/70 my-4"></div>
          <p className="font-outfit font-light text-[11px] md:text-[12px] tracking-[0.2em] uppercase text-white/90 max-w-lg mx-auto leading-relaxed drop-shadow">
            Explore our complete collection of premium fashion and timeless jewelry
          </p>
          <p className="font-outfit font-light text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-[#d4af37] mt-4 drop-shadow-md">
            {total} {total === 1 ? "piece" : "pieces"}
            {params.q ? ` · matching "${params.q}"` : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <Breadcrumbs crumbs={crumbs} />

        {/* Filters Top Bar */}
        <div className="mb-10 w-full">
          <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-[#1A1A1A]/10 p-4 md:p-6 shadow-sm">
            <ProductFilters categories={categories} />
          </div>
        </div>

        {/* Results */}
        <div className="w-full">
          {items.length === 0 ? (
            <div className="text-center py-24 rounded-xl bg-white border border-[#1A1A1A]/10">
                <p className="font-outfit font-light text-[13px] tracking-[0.1em] uppercase text-[#1A1A1A]/50">
                  No products match these filters.
                </p>
                <Link
                  href="/shop"
                  className="inline-block mt-4 text-[11px] tracking-[0.2em] uppercase font-outfit font-medium text-[#9c7d23] hover:text-[#1A1A1A] transition-colors"
                >
                  Clear filters →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-14">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const qp = new URLSearchParams({ ...params, page: String(p) } as any);
                  const isActive = p === page;
                  return (
                    <Link
                      key={p}
                      href={`/shop?${qp.toString()}`}
                      className={`text-[12px] font-outfit font-medium w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                        isActive
                          ? "bg-[#9c7d23] text-white"
                          : "text-[#1A1A1A]/60 hover:text-[#9c7d23] border border-[#1A1A1A]/10 bg-white"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    );
}