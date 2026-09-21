"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import CanvasSequence, { SequenceConfig } from "@/components/CanvasSequence";
import { CategoryTree } from "@/lib/categories";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/** Full frame config (desktop uses all, mobile skips every other frame) */
const FULL_SEQUENCES: SequenceConfig[] = [
    { path: "/kling-webp/frame_", frameCount: 193, extension: "webp", digits: 6, startFrame: 1 },
];
const MOBILE_SEQUENCES: SequenceConfig[] = [
    { path: "/kling-webp/frame_", frameCount: 97, extension: "webp", digits: 6, startFrame: 1, frameStep: 2 },
];

export default function ClothingHero({ category }: { category: CategoryTree | undefined }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollSectionRef = useRef<HTMLDivElement>(null);
    const textRefs = useRef<(HTMLDivElement | null)[]>([]);
    const counterRef1 = useRef<HTMLSpanElement>(null);
    const scrollIndicatorRef1 = useRef<HTMLDivElement>(null);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const sequences = isMobile ? MOBILE_SEQUENCES : FULL_SEQUENCES;

    const onProgress1 = useCallback((progress: number) => {
        const num = Math.min(10, Math.floor(progress * 10) + 1);
        if (counterRef1.current) {
            counterRef1.current.textContent = num < 10 ? `0${num}` : `${num}`;
        }
        if (scrollIndicatorRef1.current) {
            scrollIndicatorRef1.current.classList.toggle('hidden', progress > 0.02);
        }
    }, []);

    useGSAP(() => {
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
                tlScroll.fromTo(text,
                    { opacity: 1, y: 0, scale: 1 },
                    { opacity: 1, y: 0, scale: 1, duration: slot1 * 0.65 },
                    wStart
                ).to(text,
                    { opacity: 0, y: -25, scale: 1.02, duration: fadeDur },
                    wEnd - fadeDur - (slot1 * 0.05)
                );
            } else if (isLast) {
                tlScroll.fromTo(text,
                    { opacity: 0, y: 25, scale: 0.98 },
                    { opacity: 1, y: 0, scale: 1, duration: fadeDur * 1.2 },
                    wStart
                );
            } else {
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

        tlScroll.set({}, {}, 1.05);
    }, { scope: containerRef });

    return (
        <section id="hero" ref={containerRef} className="bg-black">
            <div ref={scrollSectionRef} className="hero-section" style={{ height: "600vh" }}>
                <div className="hero-sticky">
                    <CanvasSequence
                        triggerRef={scrollSectionRef}
                        sequences={sequences}
                        className="hero-canvas"
                        bgColor="black"
                        priority={true}
                        focalPointY="top"
                        scale={1}
                        offsetX={isMobile ? -30 : 0}
                        offsetY={isMobile ? 50 : 80}
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
                        <Link href={category ? `/categories/${category.id}` : "/categories"} className="hero-cta-pill">
                            Explore {category?.name || "Clothing"}
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
            </div>
        </section>
    );
}
