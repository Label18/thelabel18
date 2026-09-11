export default function PrivacyPolicy() {
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
            Privacy <span className="text-[#9c7d23] font-normal tracking-normal uppercase">Policy</span>
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full flex justify-center py-20 px-6 lg:px-16">
        <div className="w-full max-w-4xl font-outfit font-light text-[#1A1A1A]/70 leading-[2.2] tracking-wide text-sm md:text-base space-y-16">

          <div className="prose max-w-none">
            <p className="text-xl md:text-2xl italic text-[#1A1A1A]/90 leading-relaxed text-center mb-16">
              &ldquo;At The Label 18, we value and respect your privacy. This Privacy Policy explains how we collect, use, store and protect your personal information when you browse our website, make a purchase or communicate with us.&rdquo;
            </p>
          </div>

          {[
            {
              title: "Introduction",
              content: "At The Label 18, we value and respect your privacy. This Privacy Policy explains how we collect, use, store and protect your personal information when you browse our website, make a purchase or communicate with us."
            },
            {
              title: "Information We Collect",
              content: "We may collect information such as your name and contact number, email address, billing and shipping address, order and purchase history, payment-related information processed securely through authorised third-party payment providers, website browsing and device information, as well as communications, enquiries and customer-support information."
            },
            {
              title: "How We Use Your Information",
              content: "Your personal information may be used to process and deliver orders, provide order updates, respond to customer-support requests, process returns/refunds, improve our products and website experience, prevent fraudulent transactions and comply with legal requirements. With your consent, where required, we may also send you promotional offers, collection launches and marketing communications."
            },
            {
              title: "Sharing of Information",
              content: "We do not sell your personal information. Where necessary to fulfil your order or operate our website, information may be shared with trusted service providers such as courier companies, payment gateways, website/hosting providers and other service partners. Information may also be disclosed where required by applicable law."
            },
            {
              title: "Data Security",
              content: "We use reasonable security measures and trusted payment gateways to protect customer information. However, no method of internet transmission or electronic storage can be guaranteed to be completely secure."
            },
            {
              title: "Cookies",
              content: "Our website may use cookies and similar technologies to improve website functionality, remember preferences, analyse website performance and enhance your shopping experience. Depending on your browser and the technologies used on our website, you may be able to manage or disable certain cookies through your browser or cookie-preference settings."
            },
            {
              title: "Your Privacy Rights",
              content: "Subject to applicable law, you may request access to or correction of your personal information and exercise other privacy rights available to you. You may also unsubscribe from promotional emails or marketing communications."
            },
            {
              title: "Third-Party Services",
              content: "Our website may use third-party services such as payment gateways, courier providers, analytics tools or social-media platforms. These third parties may have their own privacy policies governing their processing of information."
            },
            {
              title: "Changes to This Privacy Policy",
              content: "The Label 18 may update this Privacy Policy periodically. Any revised version will be published on our website along with the updated effective date."
            },
            {
              title: "Contact Us",
              content: "For questions regarding orders, returns, privacy or personal information, customers may contact us using the details provided on our website or footer."
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