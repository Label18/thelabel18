"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import CanvasSequence, { SequenceConfig } from "@/components/CanvasSequence";
import { CategoryTree } from "@/lib/categories";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const sequences2: SequenceConfig[] = [
    { path: "/sequence3/ezgif-frame-", frameCount: 240 },
    { path: "/sequence4/ezgif-frame-", frameCount: 240 },
    { path: "/sequence5/ezgif-frame-", frameCount: 240 },
];

export default function JewelleryHero({ category }: { category: CategoryTree | undefined }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollSectionRef2 = useRef<HTMLDivElement>(null);
    const textRefs2 = useRef<(HTMLDivElement | null)[]>([]);
    const counterRef2 = useRef<HTMLSpanElement>(null);
    const scrollIndicatorRef2 = useRef<HTMLDivElement>(null);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
                tlScroll2.fromTo(text,
                    { opacity: 1, y: 0, scale: 1 },
                    { opacity: 1, y: 0, scale: 1, duration: slot2 * 0.65 },
                    wStart
                ).to(text,
                    { opacity: 0, y: -25, scale: 1.02, duration: fadeDur2 },
                    wEnd - fadeDur2 - (slot2 * 0.05)
                );
            } else if (isLast) {
                tlScroll2.fromTo(text,
                    { opacity: 0, y: 25, scale: 0.98 },
                    { opacity: 1, y: 0, scale: 1, duration: fadeDur2 * 1.2 },
                    wStart
                );
            } else {
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

        tlScroll2.set({}, {}, 1.05);

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
        <section id="hero2" ref={containerRef} className="bg-black">
            <div ref={scrollSectionRef2} className="hero-section" style={{ height: "900vh" }}>
                <div className="hero-sticky">
                    <CanvasSequence
                        triggerRef={scrollSectionRef2}
                        sequences={sequences2}
                        className="hero-canvas"
                        bgColor="black"
                        lazy={false}
                        priority={true}
                        focalPointY="top"
                        scale={1}
                        offsetX={isMobile ? 120 : 0}
                        offsetY={isMobile ? 80 : 100}
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
                        <Link href={category ? `/categories/${category.id}` : "/categories"} className="hero-cta-pill">
                            Explore {category?.name || "Jewellery"}
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
            </div>
        </section>
    );
}
