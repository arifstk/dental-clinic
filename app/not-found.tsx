// app/not-found.tsx

import Link from "next/link";
import Footer from "@/components/site/Footer";
import Navbar from "@/components/site/Navbar";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Pass required phone props */}
      <Navbar phone="01711000444" phoneHref="tel:01711000444" />

      {/* Main Content */}
      <main className="bg-hero flex flex-1 items-center justify-center px-4 py-20">
        <div className="max-w-md text-center">
          <p className="text-6xl font-bold text-primary-600">404</p>
          <h1 className="heading-1 mt-4 text-ink-900">Page not found</h1>
          <p className="lead mt-3 text-ink-700">
            The page you are looking for does not exist or has moved.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn btn-primary">
              Back to home
            </Link>
            <Link href="/booking" className="btn btn-outline border border-line text-ink-900 hover:bg-surface-alt">
              Book appointment
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
