'use client';

import { useState } from 'react';
import { Leaf, ArrowRight, ArrowDown, MapPin, X, TrendingDown, Zap, ChevronDown, Sparkles, ShoppingBag } from 'lucide-react';
import MapWrapper from '@/components/MapWrapper';
import ProductGrid from '@/components/ProductGrid';
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
      {/* Hero Section — Fullscreen Background Image */}
      <section className="relative min-h-screen flex flex-col overflow-hidden bg-zinc-950">
        {/* Background Image */}
        <Image
          src="/hero-bg.jpg"
          alt="PlateRescue store background"
          fill
          priority
          className="object-cover object-center brightness-[0.7]"
          sizes="100vw"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

        {/* Center Content — Ukuran heading diperkecil sedikit */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 flex flex-col items-center text-center mt-auto mb-auto pt-20 pb-32">
          <p className="animate-hero-slide-up font-display text-lg sm:text-xl italic text-white/90 mb-2">
            Selamatkan rasa dari
          </p>

          <h1 className="animate-hero-slide-up-d1 font-display text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-extrabold text-white tracking-tighter !leading-[0.8] lowercase">
            platerescue
          </h1>

          <p className="animate-hero-slide-up-d2 mt-6 text-xs sm:text-sm leading-relaxed text-white/70 max-w-md mx-auto">
            Temukan makanan berlebih dari toko-toko sekitarmu dengan harga yang jauh lebih murah. Hemat uang, kurangi limbah, selamatkan bumi.
          </p>
        </div>

        {/* Bottom Left — Info Card (Dikecilkan sedikit) */}
        <div className="animate-hero-slide-up-d3 absolute bottom-6 left-6 z-10">
          <div className="flex items-center gap-3 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/10 pl-5 pr-3 py-3 shadow-2xl">
            <div className="pr-1">
              <p className="text-sm font-bold text-white leading-tight">2,400+ Porsi</p>
              <p className="text-[10px] text-white/50 leading-tight mt-1 max-w-[120px]">
                Makanan berlebih yang diselamatkan pengguna.
              </p>
            </div>
            <div className="flex flex-col -space-y-3 shrink-0">
              <div className="h-9 w-9 rounded-full bg-emerald-700/80 border-2 border-zinc-900 flex items-center justify-center text-sm">🥬</div>
              <div className="h-9 w-9 rounded-full bg-amber-600/80 border-2 border-zinc-900 flex items-center justify-center text-sm">🍊</div>
              <div className="h-9 w-9 rounded-full bg-red-800/80 border-2 border-zinc-900 flex items-center justify-center text-sm">🍱</div>
            </div>
          </div>
        </div>

        {/* Bottom Right — Container Pojok Lebih Ramping */}
        <div className="animate-hero-slide-up-d4 absolute bottom-0 right-0 z-10 flex flex-col items-end">
          {/* Scroll Arrow */}
          <a
            href="#marketplace"
            className="mr-8 mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/50 text-amber-500 transition-all hover:bg-amber-500/10"
          >
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </a>

          {/* CTA Area — Inverted Border Radius yang lebih compact */}
          <div className="relative bg-white pt-4 pl-6 pb-6 pr-6 rounded-tl-[35px]">
            {/* Magic Curve Elements */}
            <div className="absolute -top-[35px] right-0 h-[35px] w-[35px] shadow-[15px_15px_0_0_white] pointer-events-none" />
            <div className="absolute bottom-0 -left-[35px] h-[35px] w-[35px] shadow-[15px_15px_0_0_white] pointer-events-none" />

            {/* Button Style: Pill with Arrow Circle */}
            <a
              href="#marketplace"
              className="group flex items-center gap-3 bg-zinc-100 hover:bg-zinc-200 px-6 py-3 rounded-full text-sm font-bold text-black transition-all"
            >
              Jelajahi Makanan
              <div className="bg-black text-white rounded-full p-1.5 transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </a>
          </div>
        </div>
      </section>
      {/* Map Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Nearby Stores
            </h2>
            <p className="text-sm text-muted">
              Click a marker to filter food from that store
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-gray-800">
          <MapWrapper
            selectedStoreId={selectedStoreId}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
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
    </div>
  );
}
