// app/(shop)/layout.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlobalLoader from "@/components/GlobalLoader";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GlobalLoader />
      <Header />
      {children}
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}