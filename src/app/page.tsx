'use client';

import { useState } from 'react';
import { ArrowRight, MapPin, X, ChevronDown, Info } from 'lucide-react';
import MapWrapper from '@/components/MapWrapper';
import ProductGrid from '@/components/ProductGrid';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Pricing';
import Image from 'next/image';
import 'leaflet/dist/leaflet.css';

export default function Home() {
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  function handleMarkerClick(storeId: string) {
    setSelectedStoreId(storeId);
  }

  function clearFilter() {
    setSelectedStoreId(null);
  }

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
            Plate<span className="text-primary">Rescue</span>
          </h1>

          <p className="animate-hero-slide-up-d2 text-base md:text-lg lg:text-xl font-medium leading-relaxed text-gray-700 max-w-2xl mx-auto mb-10 drop-shadow-sm">
            Temukan surplus makanan lezat dari toko lokal favorit Anda.<br className="hidden sm:block" />
            Hemat pengeluaran, kurangi limbah pangan, dan berkontribusi untuk pelestarian bumi.
          </p>

          {/* CTA Buttons - Clean glassmorphism */}
          <div className="animate-hero-slide-up-d3 mt-2 flex flex-col sm:flex-row items-center gap-4">
            <a
              href="#marketplace"
              className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
            >
              Jelajahi Makanan
              <div className="rounded-full bg-white/20 p-1 transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
            </a>

            <a
              href="#how-it-works"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white/60 px-8 py-3.5 text-sm font-semibold text-gray-800 border border-gray-200 shadow-sm backdrop-blur-md transition-all hover:bg-white/80"
            >
              Pelajari Cara Kerja
            </a>
          </div>
        </div>

        {/* Bottom Center — Elegant Scroll Indicator */}
        <div className="animate-hero-slide-up-d5 absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Scroll</span>
          <a href="#how-it-works" className="flex flex-col items-center gap-2 group p-2">
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
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
            <MapPin className="h-4.5 w-4.5 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Toko Terdekat</h2>
            <p className="text-sm text-gray-400">Pilih marker untuk melihat makanan dari toko tersebut</p>
          </div>
        </div>

        {/* Map with floating glass card */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          <MapWrapper
            selectedStoreId={selectedStoreId}
            onMarkerClick={handleMarkerClick}
          />

          {/* Floating Glassmorphism Card */}
          <div className="pointer-events-none absolute left-3 top-3 z-[400] max-w-[220px] rounded-2xl border border-white/30 bg-white/70 px-4 py-3 shadow-lg backdrop-blur-md">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
              <p className="text-xs font-medium leading-snug text-gray-700">
                Cari lokasi penyelamatan terdekat di peta
              </p>
            </div>
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
