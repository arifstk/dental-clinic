// app/(public)/layout.tsx

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import MobileBookBar from "@/components/site/MobileBookBar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20 md:pb-0">
      <Navbar />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <MobileBookBar />
    </div>
  );
}

