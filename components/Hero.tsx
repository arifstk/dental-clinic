import Link from "next/link";
import { CheckCircle2, Phone, Calendar, Clock, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section className="section section-alt relative overflow-hidden">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Content Area */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
              Online Booking Available
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink-900 leading-[1.15]">
                Gentle dental care, <br />
                <span className="text-primary-600">booked in a minute</span>
              </h1>
              <p className="text-base sm:text-lg text-ink-500 max-w-xl leading-relaxed">
                Pick your dentist, choose a time that suits you, and get an instant confirmation. No phone call needed.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/book" className="btn btn-primary text-base shadow-lg hover:shadow-xl transition-all">
                <Calendar className="w-5 h-5" />
                Book appointment
              </Link>
              <a href="tel:+8801700000000" className="btn bg-white border border-line text-ink-700 hover:bg-surface-alt text-base">
                <Phone className="w-4 h-4 text-primary-600" />
                Call us
              </a>
            </div>

            {/* Features / Benefits List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-line/60">
              <div className="flex items-center gap-2 text-sm font-medium text-ink-700">
                <CheckCircle2 className="w-4 h-4 text-accent-500 shrink-0" />
                Instant confirmation
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-ink-700">
                <CheckCircle2 className="w-4 h-4 text-accent-500 shrink-0" />
                Email reminders
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-ink-700">
                <CheckCircle2 className="w-4 h-4 text-accent-500 shrink-0" />
                Choose your dentist
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-ink-700">
                <CheckCircle2 className="w-4 h-4 text-accent-500 shrink-0" />
                Cancel or reschedule online
              </div>
            </div>
          </div>

          {/* Right Info Card Area */}
          <div className="lg:col-span-5">
            <div className="card card-hover relative bg-white border border-line p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-ink-900">Visit us</h3>
                <p className="text-sm text-ink-500">We are open and ready to help your smile.</p>
              </div>

              <div className="space-y-4 text-sm text-ink-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <span>House 00, Road 00, Dhanmondi, Dhaka</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary-600 shrink-0" />
                  <span className="font-medium">+880 1700-000000</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-ink-900">Saturday – Thursday</p>
                    <p className="text-ink-500 text-xs">9:00 AM - 8:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-2 border-t border-line/60">
                  <Clock className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-ink-900">Friday</p>
                    <p className="text-danger-600 text-xs font-medium">Closed</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/book" className="btn btn-primary w-full justify-center">
                  Book online
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
