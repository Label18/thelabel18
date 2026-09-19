"use client";

import { useEffect, useState } from "react";
import { getCategoriesTree, CategoryTree } from "@/lib/categories";
import ClothingHero from "@/components/home/ClothingHero";
import ClothingShowcase from "@/components/home/ClothingShowcase";
import JewelleryHero from "@/components/home/JewelleryHero";
import JewelleryShowcase from "@/components/home/JewelleryShowcase";

export default function Home() {
    const [categories, setCategories] = useState<CategoryTree[]>([]);

    useEffect(() => {
        getCategoriesTree().then(setCategories).catch(console.error);
    }, []);

    const clothingCat = categories.find(c =>
        c.name.toLowerCase().includes("cloth") ||
        c.name.toLowerCase().includes("ethnic") ||
        c.name.toLowerCase().includes("wear") ||
        c.name.toLowerCase().includes("dress")
    ) || categories[0];

    const jewelleryCat = categories.find(c =>
        c.name.toLowerCase().includes("jewel") ||
        c.name.toLowerCase().includes("accessor")
    ) || categories[1];

    return (
        <main className="bg-black">
            <ClothingHero category={clothingCat} />
            <ClothingShowcase category={clothingCat} />
            <JewelleryHero category={jewelleryCat} />
            <JewelleryShowcase category={jewelleryCat} />
        </main>
    );
}