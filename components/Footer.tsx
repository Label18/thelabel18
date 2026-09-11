import Link from "next/link";
import Image from "next/image";
import { getCategoriesTree } from "@/lib/categories";

const contactItems = [
  { label: "Contact number", value: "+91 98868 23456", href: "tel:+919886823456" },
  { label: "Inquiries", value: "contact@thelabel18.com", href: "mailto:contact@thelabel18.com" },
];

const instagramPath = "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z";

const socialLinks = [
  {
    label: "Jewellery",
    href: "https://www.instagram.com/thelabel18_accessories?igsi=MW8yOGFlYzdwd2ZoOQ%3D%3D&utm_source=qr",
    path: instagramPath,
  },
  {
    label: "Clothing",
    href: "https://www.instagram.com/thelabel_18?igsi=c3E5YW8weXNrajJo&utm_source=qr",
    path: instagramPath,
  },
  {
    label: "Facebook",
    href: "#",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "YouTube",
    href: "#",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

const menuLinks = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["About Us", "/about"],
  ["All Categories", "/navigation"],
];

export default async function Footer() {
  const categories = await getCategoriesTree();
  const featuredCategories = categories.slice(0, 3);

  return (
    <footer className="relative z-10 bg-[#F8F6F0] text-[#1A1A1A] font-outfit overflow-hidden mt-10 border-t border-[#d4af37]/40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">

      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-16 pt-8 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 lg:gap-x-0 mb-12">
          
          {/* Column 1 — Brand */}
          <div className="lg:pr-10 lg:border-r lg:border-[#1A1A1A]/10">
            <Link href="/" className="inline-block mb-6 transition-transform duration-500 hover:scale-105">
              <Image
                src="/logo.jpg"
                alt="The Label 18"
                width={80}
                height={80}
                className="w-12 h-12 object-contain rounded-sm border border-[#d4af37]/40 shadow-sm"
              />
            </Link>
            <h2 className="text-xl text-[#1A1A1A] tracking-widest uppercase mb-3">
              THE LABEL{" "}
              <span className="text-[#9c7d23] italic font-normal lowercase">18</span>
            </h2>
            <p className="font-outfit font-light text-[#1A1A1A]/70 text-[13px] leading-[1.8] tracking-wide mb-6 max-w-[260px]">
              Growth, positivity, abundance, confidence, and new beginnings.
              Wear your energy. Express your essence.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <span className="w-9 h-9 shrink-0 rounded-full border border-[#1A1A1A]/20 bg-white flex items-center justify-center text-[#1A1A1A]/80 group-hover:bg-[#1A1A1A] group-hover:text-[#F8F6F0] group-hover:border-[#1A1A1A] transition-all duration-300 shadow-sm">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.path} />
                    </svg>
                  </span>
                  <span className="font-outfit font-light text-[9px] tracking-[0.15em] uppercase text-[#1A1A1A]/60 group-hover:text-[#9c7d23] transition-colors duration-300">
                    {social.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Menu */}
          <div className="lg:px-10 lg:border-r lg:border-[#1A1A1A]/10">
            <h3 className="font-outfit font-medium text-[11px] text-[#9c7d23] tracking-[0.35em] uppercase mb-6">
              Menu
            </h3>
            <ul className="space-y-3">
              {menuLinks.map(([title, url]) => (
                <li key={title}>
                  <Link
                    href={url}
                    className="group relative inline-block font-outfit font-light text-[#1A1A1A]/80 hover:text-[#9c7d23] transition-colors duration-300 text-[12.5px] tracking-[0.1em] uppercase"
                  >
                    {title}
                    <span className="absolute -bottom-1.5 left-0 w-0 h-px bg-[#9c7d23] transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Curations / Categories */}
          <div className="lg:px-10 lg:border-r lg:border-[#1A1A1A]/10">
            <h3 className="font-outfit font-medium text-[11px] text-[#9c7d23] tracking-[0.35em] uppercase mb-6">
              Curations
            </h3>
            {featuredCategories.length === 0 ? (
              <p className="text-[#1A1A1A]/40 text-[12px] font-light">Categories coming soon.</p>
            ) : (
              <ul className="space-y-4">
                {featuredCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/category/${cat.id}`}
                      className="block font-outfit font-light text-[#1A1A1A] hover:text-[#9c7d23] transition-colors duration-300 text-[12.5px] tracking-[0.1em] uppercase mb-2"
                    >
                      {cat.name}
                    </Link>
                    {cat.sub_categories.length > 0 && (
                      <ul className="space-y-1.5 border-l border-[#d4af37]/40 pl-3">
                        {cat.sub_categories.slice(0, 3).map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/category/${cat.id}/${sub.id}`}
                              className="block font-outfit font-light text-[#1A1A1A]/60 hover:text-[#9c7d23] transition-colors duration-300 text-[11px] tracking-[0.08em] uppercase"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/navigation"
              className="inline-block mt-4 text-[10.5px] tracking-[0.2em] uppercase font-outfit font-light text-[#9c7d23] hover:text-[#1A1A1A] transition-colors"
            >
              View all →
            </Link>
          </div>

          {/* Column 4 — Boutique / Contact */}
          <div className="lg:pl-10">
            <h3 className="font-outfit font-medium text-[11px] text-[#9c7d23] tracking-[0.35em] uppercase mb-6">
              Boutique
            </h3>
            <div className="space-y-6">
              <div>
                <span className="block text-[10.5px] text-[#9c7d23] tracking-[0.25em] uppercase mb-2 font-medium">
                  Location
                </span>
                <p className="font-outfit font-light text-[#1A1A1A]/80 text-[12.5px] leading-[1.8]">
                  #15 Elements Building, 4th Floor
                  <br />
                  32nd Cross, Jayanagar 7th Block
                  <br />
                  Bengaluru, KA 560070
                </p>
              </div>
              <div className="space-y-4">
                {contactItems.map((item) => (
                  <div key={item.label}>
                    <span className="block text-[10.5px] text-[#9c7d23] tracking-[0.25em] uppercase mb-1 font-medium">
                      {item.label}
                    </span>
                    <a
                      href={item.href}
                      className="font-outfit font-light text-[#1A1A1A] hover:text-[#9c7d23] transition-colors duration-300 text-[12.5px]"
                    >
                      {item.value}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Divider removed */}

        {/* Bottom Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 font-outfit font-light text-[10.5px] tracking-[0.18em] uppercase text-[#1A1A1A]/60">
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-[#1A1A1A] transition-colors">
              Privacy Policy
            </Link>
            <span className="w-1 h-1 rounded-full bg-[#d4af37]" />
            <Link href="/terms" className="hover:text-[#1A1A1A] transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>

          <div className="text-center">
            &copy; {new Date().getFullYear()} The Label 18. All Rights Reserved.
          </div>

          <div className="flex items-center gap-4">
            <span className="opacity-70">Developed By</span>
            <a href="https://rakvih.in/" className="text-[#9c7d23] hover:text-[#1A1A1A] transition-colors font-medium normal-case tracking-wide">
              Rakvih Solutions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}