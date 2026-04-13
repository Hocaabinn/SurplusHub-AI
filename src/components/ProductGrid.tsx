'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import type { Product } from '@/types';
import ProductCard from './ProductCard';
import ReservationModal from './ReservationModal';

interface ProductGridProps {
    selectedStoreId: string | null;
}

export default function ProductGrid({ selectedStoreId }: ProductGridProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, [selectedStoreId]);

    async function fetchProducts() {
        setLoading(true);
        try {
            let query = supabase
                .from('products')
                .select('*, stores(name, address)')
                .gt('stock_quantity', 0)
                .order('expiry_date', { ascending: true });

            if (selectedStoreId) {
                query = query.eq('store_id', selectedStoreId);
            }

            const { data, error } = await query;
            if (error) throw error;
            setProducts(data || []);
        } catch (err: unknown) {
            console.warn('Error fetching products:', (err as Error)?.message || (err as { code?: string })?.code || JSON.stringify(err));
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }

    function handleRescue(product: Product) {
        setSelectedProduct(product);
    }

    function handleCloseModal() {
        setSelectedProduct(null);
        fetchProducts(); // re-fetch to update stock
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="h-[420px] animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
                    />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gradient-to-b from-green-50/60 to-white px-6 py-20 text-center shadow-sm">
                {/* Cheerful illustration */}
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-md ring-1 ring-gray-100 text-5xl select-none">
                    🍽️
                </div>

                <h3 className="mb-2 text-xl font-bold text-gray-800">
                    {selectedStoreId
                        ? 'This store is currently out of stock'
                        : 'No meals available right now'}
                </h3>
                <p className="mb-8 max-w-xs text-sm leading-relaxed text-gray-500">
                    {selectedStoreId
                        ? 'Try another merchant or check back soon, new stock drops daily.'
                        : 'Local merchant inventory refreshes often. Stay tuned for new rescues.'}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={() => alert('Notification feature coming soon!')}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-600 hover:shadow-md active:scale-95"
                    >
                        🔔 Notify Me When Stock Is Back
                    </button>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:border-green-200 hover:bg-green-50 hover:text-green-700 active:scale-95"
                    >
                        🗺️ View Nearby Partner Stores
                    </button>
                </div>
            </div>
        );
    }


    return (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onRescue={handleRescue}
                    />
                ))}
            </div>

            {selectedProduct && (
                <ReservationModal
                    product={selectedProduct}
                    onClose={handleCloseModal}
                    onSuccess={fetchProducts}
                />
            )}
        </>
    );
}
