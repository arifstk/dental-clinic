// // components/site/Footer.tsx

// import Link from "next/link";
// import { Clock, Mail, MapPin, Phone } from "lucide-react";
// import { navLinks, site } from "@/lib/site";
// import Logo from "./Logo";

// // Compute once at module load time to keep it stable for SSR/prerendering
// const currentYear = new Date().getFullYear();

// export default function Footer() {
//   return (
//     <footer className="border-t border-line bg-white">
//       <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
//         <div>
//           <Logo />
//           <p className="muted mt-4 max-w-xs">
//             Comfortable, modern dental care. Book your visit online in under a minute.
//           </p>
//         </div>

//         <div>
//           <h3 className="text-sm font-semibold text-ink-900">Quick links</h3>
//           <ul className="mt-4 space-y-2.5">
//             {navLinks.map((l) => (
//               <li key={l.href}>
//                 <Link href={l.href} className="nav-link">
//                   {l.label}
//                 </Link>
//               </li>
//             ))}
//             <li>
//               <Link href="/booking" className="nav-link">
//                 Book appointment
//               </Link>
//             </li>
//           </ul>
//         </div>

//         <div>
//           <h3 className="text-sm font-semibold text-ink-900">Contact</h3>
//           <ul className="mt-4 space-y-3 text-sm text-ink-700">
//             <li className="flex gap-2.5">
//               <MapPin size={16} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
//               <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary-700">
//                 {site.address}
//               </a>
//             </li>
//             <li className="flex gap-2.5">
//               <Phone size={16} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
//               <a href={site.phoneHref} className="hover:text-primary-700">
//                 {site.phone}
//               </a>
//             </li>
//             <li className="flex gap-2.5">
//               <Mail size={16} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
//               <a href={`mailto:${site.email}`} className="hover:text-primary-700">
//                 {site.email}
//               </a>
//             </li>
//           </ul>
//         </div>

//         <div>
//           <h3 className="text-sm font-semibold text-ink-900">Opening hours</h3>
//           <ul className="mt-4 space-y-3 text-sm text-ink-700">
//             {site.hours.map((h) => (
//               <li key={h.days} className="flex gap-2.5">
//                 <Clock size={16} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
//                 <span>
//                   <span className="block font-medium text-ink-900">{h.days}</span>
//                   {h.time}
//                 </span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>

//       <div className="border-t border-line">
//         <p className="container-page py-5 text-xs text-ink-500">
//           &copy; {currentYear} {site.name}. All rights reserved.
//         </p>
//       </div>
//     </footer>
//   );
// }



// components/site/Footer.tsx

import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { navLinks } from "@/lib/site";
import { getSiteSettings } from "@/lib/settings";
import Logo from "./Logo";

// Compute once at module load time to keep it stable for SSR/prerendering
const currentYear = new Date().getFullYear();

export default async function Footer() {
  const s = await getSiteSettings();

  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="muted mt-4 max-w-xs">
            Comfortable, modern dental care. Book your visit online in under a minute.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-900">Quick links</h3>
          <ul className="mt-4 space-y-2.5">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="nav-link">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/booking" className="nav-link">
                Book appointment
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-900">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-700">
            <li className="flex gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
              <a href={s.mapsHref} target="_blank" rel="noopener noreferrer" className="hover:text-primary-700">
                {s.address}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Phone size={16} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
              <a href={s.phoneHref} className="hover:text-primary-700">
                {s.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail size={16} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
              <a href={`mailto:${s.email}`} className="hover:text-primary-700">
                {s.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-900">Opening hours</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-700">
            {s.hours.map((h) => (
              <li key={h.days} className="flex gap-2.5">
                <Clock size={16} className="mt-0.5 shrink-0 text-primary-600" aria-hidden />
                <span>
                  <span className="block font-medium text-ink-900">{h.days}</span>
                  {h.closed ? "Closed" : h.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="container-page py-5 text-xs text-ink-500">
          &copy; {currentYear} {s.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
