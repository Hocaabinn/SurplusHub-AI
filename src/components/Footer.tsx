import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-primary-dark to-[#10240d] text-white overflow-hidden w-full">
      {/* Decorative Top Wave / Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-light to-transparent opacity-50"></div>

      {/* Background ambient light */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* Brand & Description */}
          <div className="flex flex-col items-start w-full">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="flex items-center justify-center transition-all duration-300 pointer-events-auto">
                <img
                  src="/favicon.png"
                  alt="SurplusHub Logo"
                  className="h-10 w-10 transition-transform group-hover:scale-110"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-display">
                Surplus<span className="text-green-400">Hub</span>
              </span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-sm font-light">
              Menyelamatkan makanan surplus dari toko lokal dengan harga diskon. Kurangi limbah pangan dan hemat pengeluaran sambil membantu pelestarian lingkungan.
            </p>
            <div className="flex items-center gap-3 w-full">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-300 hover:-translate-y-1 shadow-sm">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-300 hover:-translate-y-1 shadow-sm">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-300 hover:-translate-y-1 shadow-sm">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-300 hover:-translate-y-1 shadow-sm">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="w-full">
            <h3 className="text-white font-semibold mb-6 text-sm tracking-wider uppercase">Quick Links</h3>
            <ul className="flex flex-col gap-3 font-light">
              <li>
                <Link href="/" className="text-gray-400 hover:text-green-400 hover:translate-x-1 inline-flex transition-all duration-300 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#marketplace" className="text-gray-400 hover:text-green-400 hover:translate-x-1 inline-flex transition-all duration-300 text-sm">
                  Jelajahi Makanan
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-gray-400 hover:text-green-400 hover:translate-x-1 inline-flex transition-all duration-300 text-sm">
                  Cara Kerja
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-gray-400 hover:text-green-400 hover:translate-x-1 inline-flex transition-all duration-300 text-sm">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="w-full">
            <h3 className="text-white font-semibold mb-6 text-sm tracking-wider uppercase">Resources</h3>
            <ul className="flex flex-col gap-3 font-light">
              <li>
                <Link href="/merchant" className="text-gray-400 hover:text-green-400 hover:translate-x-1 inline-flex transition-all duration-300 text-sm">
                  Untuk Merchant
                </Link>
              </li>
              <li>
                <Link href="/partner" className="text-gray-400 hover:text-green-400 hover:translate-x-1 inline-flex transition-all duration-300 text-sm">
                  Menjadi Partner
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-green-400 hover:translate-x-1 inline-flex transition-all duration-300 text-sm">
                  Pusat Bantuan
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="w-full">
            <h3 className="text-white font-semibold mb-6 text-sm tracking-wider uppercase">Contact Us</h3>
            <ul className="flex flex-col gap-4 font-light">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Surabaya,Jawa timur, Indonesia <br />
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-400 shrink-0" />
                <a href="mailto:hello@surplushub.id" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                  hello@surplushub.id
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          <p className="text-gray-500 text-xs text-center md:text-left font-light">
            &copy; {new Date().getFullYear()} SurplusHub. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 font-light">
            <a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a>
            <span className="hidden sm:inline text-white/20">•</span>
            <a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a>
            <span className="hidden sm:inline text-white/20">•</span>
            <a href="#" className="hover:text-green-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
