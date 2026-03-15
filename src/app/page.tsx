'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, MapPin, X, ChevronDown, Info, Sparkles, Leaf } from 'lucide-react';
import MapWrapper from '@/components/MapWrapper';
import ProductGrid from '@/components/ProductGrid';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Pricing';
import Image from 'next/image';
import 'leaflet/dist/leaflet.css';

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Redirect partner users to the merchant panel
  useEffect(() => {
    if (!loading && user && profile?.role === 'partner') {
      router.replace('/merchant');
    }
  }, [loading, user, profile, router]);

  // Show spinner while auth is loading or partner redirect is pending
  if (loading || (user && profile?.role === 'partner')) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-green-500/20">
          <Leaf className="h-7 w-7 animate-pulse text-white" />
        </div>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-1/2 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary to-primary-light" />
        </div>
      </div>
    );
  }

  function handleMarkerClick(storeId: string) {
    setSelectedStoreId(storeId);
  }

  function clearFilter() {
    setSelectedStoreId(null);
  }

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section — Minimalist Apple-style approach */}
      <section className="relative h-screen flex flex-col overflow-hidden bg-white">
        {/* Background Image - Macro Photography */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <Image
            src="/hero-fresh.png"
            alt="Fresh macro photography of organic food"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            quality={100}
          />
        </div>

        {/* Soft Light Overlay to ensure text readability without making it dark */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-white/90 via-white/50 to-white/30 backdrop-blur-[2px]" />

        {/* Center Content — Refined and minimalist */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 mt-16 max-w-5xl mx-auto">
          <span className="animate-hero-slide-up inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/50 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-md mb-6 uppercase tracking-widest shadow-sm">
            Tingkatkan Dampak Positif
          </span>

          <h1 className="animate-hero-slide-up-d1 font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 mb-6 drop-shadow-sm">
            Surplus<span className="text-primary">Hub</span>
          </h1>

          <p className="animate-hero-slide-up-d2 text-base md:text-lg lg:text-xl font-medium leading-relaxed text-gray-700 max-w-2xl mx-auto mb-10 drop-shadow-sm">
            Temukan surplus makanan lezat dari toko lokal favorit Anda.<br className="hidden sm:block" />
            Hemat pengeluaran, kurangi limbah pangan, dan berkontribusi untuk pelestarian bumi.
          </p>

          {/* CTA Buttons - Clean glassmorphism */}
          <div className="animate-hero-slide-up-d3 mt-2 flex flex-col sm:flex-row items-center gap-4">
            <a
              href="#marketplace"
              onClick={(e) => scrollToSection(e, 'marketplace')}
              className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
            >
              Jelajahi Makanan
              <div className="rounded-full bg-white/20 p-1 transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
            </a>

            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white/60 px-8 py-3.5 text-sm font-semibold text-gray-800 border border-gray-200 shadow-sm backdrop-blur-md transition-all hover:bg-white/80"
            >
              Pelajari Cara Kerja
            </a>
          </div>
        </div>

        {/* Bottom Center — Elegant Scroll Indicator */}
        <div className="animate-hero-slide-up-d5 absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Scroll</span>
          <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="flex flex-col items-center gap-2 group p-2">
            <div className="h-12 w-px bg-gradient-to-b from-gray-300 to-transparent" />
            <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
          </a>
        </div>
      </section>

      {/* How It Works Section */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Map Section */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8 pt-12">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Lokasi
          </span>
          <h2 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
            Toko Terdekat
          </h2>
          <p className="mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Jelajahi peta untuk menemukan toko, restoran, dan kafe di sekitar Anda yang memiliki surplus makanan lezat. Klik marker untuk melihat penawaran!
          </p>
        </div>

        {/* Map with floating glass card */}
        <div className="relative overflow-hidden p-2 sm:p-4 rounded-3xl border border-gray-200/60 bg-white shadow-xl shadow-primary/5">
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50">
            <MapWrapper
              selectedStoreId={selectedStoreId}
              onMarkerClick={handleMarkerClick}
            />

            {/* Floating Glassmorphism Card */}
            <div className="pointer-events-none absolute left-4 top-4 z-[400] max-w-[260px] rounded-2xl border border-white/40 bg-white/80 px-4 py-3.5 shadow-lg backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
                  <Info className="h-4 w-4 shrink-0" />
                </div>
                <p className="text-xs font-medium leading-snug text-gray-700">
                  Cari lokasi penyelamatan terdekat di peta dan klik marker untuk melihat makanan
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-center flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
            <Info className="h-3.5 w-3.5" />
            <span>Noted: Aktifkan lokasi di device anda</span>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedStoreId ? 'Filtered Results' : 'Available Food Near You'}
            </h2>
            <p className="text-sm text-muted">
              {selectedStoreId
                ? 'Showing items from selected store'
                : 'Rescue surplus food at great prices'}
            </p>
          </div>

          {selectedStoreId && (
            <button
              onClick={clearFilter}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-card-dark dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <X className="h-3.5 w-3.5" />
              Clear Filter
            </button>
          )}
        </div>

        <ProductGrid selectedStoreId={selectedStoreId} />
      </section>

      {/* Pricing Section */}
      <div id="pricing">
        <Pricing />
      </div>
    </div>
  );
}
