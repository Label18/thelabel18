// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Outfit, Cormorant_Garamond, Playfair_Display, Cinzel, Montserrat, Bebas_Neue, Syncopate } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { GuestCartWishlistProvider } from "@/contexts/GuestCartWishlistContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "600"], variable: "--font-cormorant" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas" });
const syncopate = Syncopate({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-syncopate" });

export const metadata: Metadata = {
  title: "The Label 18",
  description: "Wear your energy. Express your essence.",
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${outfit.variable} antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <AuthProvider>  <GuestCartWishlistProvider>
          {children}
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#141414',
                color: '#fff',
                fontFamily: 'Outfit, sans-serif',
                border: '1px solid #333',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#d4af37',
                  secondary: '#141414',
                },
              },
            }}
          />    </GuestCartWishlistProvider>
        </AuthProvider>
    
      </body>
    </html>
  );
}