// lib/site.ts

export const site = {
  name: "Smile Dental",
  phone: "+880 1700-000000",
  phoneHref: "tel:+8801700000000",
  email: "info@yourclinic.com",
  address: "House 00, Road 00, Dhanmondi, Dhaka",
  mapsUrl: "https://maps.google.com/?q=Smile+Dental+Dhaka",
  hours: [
    { days: "Saturday - Thursday", time: "9:00 AM - 8:00 PM" },
    { days: "Friday", time: "Closed" },
  ],
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(site.address)}&output=embed`;

// ---- SEO ----
export const SITE_NAME_FALLBACK = site.name;

export const SITE_DESCRIPTION =
  "Book your dentist online in minutes. Check-ups, cleaning, fillings, braces and more. Choose your dentist, pick a time and get an instant confirmation.";

// 1200x630 image at public/og-image.jpg
export const OG_IMAGE = "/og-image.jpg";

// Keep in sync with `site.hours` above (Google reads this format)
export const schemaHours = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
    ],
    opens: "09:00",
    closes: "20:00",
  },
];
