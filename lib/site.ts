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
