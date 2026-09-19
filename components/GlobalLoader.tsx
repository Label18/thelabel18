"use client";

import { useEffect, useState } from "react";
import { gsap } from "gsap";

export default function GlobalLoader() {
    // Start with isLoading = true so the server renders the loader HTML
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const hasLoaded = sessionStorage.getItem("label18_loaded");
        
        if (hasLoaded) {
            setIsLoading(false);
            return;
        }

        // Animate the loader out after 1.5 seconds
        const timer = setTimeout(() => {
            gsap.to("#global-loader", {
                opacity: 0,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    setIsLoading(false);
                    sessionStorage.setItem("label18_loaded", "true");
                    document.body.style.overflow = "";
                }
            });
        }, 6000);

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = "";
        };
    }, []);

    if (!isLoading) return null;

    return (
        <>
            <div id="global-loader" suppressHydrationWarning className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center pointer-events-auto">
                <div className="flex flex-col items-center justify-center">
                    <div className="hero-accent-line justify-center mb-4">
                        <div className="accent-bar bg-[var(--color-gold)] w-8"></div>
                        <span className="accent-label text-[var(--color-gold)] tracking-widest uppercase text-sm">Welcome to</span>
                        <div className="accent-bar bg-[var(--color-gold)] w-8"></div>
                    </div>
                    
                    <h1 className="font-outfit text-4xl md:text-6xl font-light text-center leading-tight text-white mb-8">
                        LABEL <span className="font-semibold text-[var(--color-gold)]">18</span>
                    </h1>

                    {/* Elegant loading spinner */}
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-t-2 border-[var(--color-gold)] rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-b-2 border-white/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    
                    <p className="text-[#a0a0a0] mt-6 text-xs uppercase tracking-[0.3em]">
                        Curating Your Experience
                    </p>
                </div>
            </div>
            
            {/* 
                This inline script runs synchronously BEFORE React hydrates.
                It prevents the "Flash of Unstyled Content" by immediately hiding 
                the loader if the user has already loaded it this session.
            */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        if (sessionStorage.getItem("label18_loaded")) {
                            document.getElementById("global-loader").style.display = "none";
                        } else {
                            document.body.style.overflow = "hidden";
                        }
                    `
                }}
            />
        </>
    );
}
