"use client";

import React, { useEffect, useRef, useState } from "react";

interface TransparentLogoProps {
    className?: string;
    style?: React.CSSProperties;
    alt?: string;
}

export default function TransparentLogo({ className, style, alt = "The Label 18 Logo" }: TransparentLogoProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = "/logo.jpg";
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            // Target dimensions
            canvas.width = img.naturalWidth || 1024;
            canvas.height = img.naturalHeight || 1024;

            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return;

            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            // Background color is cream (~249, ~240, ~231)
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Distance from cream background
                const dr = r - 249;
                const dg = g - 241;
                const db = b - 231;
                const dist = Math.sqrt(dr * dr + dg * dg + db * db);

                if (dist < 30) {
                    data[i + 3] = 0; // 100% transparent
                } else if (dist < 60) {
                    // Smooth antialiasing gradient
                    const factor = (dist - 30) / 30;
                    data[i + 3] = Math.round(factor * 255);
                }
            }

            ctx.putImageData(imgData, 0, 0);
            setIsReady(true);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            aria-label={alt}
            style={{
                display: "inline-block",
                objectFit: "contain",
                opacity: isReady ? 1 : 0,
                transition: "opacity 0.3s ease",
                ...style,
            }}
        />
    );
}
