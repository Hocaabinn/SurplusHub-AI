'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Search, Wallet, Store, Brain, TrendingDown, Zap, Flame, Sparkles, Leaf, ShieldCheck, Clock, Heart, Recycle, Check, ArrowUpRight, Tag } from 'lucide-react';

/* ─── Data ───────────────────────────────────────────────────────────── */

const steps = [
    {
        icon: Search,
        step: '01',
        title: 'Pilih Makanan',
        description:
            'Temukan surplus makanan berkualitas dari toko-toko favoritmu di sekitar lokasi dengan cepat dan mudah.',
        image: '/Fitur2.mp4',
    },
    {
        icon: Wallet,
        step: '02',
        title: 'Pesan & Bayar',
        description:
            'Amankan porsimu dengan harga yang jauh lebih hemat. Bayar langsung dari aplikasi.',
        image: '/Fitur1.mp4',
    },
    {
        icon: Store,
        step: '03',
        title: 'Ambil di Lokasi',
        description:
            'Kunjungi toko pada waktu yang ditentukan untuk pickup pesananmu.',
        image: '/Fitur3.mp4',
    },
];

const pricingPhases = [
    {
        label: 'Harga Stabil',
        time: '> 6 jam',
        discount: '0-5%',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        icon: <TrendingDown className="h-4 w-4" />,
        width: 'w-2/5',
    },
    {
        label: 'Harga Turun',
        time: '2-6 jam',
        discount: '5-25%',
        color: 'bg-amber-500',
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-50',
        icon: <TrendingDown className="h-4 w-4" />,
        width: 'w-1/4',
    },
    {
        label: 'Flash Sale',
        time: '1-2 jam',
        discount: '25-45%',
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        icon: <Zap className="h-4 w-4" />,
        width: 'w-[20%]',
    },
    {
        label: 'Last Chance!',
        time: '< 1 jam',
        discount: '45-65%',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        icon: <Flame className="h-4 w-4" />,
        width: 'w-[15%]',
    },
];

const marqueeItems = [
    { label: 'Smart Pricing', icon: Brain },
    { label: 'Zero Waste', icon: Recycle },
    { label: 'Hemat Hingga 65%', icon: Sparkles },
    { label: 'Ramah Lingkungan', icon: Leaf },
    { label: 'Aman & Terpercaya', icon: ShieldCheck },
    { label: 'Pickup Cepat', icon: Clock },
    { label: 'Selamatkan Makanan', icon: Heart },
];

/* ─── Component ──────────────────────────────────────────────────────── */

export default function HowItWorks() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden bg-[#F0F2EE] py-28"
        >
            {/* Subtle background texture */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8),transparent_70%)]" />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* ── Header ─────────────────────────────────────────────── */}
                <div
                    className={`mb-20 text-center transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                        }`}
                >
                    <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Cara Kerja
                    </span>

                    <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-[3.25rem] sm:leading-[1.15]">
                        Menyelamatkan Makanan
                        <br />
                        Jadi Lebih Mudah
                    </h2>

                    <p className="mx-auto mt-6 max-w-xl text-base text-gray-500 leading-relaxed">
                        Tiga langkah sederhana untuk mendapatkan makanan berkualitas dengan harga hemat.
                    </p>
                </div>

                {/* ── Cards Grid ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {steps.map(({ icon: Icon, step, title, description, image }, index) => (
                        <div
                            key={step}
                            className={`group relative flex flex-col overflow-hidden rounded-[2rem] border border-gray-200/60 bg-white transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(45,90,39,0.25)] ${isVisible
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-12 opacity-0'
                                }`}
                            style={{
                                transitionDelay: isVisible ? `${200 + index * 150}ms` : '0ms',
                            }}
                        >
                            {/* Illustration area */}
                            <div className="relative flex items-center justify-center overflow-hidden bg-transparent">
                                {/* Subtle radial glow on hover */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(45,90,39,0.06),transparent_70%)] opacity-0 z-10 pointer-events-none transition-opacity duration-700 group-hover:opacity-100" />

                                <div className="relative w-full h-56 sm:h-64 transition-transform duration-700 ease-out group-hover:scale-[1.05] flex items-center justify-center">
                                    {image.endsWith('.mp4') ? (
                                        <video
                                            src={image}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Image
                                            src={image}
                                            alt={title}
                                            fill
                                            className="object-cover mix-blend-multiply"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Content area - White with Black Text */}
                            <div className="relative flex flex-1 flex-col p-8 overflow-hidden bg-white">
                                {/* Decorative Glow */}
                                <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-[#E8F0E8] blur-3xl transition-transform duration-1000 group-hover:scale-150 opacity-50" />
                                <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-[#E8F0E8] blur-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-50" />

                                <div className="relative z-10 flex h-full flex-col">
                                    {/* Step badge */}
                                    <div className="mb-6 inline-flex w-fit items-center gap-2.5 rounded-full bg-[#f4f8f4] px-3 py-1.5 font-mono text-xs font-semibold tracking-wide text-[#2D5A27] border border-[#A5C0A1]/20 shadow-[0_2px_8px_rgba(45,90,39,0.04)] transition-colors duration-300 group-hover:bg-[#E8F0E8] group-hover:border-[#A5C0A1]/40">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#2D5A27] shadow-sm">
                                            <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                                        </div>
                                        Langkah {step}
                                    </div>

                                    <h3 className="font-display text-2xl font-bold text-gray-900 tracking-tight transition-colors duration-300 group-hover:text-[#2D5A27]">
                                        {title}
                                    </h3>

                                    <p className="mt-3 text-[15px] text-gray-500 leading-relaxed font-medium">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Marquee / Scrolling Tags ───────────────────────────── */}
                <div
                    className={`mt-16 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                        }`}
                    style={{ transitionDelay: isVisible ? '800ms' : '0ms' }}
                >
                    <div className="relative overflow-hidden">
                        {/* Gradient masks */}
                        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#F0F2EE] to-transparent" />
                        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#F0F2EE] to-transparent" />

                        <div className="flex animate-[marquee_30s_linear_infinite] gap-4">
                            {[...marqueeItems, ...marqueeItems].map(({ label, icon: MIcon }, i) => (
                                <div
                                    key={`${label}-${i}`}
                                    className="flex flex-shrink-0 items-center gap-2.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-gray-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                                >
                                    <MIcon className="h-4 w-4 text-gray-500" />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
