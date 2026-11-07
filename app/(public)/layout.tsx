// app/(public)/layout.tsx

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import MobileBookBar from "@/components/site/MobileBookBar";
import { getSiteSettings } from "@/lib/settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const s = await getSiteSettings();

  return (
    <div className="pb-20 md:pb-0">
      <Navbar phone={s.phone} phoneHref={s.phoneHref} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <MobileBookBar />
    </div>
  );
}
