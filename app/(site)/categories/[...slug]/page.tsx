import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoriesTree, CategoryTree } from "@/lib/categories";
import { getProducts } from "@/lib/supabase/products";
import ProductFilters from "@/components/ProductFilters";
import ProductCard from "@/components/ProductCard";
import ExpandableCategoryDescription from "@/components/ExpandableCategoryDescription";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  if (!slug || slug.length === 0 || slug.length > 3) notFound();

  const [categoryId, subCategoryId, subSubCategoryId] = slug;

  const categories = await getCategoriesTree();
  const category = categories.find((c) => c.id === categoryId);
  if (!category) notFound();

  const subCategory = subCategoryId
    ? category.sub_categories.find((s) => s.id === subCategoryId)
    : undefined;
  if (subCategoryId && !subCategory) notFound();

  const subSubCategory = subSubCategoryId
    ? subCategory?.sub_sub_categories.find((s) => s.id === subSubCategoryId)
    : undefined;
  if (subSubCategoryId && !subSubCategory) notFound();

  const page = sp.page ? parseInt(sp.page) : 1;
  const { items, total, pageSize } = await getProducts({
    categoryId: category.id,
    subCategoryId: subCategory?.id,
    subSubCategoryId: subSubCategory?.id,
    search: sp.q,
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    sort: (sp.sort as any) ?? "newest",
    page,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentCategoryNode = subSubCategory ?? subCategory ?? category;
  const currentName = currentCategoryNode.name;
  const currentImage = currentCategoryNode.image_url;
  const currentDescription = currentCategoryNode.description;

  return (
    <main className="min-h-screen bg-[#F8F6F0] text-[#1A1A1A] pb-24 selection:bg-[#9c7d23]/30 selection:text-[#1A1A1A]">
      {/* Category Hero Banner */}
      {currentImage ? (
        <div className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center mb-16 overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: `url(${currentImage})` }}
          >
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-black/80 via-black/40 to-black/60"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 text-center px-6 mt-16 max-w-4xl">
            <span className="font-outfit font-light text-[10px] md:text-[12px] tracking-[0.5em] uppercase text-[#d4af37] mb-6 block drop-shadow-md">
              Collection
            </span>
            <h1 className="font-outfit font-light text-4xl md:text-7xl lg:text-8xl text-white tracking-widest uppercase drop-shadow-lg">
              {currentName}
            </h1>
            {currentDescription && (
              <ExpandableCategoryDescription
                description={currentDescription}
                variant="dark"
                className="mt-6"
              />
            )}
            <p className="font-outfit font-light text-[11px] md:text-[12px] tracking-[0.2em] uppercase text-[#d4af37] mt-6">
              {total} {total === 1 ? "piece" : "pieces"}
              {sp.q ? ` · matching "${sp.q}"` : ""}
            </p>
          </div>
        </div>
      ) : (
        <div className="pt-32 md:pt-40 mb-14 text-center px-6">
          <span className="font-outfit font-light text-[10px] tracking-[0.5em] uppercase text-[#9c7d23] mb-4 block">
            Category
          </span>
          <h1 className="font-outfit font-light text-3xl md:text-6xl text-[#1A1A1A] tracking-widest uppercase">
            {currentName}
          </h1>
          {currentDescription && (
            <ExpandableCategoryDescription
              description={currentDescription}
              variant="light"
              className="mt-4"
            />
          )}
          <p className="font-outfit font-light text-[12px] tracking-[0.2em] uppercase text-[#1A1A1A]/40 mt-5">
            {total} {total === 1 ? "product" : "products"}
            {sp.q ? ` · matching "${sp.q}"` : ""}
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-thin">
          <ol className="flex items-center gap-x-2 font-outfit font-medium text-[11px] tracking-[0.15em] uppercase text-[#1A1A1A]/70 w-max">
            <li className="flex items-center gap-x-2">
              <Link href="/" className="hover:text-[#9c7d23] transition-colors">Home</Link>
            </li>
            <li className="flex items-center gap-x-2">
              <span>/</span>
              <Link
                href={`/categories/${category.id}`}
                className={`hover:text-[#9c7d23] transition-colors ${!subCategory ? "text-[#1A1A1A]" : ""}`}
              >
                {category.name}
              </Link>
            </li>
            {subCategory && (
              <li className="flex items-center gap-x-2">
                <span>/</span>
                <Link
                  href={`/categories/${category.id}/${subCategory.id}`}
                  className={`hover:text-[#9c7d23] transition-colors ${!subSubCategory ? "text-[#1A1A1A]" : ""}`}
                >
                  {subCategory.name}
                </Link>
              </li>
            )}
            {subSubCategory && (
              <li className="flex items-center gap-x-2">
                <span>/</span>
                <span className="text-[#1A1A1A]">{subSubCategory.name}</span>
              </li>
            )}
          </ol>
        </nav>
        {/* Filters Top Bar */}
        <div className="mb-10 w-full">
          <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-[#1A1A1A]/10 p-4 md:p-6 shadow-sm">
            <ProductFilters
              categories={categories}
              initialCategoryId={category.id}
              initialSubCategoryId={subCategory?.id}
              initialSubSubCategoryId={subSubCategory?.id}
              basePath="/categories"
              hideCategoryDropdown={true}
            />
          </div>
        </div>

        {/* Results */}
        <div className="w-full">
          {items.length === 0 ? (
            <div className="text-center py-24 rounded-xl bg-white border border-[#1A1A1A]/10">
              <p className="font-outfit font-medium text-[13px] tracking-[0.1em] uppercase text-[#1A1A1A]/70">
                No products found in this category.
              </p>
              <Link
                href={`/categories/${category.id}`}
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

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-14">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const qp = new URLSearchParams({ ...sp, page: String(p) } as any);
                  const isActive = p === page;
                  return (
                    <Link
                      key={p}
                      href={`/categories/${slug.join("/")}?${qp.toString()}`}
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