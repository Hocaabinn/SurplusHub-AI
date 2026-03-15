'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Zap, Check, ArrowUpRight, Tag, Heart } from 'lucide-react';

export default function Pricing() {
    const [isVisible, setIsVisible] = useState(false);
    const [isYearly, setIsYearly] = useState(false);
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
        <section ref={sectionRef} className="relative overflow-hidden bg-[#f5f5f5] pt-16 pb-24">
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* ── Pricing Section ───────────────────────────── */}
                <div
                    className={`transition-all duration-[1000ms] ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                        }`}
                    style={{ transitionDelay: '0ms' }}
                >
                    <div className="mb-14 text-center">
                        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                            <Tag className="h-3.5 w-3.5 text-gray-400" />
                            PRICING
                        </span>

                        <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            Simple Price For All
                        </h2>

                        <p className="mx-auto mt-5 max-w-xl text-base text-gray-500 leading-relaxed font-medium">
                            Flexible pricing plans that fit your budget & scale with needs.
                        </p>

                        {/* Toggle */}
                        <div className="mt-8 flex justify-center">
                            <div className="inline-flex items-center rounded-full bg-white p-1 shadow-[0_2px_8px_rgba(45,90,39,0.08)] border border-[#A5C0A1]/30">
                                <button
                                    onClick={() => setIsYearly(false)}
                                    className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${!isYearly ? 'bg-[#2D5A27] text-white shadow-[0_2px_8px_rgba(45,90,39,0.2)]' : 'text-gray-500 hover:text-[#2D5A27]'}`}>
                                    Monthly
                                </button>

                                <button
                                    onClick={() => setIsYearly(true)}
                                    className={`flex items-center gap-2 rounded-full py-1.5 pl-6 pr-1.5 transition-all ${isYearly ? 'bg-[#2D5A27] text-white shadow-[0_2px_8px_rgba(45,90,39,0.2)]' : 'text-gray-500 hover:text-[#2D5A27]'}`}>
                                    <span className="text-sm font-semibold">Yearly</span>
                                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${isYearly ? 'text-white bg-white/20' : 'bg-[#E8F0E8] text-[#2D5A27] border border-[#A5C0A1]/30'}`}>
                                        30% off
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
                        {/* Starter Plan */}
                        <div className="group relative flex flex-col rounded-[2rem] bg-[#F7FAF7] p-8 shadow-[0_4px_20px_rgba(45,90,39,0.03)] border border-[#A5C0A1]/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(45,90,39,0.2)] flex-1">
                            <h3 className="text-lg font-bold text-[#2D5A27]">Starter</h3>
                            <div className="mt-4 flex items-baseline text-5xl font-extrabold tracking-tight text-gray-900">
                                ${isYearly ? '20' : '5'}
                                <span className="ml-1 text-base font-medium text-gray-500">/month</span>
                            </div>
                            <p className="mt-5 text-sm leading-relaxed text-gray-500 font-medium">
                                Ideal for businesses ready to explore AI and intelligent automation
                            </p>
                            <Link
                                href="https://surplushub.myr.id/membership/starter-tier-1-month"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-[#A5C0A1]/30 px-6 py-3.5 text-sm font-semibold text-[#2D5A27] transition-all hover:bg-[#E8F0E8] hover:border-[#A5C0A1]"
                            >
                                Get Started <ArrowUpRight className="h-4 w-4" />
                            </Link>
                            <div className="mt-8 mb-4 border-t border-dashed border-[#A5C0A1]/30" />
                            <ul className="flex flex-col gap-4">
                                {['Basic AI Tools', 'Limited Automation Features', 'Real-Time Reporting',].map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                        <Check className="h-4 w-4 text-[#A5C0A1]" /> {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pro Plan */}
                        <div className="group relative flex flex-col rounded-[2rem] bg-gradient-to-b from-[#E8F0E8] to-[#F4F8F4] p-8 mt-2 shadow-[0_12px_30px_-10px_rgba(45,90,39,0.15)] border border-[#A5C0A1] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_50px_-15px_rgba(45,90,39,0.25)] flex-1">
                            <div className="absolute -top-4 inset-x-0 flex justify-center">
                                <span className="flex items-center gap-1.5 rounded-full bg-[#2D5A27] px-4 py-1.5 text-[11px] font-bold tracking-wide uppercase text-white shadow-sm ring-4 ring-[#F4F8F4]">
                                    <Zap className="h-3 w-3 text-yellow-300" /> Popular
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-[#1F451A] mt-2">Pro</h3>
                            <div className="mt-4 flex items-baseline text-5xl font-extrabold tracking-tight text-[#1F451A]">
                                ${isYearly ? '65' : '10'}
                                <span className="ml-1 text-base font-medium text-[#2D5A27]/70">/month</span>
                            </div>
                            <p className="mt-5 text-sm leading-relaxed text-[#2D5A27]/80 font-medium">
                                Built for companies that want to gain an edge with AI-powered automation
                            </p>
                            <Link
                                href="https://surplushub.myr.id/membership/pro-tier-1-month"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-[#A5C0A1]/30 px-6 py-3.5 text-sm font-semibold text-[#2D5A27] transition-all hover:bg-[#E8F0E8] hover:border-[#A5C0A1]"
                            >
                                Get Started <ArrowUpRight className="h-4 w-4" />
                            </Link>
                            <div className="mt-8 mb-4 border-t border-dashed border-[#A5C0A1]/50" />
                            <ul className="flex flex-col gap-4">
                                {['Advanced AI Tools', 'Customizable Workflows', 'AI-Powered Analytics', 'Premium Chatbot Features', 'Cross-Platform Integrations'].map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm font-medium text-[#1F451A]">
                                        <div className="flex bg-[#2D5A27]/10 p-1 rounded-full"><Check className="h-3.5 w-3.5 text-[#2D5A27]" /></div> {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="group relative flex flex-col rounded-[2rem] bg-[#F7FAF7] p-8 shadow-[0_4px_20px_rgba(45,90,39,0.03)] border border-[#A5C0A1]/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(45,90,39,0.2)] flex-1">
                            <h3 className="text-lg font-bold text-[#2D5A27]">Enterprise</h3>
                            <div className="mt-4 flex items-baseline text-5xl font-extrabold tracking-tight text-gray-900">
                                ${isYearly ? '450' : '25'}
                                <span className="ml-1 text-base font-medium text-gray-500">/month</span>
                            </div>
                            <p className="mt-5 text-sm leading-relaxed text-gray-500 font-medium">
                                For businesses aiming to harness AI and automation to lead their industry
                            </p>
                            <Link
                                href="https://surplushub.myr.id/membership/enterprise-tier-1-month"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-[#A5C0A1]/30 px-6 py-3.5 text-sm font-semibold text-[#2D5A27] transition-all hover:bg-[#E8F0E8] hover:border-[#A5C0A1]"
                            >
                                Get Started <ArrowUpRight className="h-4 w-4" />
                            </Link>
                            <div className="mt-8 mb-4 border-t border-dashed border-[#A5C0A1]/30" />
                            <ul className="flex flex-col gap-4">
                                {['Fully Customized AI Solutions', 'Unlimited Integrations', 'Advanced Reporting & Insights', 'Scalable AI Solutions', 'Team Collaboration Features', 'Priority Feature Access'].map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                        <Check className="h-4 w-4 text-[#A5C0A1]" /> {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom banner */}
                    <div className="mt-14 flex justify-center">
                        <div className="inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-gray-200/60 text-sm font-semibold text-gray-600 transition-all hover:ring-gray-300">
                            <Heart className="h-4 w-4 text-gray-400" />
                            We donate 2% of your membership to pediatric wellbeing
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
