export default function TermsAndConditions() {
  return (
    <main className="w-full min-h-screen bg-[#F8F6F0] text-[#1A1A1A] selection:bg-[#d4af37]/30 selection:text-[#1A1A1A]">

      {/* Premium Hero Section */}
      <section className="relative w-full h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden border-b border-[#1A1A1A]/10 pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#f3efe6] via-[#F8F6F0] to-[#EAE5D9]"></div>
        <div className="absolute inset-0 bg-[#9c7d23]/5 mix-blend-overlay"></div>

        <div className="relative z-10 text-center flex flex-col items-center px-4 mt-12">
          <span className="font-outfit font-light text-[10px] tracking-[0.5em] uppercase text-[#9c7d23] mb-4">
            Legal & Policies
          </span>
          <h1 className="font-normal text-4xl md:text-6xl text-[#1A1A1A] tracking-widest uppercase">
            Terms & <span className="text-[#9c7d23] font-normal tracking-normal uppercase">Conditions</span>
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full flex justify-center py-20 px-6 lg:px-16">
        <div className="w-full max-w-4xl font-outfit font-light text-[#1A1A1A]/70 leading-[2.2] tracking-wide text-sm md:text-base space-y-16">

          <div className="prose max-w-none">
            <p className="text-xl md:text-2xl italic text-[#1A1A1A]/90 leading-relaxed text-center mb-16">
              &ldquo;By accessing, browsing, or purchasing from The Label 18 website, you agree to these Terms &amp; Conditions. We strive to provide an impeccable experience.&rdquo;
            </p>
          </div>

          {[
            {
              title: "General",
              content: "By accessing, browsing, or purchasing from The Label 18 website, you agree to these Terms & Conditions. The Label 18 reserves the right to modify or update these terms when required. Any revised terms will be applicable once published on the website."
            },
            {
              title: "Products",
              content: "All products are subject to availability. We make every effort to accurately display product colours, designs and descriptions. However, colours may vary slightly depending on screen settings, lighting and photography. Certain jewellery, accessories, fabrics or handcrafted products may have minor variations or natural imperfections. These variations are part of the nature of the product and may not be considered defects."
            },
            {
              title: "Orders & Payments",
              content: "Orders will be confirmed only after successful payment. Payments must be made through the payment methods available on our website. Once an order has been processed or dispatched, it cannot normally be modified or cancelled."
            },
            {
              title: "Shipping & Delivery",
              content: "Orders will be processed according to the shipping timeline mentioned on our website. Delivery time may vary depending on the customer’s location and courier partner. The Label 18 will make reasonable efforts to ensure timely delivery but cannot be held responsible for delays caused by circumstances beyond our control, including courier delays, weather conditions, strikes, natural events or other unforeseen circumstances."
            },
            {
              title: "Returns & Exchanges",
              content: "Returns or exchanges will be accepted only according to the return/exchange policy displayed on our website. Eligible products must be unused, unworn, unwashed and returned in their original condition with tags and packaging intact. For hygiene reasons, certain jewellery and accessories may be non-returnable unless they are received damaged, defective or incorrect. Sale, discounted, customised or made-to-order products may be non-returnable or non-exchangeable where this is clearly mentioned at the time of purchase. If you receive a damaged, defective or incorrect product, please contact The Label 18 within the return period mentioned on our website, along with photographs or an unboxing video where required."
            },
            {
              title: "Refunds",
              content: "Once a return is inspected and approved, the applicable refund will be initiated to the original payment method. The time required for the amount to reflect in your account may depend on your bank or payment provider."
            },
            {
              title: "Intellectual Property",
              content: "All content appearing on The Label 18 website—including the brand name, logo, photographs, product images, videos, graphics, designs and written content—is the property of The Label 18 or its respective licensors. Unauthorised copying, reproduction, commercial use or distribution is prohibited."
            },
            {
              title: "Limitation of Liability",
              content: "To the extent permitted by applicable law, The Label 18 shall not be responsible for indirect, incidental or consequential losses resulting from misuse of our website or products. Nothing in these Terms & Conditions limits any statutory consumer rights available under applicable law."
            },
            {
              title: "Governing Law",
              content: "These Terms & Conditions shall be governed by the laws of India. Subject to applicable consumer laws, disputes shall fall under the jurisdiction of the competent courts in Bengaluru, Karnataka."
            }
          ].map((section, idx) => (
            <div key={idx} className="relative pl-8 md:pl-12 border-l border-[#1A1A1A]/15 group hover:border-[#9c7d23] transition-colors duration-500">
              <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#F8F6F0] border border-[#1A1A1A]/30 group-hover:border-[#9c7d23] group-hover:bg-[#9c7d23]/20 transition-all duration-500"></span>
              <h2 className="text-xl md:text-2xl text-[#1A1A1A] tracking-widest mb-4 font-normal">
                <span className="text-[#9c7d23] mr-4 font-outfit text-sm font-medium">{String(idx + 1).padStart(2, '0')}</span>
                {section.title}
              </h2>
              <p className="text-[#1A1A1A]/70">{section.content}</p>
            </div>
          ))}

        </div>
      </section>

    </main>
  );
}