import Link from "next/link";
import Image from "next/image";
import { Gem, Scissors, Globe, ArrowRight } from "lucide-react";

const pillars = [
  {
    icon: Globe, title: "Handcrafted Luxury",
    tagline: "Curated Master Weavers",
    description:
      "Handcrafted by generational artisans across India, preserving the royal heritage of pure Banarasi, Kanjivaram silks, and intricate zardozi.",
  },
  {
    icon: Gem,
    title: "Hallmarked Purity",
    tagline: "Certified Precious Gems",
    description:
      "Each piece of fine jewellery features certified hallmarked purity, authentic stones, and ethically sourced gems crafted into heirlooms.",
  },
  {
    icon: Scissors,
    title: "Bespoke Fitting",
    tagline: "Custom Bridal Tailoring",
    description:
      "Every chapter of life deserves an unmistakable presence. We offer custom bridal tailoring, personalized drapery, and styling.",
  },
  {
    icon: Globe,
    title: "Express Shipping",
    tagline: "Worldwide Delivery",
    description:
      "Bringing timeless luxury to your doorstep with our secure, expedited global shipping services for all our exclusive pieces.",
  },
];

export default function BrandPhilosophy() {
  return (
    <section className="relative bg-[#F8F6F0] text-[#1A1A1A] py-3 sm:py-5 border-b border-[#D4AF37]/30">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#9c7d23]/10 border border-[#9c7d23]/30 text-[#9c7d23] text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium mb-1.5">
            
            The Label 18 Philosophy
          </div>

          <h2 className="font-outfit text-2xl sm:text-3xl font-light tracking-tight leading-tight text-[#1A1A1A] mb-1.5">
            WEAR YOUR <span className="text-[#9c7d23] font-semibold">ENERGY</span>.{" "}
            EXPRESS YOUR <span className="text-[#9c7d23] font-semibold">ESSENCE</span>.
          </h2>

          <div className="flex items-center gap-3 my-1.5">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#9c7d23]" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#9c7d23] font-serif">
              ✦ 18 ✦
            </span>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#9c7d23]" />
          </div>

          <p className="text-[#1A1A1A]/70 text-[11px] sm:text-xs leading-relaxed font-light mt-0.5 max-w-2xl">
            In numerology, the number 18 stands for supreme manifestation, abundance, and 
            auspicious beginnings. Combined with the lotus and the seven chakras, The Label 18 
            embodies clothing and jewellery that elevate not just your appearance, but your inner spirit.
          </p>
        </div>

        {/* 4 Pillars Grid (Compact 2x2 on mobile, 4 on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6 mb-2 sm:mb-4">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group relative p-3.5 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white to-[#F8F6F0] border border-[#9c7d23]/20 shadow-sm transition-all duration-500 hover:border-[#9c7d23]/60 hover:shadow-md hover:-translate-y-1 overflow-hidden flex flex-col justify-between z-10"
              >
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-bl from-[#9c7d23]/10 to-transparent rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />
                
                <div className="relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#F5E6C8] via-[#E6C35C] to-[#D4AF37] p-[1px] mb-2.5 sm:mb-4 transform transition-transform duration-500 group-hover:scale-110 shadow-sm">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9c7d23]" />
                    </div>
                  </div>

                  <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-[#9c7d23] font-bold block mb-1">
                    {pillar.tagline}
                  </span>

                  <h3 className="font-outfit text-xs sm:text-sm lg:text-base font-medium text-[#1A1A1A] mb-1.5 sm:mb-2 line-clamp-1">
                    {pillar.title}
                  </h3>

                  <p className="text-[#1A1A1A]/70 text-[10px] sm:text-xs font-light leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-[#9c7d23]/20 flex items-center justify-between text-[8px] sm:text-[10px] uppercase tracking-[0.15em] text-[#9c7d23] font-semibold opacity-80 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                  <span>Discover</span>
                  <ArrowRight className="w-3 h-3 transition-transform duration-500 group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
