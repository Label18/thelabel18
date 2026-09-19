"use client";

import Link from "next/link";
import ExpandableCategoryDescription from "@/components/ExpandableCategoryDescription";
import { CategoryTree } from "@/lib/categories";

const fallbackClothingImages = [
    "/kling-webp/frame_000050.webp",
    "/kling-webp/frame_000100.webp",
    "/kling-webp/frame_000150.webp",
    "/kling-webp/frame_000190.webp",
];

export default function ClothingShowcase({ category }: { category: CategoryTree | undefined }) {
    return (
        <section className="bg-[#F8F6F0] relative z-10 text-[#1A1A1A] pb-14 pt-8 sm:pb-20 sm:pt-10 md:pb-28 md:pt-12">
            <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-7xl">
                    <div className="flex flex-col items-center text-center mb-10 sm:mb-14 md:mb-16">
                        <div className="hero-accent-line justify-center mb-3 sm:mb-4">
                            <span className="accent-label" style={{ color: "#9c7d23" }}>Explore Category</span>
                        </div>
                        <h2 className="hero-title-bold font-outfit text-center whitespace-normal sm:whitespace-nowrap" style={{ fontSize: 'clamp(1.6rem, 5.5vw, 3.2rem)', color: "#1A1A1A", marginBottom: "0.75rem" }}>
                            <span style={{ color: "var(--color-gold)" }}>CLOTHING</span> CATEGORY
                        </h2>
                        <ExpandableCategoryDescription
                            description={category?.description || "Discover exquisite ethnic silhouettes, signature sarees, and festive wear tailored for graceful elegance."}
                            variant="light"
                        />
                    </div>

                    {category?.sub_categories && category.sub_categories.length > 0 ? (
                        <div className="category-grid">
                            {category.sub_categories.map((sub: any, i: number) => {
                                const href = `/categories/${category.id}/${sub.id}`;
                                const img = sub.image_url || fallbackClothingImages[i % fallbackClothingImages.length];
                                return (
                                    <Link href={href} key={sub.id || i} className="category-card group bg-white shadow-sm border border-[#1A1A1A]/10">
                                        <div className="category-card-image">
                                            <img src={img} alt={sub.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            <div className="category-card-gradient"></div>
                                            <div className="category-card-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%', left: 0, right: 0 }}>
                                                <h3 style={{ textAlign: 'center', margin: 0, width: '100%' }}>{sub.name}</h3>
                                                <p style={{ textAlign: 'center', width: '100%' }}>Explore Collection</p>
                                            </div>
                                        </div>
                                        <div className="category-card-bar"></div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-[#1A1A1A]/60 italic font-outfit">
                            No sub categories are added yet.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
