"use client";

import { useEffect, useState } from "react";
import { getCategoriesTree, CategoryTree } from "@/lib/categories";
import { createClient } from "@/lib/supabase/client";
import { ProductWithPrice } from "@/lib/supabase/products";
import HeroBanner from "@/components/home/HeroBanner";
import BrandPhilosophy from "@/components/home/BrandPhilosophy";
import ClothingShowcase from "@/components/home/ClothingShowcase";
import CraftsmanshipStory from "@/components/home/CraftsmanshipStory";
import JewelleryShowcase from "@/components/home/JewelleryShowcase";
import VipClubSection from "@/components/home/VipClubSection";

export default function Home() {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [products, setProducts] = useState<ProductWithPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catTree, rawProducts] = await Promise.all([
          getCategoriesTree(),
          createClient()
            .from("products")
            .select("*, product_variations(*)")
            .eq("is_visible", true),
        ]);

        setCategories(catTree);

        if (rawProducts.data) {
          const formatted: ProductWithPrice[] = rawProducts.data.map((p: any) => {
            const variations = p.product_variations || [];
            const validPrices = variations
              .filter((v: any) => v.is_visible !== false && v.price != null)
              .map((v: any) => Number(v.price));

            const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;
            const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : null;
            const inStock = variations.some((v: any) => (v.stock_quantity ?? 0) > 0);

            return {
              ...p,
              minPrice,
              maxPrice,
              inStock,
            };
          });

          setProducts(formatted);
        }
      } catch (err) {
        console.error("Error loading home page data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const clothingCat =
    categories.find(
      (c) =>
        c.name.toLowerCase().includes("cloth") ||
        c.name.toLowerCase().includes("ethnic") ||
        c.name.toLowerCase().includes("wear") ||
        c.name.toLowerCase().includes("dress")
    ) || categories[0];

  const jewelleryCat =
    categories.find(
      (c) =>
        c.name.toLowerCase().includes("jewel") ||
        c.name.toLowerCase().includes("accessor")
    ) || categories[1];

  const clothingProducts = clothingCat
    ? products.filter((p) => p.category_id === clothingCat.id)
    : products;

  const jewelleryProducts = jewelleryCat
    ? products.filter((p) => p.category_id === jewelleryCat.id)
    : products;

  return (
    <main className="bg-black min-h-screen text-white selection:bg-[#d4af37]/30 selection:text-white">
      {/* 1. Flagship Luxury Hero Banner */}
      <HeroBanner
        clothingCategory={clothingCat}
        jewelleryCategory={jewelleryCat}
      />

      {/* 2. Haute Couture & Artisanal Silks Showcase */}
      <ClothingShowcase category={clothingCat} products={clothingProducts} />

      {/* 3. Behind The Brand: Artisanal Heritage & Real Craftsmanship */}
      <CraftsmanshipStory />

      {/* 4. Fine Jewellery & Heirloom Ornaments Showcase */}
      <JewelleryShowcase category={jewelleryCat} products={jewelleryProducts} />

      {/* 5. Brand Identity & 4 Pillars (Handcrafted Luxury, Hallmarked Purity, Bespoke Fitting, Express Shipping) - Completely at the bottom */}
      <BrandPhilosophy />

      {/* 6. VIP Circle Concierge & Social Highlights */}
      <VipClubSection />

    </main>
  );
}