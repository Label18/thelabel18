"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import CanvasSequence, { SequenceConfig } from "@/components/CanvasSequence";
import { getCategoriesTree, CategoryTree } from "@/lib/categories";
import ExpandableCategoryDescription from "@/components/ExpandableCategoryDescription";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const sequences: SequenceConfig[] = [
    { path: "/ezgif-8e1957c3e1c78d6d-png-split/ezgif-frame-", frameCount: 300, extension: "png", digits: 3, startFrame: 1 },
];

const sequences2: SequenceConfig[] = [
    { path: "/sequence3/ezgif-frame-", frameCount: 240 },
    { path: "/sequence4/ezgif-frame-", frameCount: 240 },
    { path: "/sequence5/ezgif-frame-", frameCount: 240 },
];

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Section 1 refs
    const scrollSectionRef = useRef<HTMLDivElement>(null);
    const textRefs = useRef<(HTMLDivElement | null)[]>([]);
    const counterRef1 = useRef<HTMLSpanElement>(null);
    const scrollIndicatorRef1 = useRef<HTMLDivElement>(null);

    // Section 2 refs
    const scrollSectionRef2 = useRef<HTMLDivElement>(null);
    const textRefs2 = useRef<(HTMLDivElement | null)[]>([]);
    const counterRef2 = useRef<HTMLSpanElement>(null);
    const scrollIndicatorRef2 = useRef<HTMLDivElement>(null);

    // Dynamic Categories from Admin Panel
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

    const fallbackClothingImages = [
        "/ezgif-8e1957c3e1c78d6d-png-split/ezgif-frame-050.png",
        "/ezgif-8e1957c3e1c78d6d-png-split/ezgif-frame-100.png",
        "/ezgif-8e1957c3e1c78d6d-png-split/ezgif-frame-150.png",
        "/ezgif-8e1957c3e1c78d6d-png-split/ezgif-frame-200.png",
    ];

    const fallbackJewelleryImages = [
        "/sequence3/ezgif-frame-050.jpg",
        "/sequence4/ezgif-frame-050.jpg",
        "/sequence5/ezgif-frame-050.jpg",
        "/sequence3/ezgif-frame-150.jpg",
    ];

    // Callback for CanvasSequence section 1 progress — updates counter + scroll indicator via DOM
    const onProgress1 = useCallback((progress: number) => {
        const num = Math.min(10, Math.floor(progress * 10) + 1);
        if (counterRef1.current) {
            counterRef1.current.textContent = num < 10 ? `0${num}` : `${num}`;
        }
        if (scrollIndicatorRef1.current) {
            scrollIndicatorRef1.current.classList.toggle('hidden', progress > 0.02);
        }
    }, []);

    // Callback for CanvasSequence section 2 progress — updates counter + scroll indicator via DOM
    const onProgress2 = useCallback((progress: number) => {
        const num = Math.min(10, Math.floor(progress * 10) + 1);
        if (counterRef2.current) {
            counterRef2.current.textContent = num < 10 ? `0${num}` : `${num}`;
        }
        if (scrollIndicatorRef2.current) {
            scrollIndicatorRef2.current.classList.toggle('hidden', progress > 0.02);
        }
    }, []);

    useGSAP(() => {
        // === SECTION 1 LOGIC ===
        const tlScroll = gsap.timeline({
            scrollTrigger: {
                trigger: scrollSectionRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
            }
        });

        const populated1 = textRefs.current.filter(Boolean);
        const textCount = populated1.length;
        const slot1 = 1 / textCount;
        populated1.forEach((text, i) => {
            if (!text) return;

            const isLast = i === textCount - 1;
            const wStart = i * slot1;
            const wEnd = (i + 1) * slot1;
            const fadeDur = slot1 * 0.28;

            if (i === 0) {
                // Starts immediately visible, stays full, then fades out completely before next slot
                tlScroll.fromTo(text,
                    { opacity: 1, y: 0, scale: 1 },
                    { opacity: 1, y: 0, scale: 1, duration: slot1 * 0.65 },
                    wStart
                ).to(text,
                    { opacity: 0, y: -25, scale: 1.02, duration: fadeDur },
                    wEnd - fadeDur - (slot1 * 0.05)
                );
            } else if (isLast) {
                // Fades in only after previous has completely faded away, then remains visible
                tlScroll.fromTo(text,
                    { opacity: 0, y: 25, scale: 0.98 },
                    { opacity: 1, y: 0, scale: 1, duration: fadeDur * 1.2 },
                    wStart
                );
            } else {
                // Fades in after previous is gone, stays visible, fades out completely before next slot
                tlScroll.fromTo(text,
                    { opacity: 0, y: 25, scale: 0.98 },
                    { opacity: 1, y: 0, scale: 1, duration: fadeDur },
                    wStart
                ).to(text,
                    { opacity: 0, y: -25, scale: 1.02, duration: fadeDur },
                    wEnd - fadeDur - (slot1 * 0.05)
                );
            }
        });

        // Pad the timeline to allow dead space at the end of the section for the last element
        tlScroll.set({}, {}, 1.05);

        // === SECTION 2 LOGIC ===
        const tlScroll2 = gsap.timeline({
            scrollTrigger: {
                trigger: scrollSectionRef2.current,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
            }
        });

        const populated2 = textRefs2.current.filter(Boolean);
        const textCount2 = populated2.length;
        const slot2 = 1 / textCount2;
        populated2.forEach((text, i) => {
            if (!text) return;

            const isLast = i === textCount2 - 1;
            const wStart = i * slot2;
            const wEnd = (i + 1) * slot2;
            const fadeDur2 = slot2 * 0.28;

            if (i === 0) {
                // Starts immediately visible, stays full, then fades out completely before next slot
                tlScroll2.fromTo(text,
                    { opacity: 1, y: 0, scale: 1 },
                    { opacity: 1, y: 0, scale: 1, duration: slot2 * 0.65 },
                    wStart
                ).to(text,
                    { opacity: 0, y: -25, scale: 1.02, duration: fadeDur2 },
                    wEnd - fadeDur2 - (slot2 * 0.05)
                );
            } else if (isLast) {
                // Fades in only after previous has completely faded away, then remains visible
                tlScroll2.fromTo(text,
                    { opacity: 0, y: 25, scale: 0.98 },
                    { opacity: 1, y: 0, scale: 1, duration: fadeDur2 * 1.2 },
                    wStart
                );
            } else {
                // Fades in after previous is gone, stays visible, fades out completely before next slot
                tlScroll2.fromTo(text,
                    { opacity: 0, y: 25, scale: 0.98 },
                    { opacity: 1, y: 0, scale: 1, duration: fadeDur2 },
                    wStart
                ).to(text,
                    { opacity: 0, y: -25, scale: 1.02, duration: fadeDur2 },
                    wEnd - fadeDur2 - (slot2 * 0.05)
                );
            }
        });

        // Pad the timeline to allow dead space at the end of the section for the last element
        tlScroll2.set({}, {}, 1.05);

        // Intro Overlay scroll behavior
        const introOverlay = document.getElementById("intro-overlay");
        const onScroll = () => {
            if (window.scrollY > 50) {
                introOverlay?.classList.add("is-scrolled");
            } else {
                introOverlay?.classList.remove("is-scrolled");
            }
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);

    }, { scope: containerRef });



    return (
        <main ref={containerRef} className="bg-black">


            {/* ============================================================ */}
            {/* HERO SECTION 1 - ETHNIC WEAR / CLOTHING                     */}
            {/* ============================================================ */}
            <section id="hero" ref={scrollSectionRef} className="hero-section" style={{ height: "600vh" }}>
                <div className="hero-sticky">
                    <CanvasSequence
                        triggerRef={scrollSectionRef}
                        sequences={sequences}
                        className="hero-canvas"
                        bgColor="black"
                        priority={true}
                        focalPointY="top"
                        offsetY={60}
                        onProgressChange={onProgress1}
                    />

                    <div className="hero-gradient-overlay"></div>

                    <div ref={el => { textRefs.current[0] = el; }} className="hero-text-overlay text-first">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Label 18 Experience</span>
                        </div>
                        <h1 className="hero-title-bold">
                            <span style={{ color: "var(--color-gold)" }}>BOUTIQUE</span> <span style={{ color: "#ffffff" }}>ELEGANCE.</span>
                        </h1>
                        <p className="hero-desc">Step into a world where timeless elegance meets contemporary grace in a curated setting.</p>
                    </div>

                    <div ref={el => { textRefs.current[1] = el; }} className="hero-text-overlay hero-text-right pos-top-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Handwoven Mastery</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>ARTISANAL</span> <span style={{ color: "#ffffff" }}>SAREES</span>
                        </h2>
                        <p className="hero-desc">Discover the intricate weave of our signature silk sarees, crafted with absolute precision.</p>
                    </div>

                    <div ref={el => { textRefs.current[2] = el; }} className="hero-text-overlay hero-text-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">The Perfect Drape</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>FLUID</span> <span style={{ color: "#ffffff" }}>POETRY</span>
                        </h2>
                        <p className="hero-desc">Experience the lightweight comfort and fluid motion of our premium fabrics that flow with you.</p>
                    </div>

                    <div ref={el => { textRefs.current[3] = el; }} className="hero-text-overlay hero-text-right pos-top-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Golden Details</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>ZARI</span> <span style={{ color: "#ffffff" }}>BORDERS</span>
                        </h2>
                        <p className="hero-desc">Gleaming golden borders that add a touch of royal heritage to every single silhouette.</p>
                    </div>

                    <div ref={el => { textRefs.current[4] = el; }} className="hero-text-overlay hero-text-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Curated Collection</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>EXCLUSIVE</span> <span style={{ color: "#ffffff" }}>DESIGNS</span>
                        </h2>
                        <p className="hero-desc">A carefully curated selection of ethnic wear that speaks to your unique individual style.</p>
                    </div>

                    <div ref={el => { textRefs.current[5] = el; }} className="hero-text-overlay hero-text-right pos-top-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Intimate Settings</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>PERSONALIZED</span> <span style={{ color: "#ffffff" }}>STYLING</span>
                        </h2>
                        <p className="hero-desc">Enjoy a personalized boutique experience designed to find the perfect match for you.</p>
                    </div>

                    <div ref={el => { textRefs.current[6] = el; }} className="hero-text-overlay hero-text-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Rich Hues</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>DEEP</span> <span style={{ color: "#ffffff" }}>INDIGO</span>
                        </h2>
                        <p className="hero-desc">Dive into our palette of rich, deep colors that capture ambient light beautifully.</p>
                    </div>

                    <div ref={el => { textRefs.current[7] = el; }} className="hero-text-overlay hero-text-right pos-top-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Celebratory Aura</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>FESTIVE</span> <span style={{ color: "#ffffff" }}>SPLENDOR</span>
                        </h2>
                        <p className="hero-desc">Curated for unforgettable wedding chapters, intimate celebrations, and grand evenings.</p>
                    </div>

                    <div ref={el => { textRefs.current[8] = el; }} className="hero-text-overlay hero-text-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">The Label 18 Muse</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>TIMELESS</span> <span style={{ color: "#ffffff" }}>CONFIDENCE</span>
                        </h2>
                        <p className="hero-desc">Crafted for the modern woman whose presence speaks of understated power and enduring charm.</p>
                    </div>

                    <div ref={el => { textRefs.current[9] = el; }} className="hero-text-overlay hero-text-right text-last">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Complete Collection</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>MAKE IT</span> <span style={{ color: "#ffffff" }}>YOURS</span>
                        </h2>
                        <Link href={clothingCat ? `/categories/${clothingCat.id}` : "/categories"} className="hero-cta-pill">
                            Explore {clothingCat?.name || "Clothing"}
                        </Link>
                    </div>

                    <div ref={scrollIndicatorRef1} className="scroll-indicator">
                        <div className="scroll-line"></div>
                        <span className="scroll-text">Scroll to explore</span>
                    </div>

                    <div className="hero-counter">
                        <span ref={counterRef1} className="counter-current">01</span>
                        <div className="counter-divider"></div>
                        <span className="counter-total">10</span>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* CLOTHING PRODUCTS SHOWCASE                                   */}
            {/* ============================================================ */}
            <section className="bg-[#F8F6F0] relative z-10 text-[#1A1A1A] py-14 sm:py-20 md:py-28">
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
                                description={clothingCat?.description || "Discover exquisite ethnic silhouettes, signature sarees, and festive wear tailored for graceful elegance."}
                                variant="light"
                            />
                        </div>

                        <div className="category-grid">
                            {(clothingCat?.sub_categories && clothingCat.sub_categories.length > 0
                                ? clothingCat.sub_categories
                                : [
                                    { id: "1", name: "Signature Saree", image_url: null },
                                    { id: "2", name: "Classic Lehenga", image_url: null },
                                    { id: "3", name: "Evening Kurti", image_url: null }
                                ]
                            ).map((sub: any, i: number) => {
                                const href = clothingCat && sub.id !== "1" && sub.id !== "2" && sub.id !== "3"
                                    ? `/categories/${clothingCat.id}/${sub.id}`
                                    : clothingCat ? `/categories/${clothingCat.id}` : "/shop";
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
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* HERO SECTION 2 - JEWELRY                                     */}
            {/* ============================================================ */}
            <section id="hero2" ref={scrollSectionRef2} className="hero-section" style={{ height: "900vh" }}>
                <div className="hero-sticky">
                    <CanvasSequence
                        triggerRef={scrollSectionRef2}
                        sequences={sequences2}
                        className="hero-canvas"
                        lazy={true}
                        onProgressChange={onProgress2}
                    />

                    <div className="hero-gradient-overlay"></div>

                    <div ref={el => { textRefs2.current[0] = el; }} className="hero-text-overlay text-first">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">The Jewelry Edit</span>
                        </div>
                        <h1 className="hero-title-bold">
                            <span style={{ color: "var(--color-gold)" }}>A NEW</span> <span style={{ color: "#ffffff" }}>VISION</span>
                        </h1>
                        <p className="hero-desc">Discover brilliance captured in precious metals and flawless stones.</p>
                    </div>

                    <div ref={el => { textRefs2.current[1] = el; }} className="hero-text-overlay hero-text-right pos-top-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Craftsmanship</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>MASTER</span> <span style={{ color: "#ffffff" }}>FORGED</span>
                        </h2>
                        <p className="hero-desc">Every link and setting is carefully crafted by master jewelers.</p>
                    </div>

                    <div ref={el => { textRefs2.current[2] = el; }} className="hero-text-overlay hero-text-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Materials</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>SOLID</span> <span style={{ color: "#ffffff" }}>GOLD</span>
                        </h2>
                        <p className="hero-desc">Forged from 18k solid gold that commands the room with its weight and warmth.</p>
                    </div>

                    <div ref={el => { textRefs2.current[3] = el; }} className="hero-text-overlay hero-text-right pos-top-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Brilliance</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>RADIANT</span> <span style={{ color: "#ffffff" }}>CUT</span>
                        </h2>
                        <p className="hero-desc">Flawless stones that capture and multiply the light around you.</p>
                    </div>

                    <div ref={el => { textRefs2.current[4] = el; }} className="hero-text-overlay hero-text-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Elegance</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>ETERNAL</span> <span style={{ color: "#ffffff" }}>BEAUTY</span>
                        </h2>
                        <p className="hero-desc">A timeless statement that transcends generations and trends.</p>
                    </div>

                    <div ref={el => { textRefs2.current[5] = el; }} className="hero-text-overlay hero-text-right pos-top-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Details</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>INTRICATE</span> <span style={{ color: "#ffffff" }}>DESIGN</span>
                        </h2>
                        <p className="hero-desc">No facet is left untouched. Absolute perfection from every conceivable angle.</p>
                    </div>

                    <div ref={el => { textRefs2.current[6] = el; }} className="hero-text-overlay hero-text-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Luxury</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>ULTIMATE</span> <span style={{ color: "#ffffff" }}>SHINE</span>
                        </h2>
                        <p className="hero-desc">Wear your brilliance on your sleeve and illuminate every room you enter.</p>
                    </div>

                    <div ref={el => { textRefs2.current[7] = el; }} className="hero-text-overlay hero-text-right pos-top-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Excellence</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>PURE</span> <span style={{ color: "#ffffff" }}>ELEGANCE</span>
                        </h2>
                        <p className="hero-desc">Adorn yourself in unmatched sophistication and grace.</p>
                    </div>

                    <div ref={el => { textRefs2.current[8] = el; }} className="hero-text-overlay hero-text-right">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">The Peak</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>SUPREME</span> <span style={{ color: "#ffffff" }}>CRAFT</span>
                        </h2>
                        <p className="hero-desc">A culmination of artistic vision and master execution.</p>
                    </div>

                    <div ref={el => { textRefs2.current[9] = el; }} className="hero-text-overlay hero-text-right text-last">
                        <div className="hero-accent-line">
                            <div className="accent-bar"></div>
                            <span className="accent-label">Collection</span>
                        </div>
                        <h2 className="hero-title-bold hero-title-md">
                            <span style={{ color: "var(--color-gold)" }}>OWN THE</span> <span style={{ color: "#ffffff" }}>LIGHT</span>
                        </h2>
                        <Link href={jewelleryCat ? `/categories/${jewelleryCat.id}` : "/categories"} className="hero-cta-pill">
                            Explore {jewelleryCat?.name || "Jewellery"}
                        </Link>
                    </div>

                    <div ref={scrollIndicatorRef2} className="scroll-indicator">
                        <div className="scroll-line"></div>
                        <span className="scroll-text">Scroll to explore</span>
                    </div>

                    <div className="hero-counter">
                        <span ref={counterRef2} className="counter-current">01</span>
                        <div className="counter-divider"></div>
                        <span className="counter-total">10</span>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* JEWELLERY PRODUCTS SHOWCASE                                  */}
            {/* ============================================================ */}
            <section className="bg-[#F8F6F0] relative z-10 text-[#1A1A1A] py-14 sm:py-20 md:py-28">
                <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-7xl">
                        <div className="flex flex-col items-center text-center mb-10 sm:mb-14 md:mb-16">
                            <div className="hero-accent-line justify-center mb-3 sm:mb-4">
                                <span className="accent-label" style={{ color: "#9c7d23" }}>Explore Category</span>
                            </div>
                            <h2 className="hero-title-bold font-outfit text-center whitespace-normal sm:whitespace-nowrap" style={{ fontSize: 'clamp(1.6rem, 5.5vw, 3.2rem)', color: "#1A1A1A", marginBottom: "0.75rem" }}>
                                <span style={{ color: "var(--color-gold)" }}>JEWELLERY</span> CATEGORY
                            </h2>
                            <ExpandableCategoryDescription
                                description={jewelleryCat?.description || "Explore timeless fine jewellery, radiant stones, and signature pieces crafted to illuminate every moment."}
                                variant="light"
                            />
                        </div>

                        <div className="category-grid">
                            {(jewelleryCat?.sub_categories && jewelleryCat.sub_categories.length > 0
                                ? jewelleryCat.sub_categories
                                : [
                                    { id: "1", name: "18k Solid Link", image_url: null },
                                    { id: "2", name: "Radiant Solitaire", image_url: null },
                                    { id: "3", name: "Eternity Band", image_url: null }
                                ]
                            ).map((sub: any, i: number) => {
                                const href = jewelleryCat && sub.id !== "1" && sub.id !== "2" && sub.id !== "3"
                                    ? `/categories/${jewelleryCat.id}/${sub.id}`
                                    : jewelleryCat ? `/categories/${jewelleryCat.id}` : "/shop";
                                const img = sub.image_url || fallbackJewelleryImages[i % fallbackJewelleryImages.length];
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
                    </div>
                </div>
            </section>


        </main>
    );
}