'use client';

import { useState } from 'react';
import { Leaf, ArrowRight, MapPin, X, TrendingDown, Zap } from 'lucide-react';
import Image from 'next/image';
import MapWrapper from './MapWrapper';
import ProductGrid from './ProductGrid';
import 'leaflet/dist/leaflet.css';

interface DashboardClientProps {
    co2Saved: number;
}

export default function DashboardClient({ co2Saved }: DashboardClientProps) {
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

    function handleMarkerClick(storeId: string) {
        setSelectedStoreId(storeId);
    }

    function clearFilter() {
        setSelectedStoreId(null);
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white pb-16 pt-20 sm:pb-24 sm:pt-32 lg:pb-32">
                {/* Decorative Background Blobs */}
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#86efac] to-[#3b82f6] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>
                <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                    <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#fde047] to-[#86efac] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-16">
                        {/* Left Column: Text Content */}
                        <div className="lg:col-span-6 flex flex-col justify-center text-center lg:text-left">
                            {/* Badge */}
                            <div className="mb-8 flex justify-center lg:justify-start">
                                <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                                    Rescuing food, one meal at a time.{' '}
                                    <a href="#marketplace" className="font-semibold text-green-600">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        Read more <span aria-hidden="true">&rarr;</span>
                                    </a>
                                </div>
                            </div>

                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                                Save Food, <br className="hidden lg:block" />
                                <span className="text-green-600">Save Money.</span>
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                Join thousands of food heroes rescuing surplus meals from local stores at unbeatably low prices. Eat well while helping the planet.
                            </p>

                            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                                <a
                                    href="#marketplace"
                                    className="rounded-full bg-green-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all hover:-translate-y-0.5 active:scale-95"
                                >
                                    Browse Available Food
                                </a>
                                <a href="/register" className="text-sm font-semibold leading-6 text-gray-900 hover:text-green-600 transition-colors">
                                    Become a Partner <span aria-hidden="true">→</span>
                                </a>
                            </div>
                        </div>

                        {/* Right Column: Visuals / Stats Cards */}
                        <div className="relative mt-16 lg:mt-0 lg:col-span-6 lg:flex lg:items-center">
                            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                                {/* Abstract shape decoration behind cards */}
                                <div className="absolute -top-12 -right-12 -z-10 h-64 w-64 bg-green-100 rounded-full blur-3xl opacity-60 dark:bg-green-900/20"></div>
                                <div className="absolute -bottom-12 -left-12 -z-10 h-64 w-64 bg-yellow-100 rounded-full blur-3xl opacity-60 dark:bg-yellow-900/20"></div>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 lg:gap-8">
                                    {/* Card 1: Savings */}
                                    <div className="sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:mt-12">
                                        <div className="relative flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5 transform transition-transform hover:scale-105 duration-300">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                                <TrendingDown className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-gray-900">50% Average Savings</p>
                                                <p className="mt-1 text-sm text-gray-500">Get premium food for a fraction of the cost.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 2: Environment */}
                                    <div className="lg:col-span-1">
                                        <div className="relative flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5 transform transition-transform hover:scale-105 duration-300">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                                <Leaf className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-gray-900">{co2Saved}kg CO₂</p>
                                                <p className="mt-1 text-sm text-gray-500">Every meal rescued fights climate change.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 3: Speed/Ease */}
                                    <div className="lg:col-span-1">
                                        <div className="relative flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5 transform transition-transform hover:scale-105 duration-300">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                                                <Zap className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-gray-900">3 Clicks</p>
                                                <p className="mt-1 text-sm text-gray-500">Reserve your bag in seconds.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                        <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Nearby Stores
                        </h2>
                        <p className="text-sm text-muted">
                            Click a marker to filter food from that store
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
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
                        <h2 className="text-xl font-bold text-gray-900">
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
                            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
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
