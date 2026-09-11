"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CategoryNavItem from "@/components/CategoryNavItem";
import CategoryAccordionMobile from "@/components/CategoryAccordionMobile";
import { getCategoriesTree, CategoryTree } from "@/lib/categories";
import { useAuth } from "@/contexts/AuthContext";
import { useGuestCartWishlist } from "@/contexts/GuestCartWishlistContext";
import LoginModal from "@/components/LoginModal";
import SearchModal from "@/components/SearchModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    user,
    profile,
    signOut,
    cartCount: authCartCount,
    wishlistCount: authWishlistCount,
  } = useAuth();

  // Guests get their own localStorage-backed counts; logged-in users
  // keep using the real Supabase-backed counts from AuthContext.
  const guest = useGuestCartWishlist();
  const cartCount = user ? authCartCount : guest.cartCount;
  const wishlistCount = user ? authWishlistCount : guest.wishlistCount;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    getCategoriesTree().then(setCategories);
  }, []);

  // Close the user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll while the mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const firstName =
    profile?.full_name?.trim()?.split(" ")[0] ||
    (user?.user_metadata?.full_name as string)?.trim()?.split(" ")[0] ||
    (user?.user_metadata?.name as string)?.trim()?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Account";

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    await signOut();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 bg-black/60 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] ${
        scrolled ? "py-3 md:py-4" : "py-3 md:py-4"
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center">
          {/* 1. Left: Image Logo */}
          <div className="flex-1 flex items-center justify-start">
            <Link href="/" className="inline-block transition-transform duration-300 hover:opacity-80">
              <Image
                src="/logo.jpg"
                alt="Logo"
                width={80}
                height={80}
                priority
                className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-sm"
              />
            </Link>
          </div>

          {/* 2. Center: Desktop Navigation */}
          <nav className="hidden md:flex justify-center items-center gap-8 lg:gap-14">
            <Link
              href="/"
              className="group relative text-white hover:text-[#d4af37] transition-colors duration-300 font-outfit font-medium text-[11px] tracking-[0.25em] uppercase py-2 whitespace-nowrap"
            >
              Home
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#d4af37] transition-all duration-500 ease-out group-hover:w-full opacity-80"></span>
            </Link>

            {/* Up to 4 categories shown directly in the nav */}
            {categories.slice(0, 4).map((category) => (
              <CategoryNavItem key={category.id} category={category} />
            ))}

            <Link
              href="/shop"
              className="group relative text-white hover:text-[#d4af37] transition-colors duration-300 font-outfit font-medium text-[11px] tracking-[0.25em] uppercase py-2 whitespace-nowrap"
            >
              Shop
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#d4af37] transition-all duration-500 ease-out group-hover:w-full opacity-80"></span>
            </Link>
            <Link
              href="/video"
              className="group relative text-white hover:text-[#d4af37] transition-colors duration-300 font-outfit font-medium text-[11px] tracking-[0.25em] uppercase py-2 whitespace-nowrap"
            >
              Video
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#d4af37] transition-all duration-500 ease-out group-hover:w-full opacity-80"></span>
            </Link>
            <Link
              href="/about"
              className="group relative text-white hover:text-[#d4af37] transition-colors duration-300 font-outfit font-medium text-[11px] tracking-[0.25em] uppercase py-2 whitespace-nowrap"
            >
              About Us
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#d4af37] transition-all duration-500 ease-out group-hover:w-full opacity-80"></span>
            </Link>
          </nav>

          {/* 3. Right: Actions (Search, Wishlist, Cart, Login/Account & Mobile Menu) */}
          <div className="flex-1 flex items-center justify-end gap-5 md:gap-6">
            {/* Search Button */}
            <div className="hidden md:flex items-center">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-white hover:text-[#d4af37] transition-all duration-300 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>

            {/* Wishlist - works for guests (localStorage) and logged-in users alike */}
            <Link
              href="/wishlist"
              className="relative text-white hover:text-[#d4af37] transition-all duration-300 group hidden md:block"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 rounded-full bg-[#d4af37] text-black text-[9px] font-outfit font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart - works for guests (localStorage) and logged-in users alike */}
            <Link
              href="/cart"
              className="relative text-white hover:text-[#d4af37] transition-all duration-300 group hidden md:block"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.876-4.145 2.147-4.72.174-.373-.041-.813-.417-.813H5.106M7.5 14.25 5.106 5.272M6 21a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 rounded-full bg-[#d4af37] text-black text-[9px] font-outfit font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Login / Account */}
            {user ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="group flex flex-col items-center justify-center text-white hover:text-[#d4af37] transition-all duration-300 -my-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span className="font-outfit font-medium text-[9px] tracking-[0.15em] uppercase text-white/90 group-hover:text-[#d4af37] max-w-[80px] truncate leading-tight mt-0.5">
                    {firstName}
                  </span>
                </button>

                <div
                  className={`absolute right-0 top-[calc(100%+0.75rem)] w-48 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-200 origin-top-right ${
                    isUserMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <Link
                    href="/orders"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-5 py-3 text-white/70 hover:text-[#d4af37] hover:bg-white/5 transition-colors font-outfit font-light text-[11px] tracking-[0.2em] uppercase"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-5 py-3 text-white/70 hover:text-[#d4af37] hover:bg-white/5 transition-colors font-outfit font-light text-[11px] tracking-[0.2em] uppercase"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="group hidden md:flex flex-col items-center justify-center text-white hover:text-[#d4af37] transition-all duration-300 -my-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span className="font-outfit font-medium text-[9px] tracking-[0.15em] uppercase text-white/90 group-hover:text-[#d4af37] leading-tight mt-0.5">
                  Login
                </span>
              </button>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="text-white/70 hover:text-[#d4af37] transition-colors focus:outline-none"
                aria-label="Open menu"
              >
                <svg className="h-6 w-6 font-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar (off-canvas drawer) */}
      {/* Backdrop */}
      <div
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      ></div>

      {/* Sliding panel */}
      <aside
        className={`md:hidden fixed top-0 right-0 z-[120] h-[100dvh] w-[86%] max-w-[360px] bg-[#0a0a0a] border-l border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col transition-transform duration-500 ease-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#141414]">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="inline-block">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={40}
              height={40}
              className="h-9 w-9 object-contain rounded-sm"
            />
          </Link>
          <button
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 text-white/50 hover:text-[#d4af37] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 flex flex-col">
          {/* Search trigger */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              setIsSearchOpen(true);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-3 flex items-center text-white/60 text-[12px] font-outfit tracking-wider hover:bg-white/10 hover:border-[#d4af37]/30 transition-colors mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-3 text-[#d4af37]">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            Search products...
          </button>

          {/* Primary nav */}
          <nav className="flex flex-col">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-white/80 hover:text-[#d4af37] transition-colors font-outfit font-light text-[13px] tracking-[0.2em] uppercase py-3.5 border-b border-white/5"
            >
              Home
            </Link>

            <Link
              href="/shop"
              onClick={() => setIsMenuOpen(false)}
              className="text-white/80 hover:text-[#d4af37] transition-colors font-outfit font-light text-[13px] tracking-[0.2em] uppercase py-3.5 border-b border-white/5"
            >
              Shop
            </Link>
            <Link
              href="/video"
              onClick={() => setIsMenuOpen(false)}
              className="text-white/80 hover:text-[#d4af37] transition-colors font-outfit font-light text-[13px] tracking-[0.2em] uppercase py-3.5 border-b border-white/5"
            >
             Video
            </Link>
            {/* Categories accordion (mobile) */}
            <div className="border-b border-white/5">
              <CategoryAccordionMobile
                categories={categories}
                onNavigate={() => setIsMenuOpen(false)}
              />
            </div>

            <Link
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className="text-white/80 hover:text-[#d4af37] transition-colors font-outfit font-light text-[13px] tracking-[0.2em] uppercase py-3.5 border-b border-white/5"
            >
              About Us
            </Link>

            {/* Wishlist & Cart - work for guests (localStorage) and logged-in users alike */}
            <Link
              href="/wishlist"
              onClick={() => setIsMenuOpen(false)}
              className="text-white/80 hover:text-[#d4af37] transition-colors font-outfit font-light text-[13px] tracking-[0.2em] uppercase py-3.5 border-b border-white/5"
            >
              Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
            </Link>

            <Link
              href="/cart"
              onClick={() => setIsMenuOpen(false)}
              className="text-white/80 hover:text-[#d4af37] transition-colors font-outfit font-light text-[13px] tracking-[0.2em] uppercase py-3.5 border-b border-white/5"
            >
              Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
          </nav>

          {/* Spacer pushes account section to the bottom */}
          <div className="flex-1"></div>

          {/* Account section */}
          <div className="mt-6 pt-6 border-t border-white/10">
            {user ? (
              <div className="flex flex-col gap-1">
                <span className="text-white/40 font-outfit text-[10px] tracking-[0.25em] uppercase mb-2">
                  Signed in as {firstName}
                </span>
                <Link
                  href="/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[#d4af37] hover:text-white transition-colors font-outfit font-medium text-[13px] tracking-[0.2em] uppercase py-2.5"
                >
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleSignOut();
                  }}
                  className="text-left text-white/50 hover:text-[#d4af37] transition-colors font-outfit font-light text-[12px] tracking-[0.2em] uppercase py-2.5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsLoginOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#c49f2f] text-black transition-colors font-outfit font-semibold text-[12px] tracking-[0.2em] uppercase rounded-full py-3.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Login / Account
              </button>
            )}
          </div>
        </div>
      </aside>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}