'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/types';
import { X, CheckCircle, Minus, Plus, ShoppingBag, Copy, Check, LogIn, MapPin, Clock, PartyPopper, Brain } from 'lucide-react';
import Link from 'next/link';
import { calculateDynamicPrice } from '@/lib/dynamicPricing';

interface ReservationModalProps {
    product: Product;
    onClose: () => void;
    onSuccess?: () => void;
}

function generatePickupCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function extractErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err !== null && 'message' in err) {
        return (err as { message: string }).message;
    }
    return 'Unknown error occurred.';
}

export default function ReservationModal({ product, onClose, onSuccess }: ReservationModalProps) {
    const { user, profile } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [pickupCode, setPickupCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const maxQuantity = Math.min(product.stock_quantity, 5);

    // Use AI dynamic pricing
    const dynamicPrice = calculateDynamicPrice(
        product.original_price,
        product.discount_price,
        product.expiry_date,
        product.created_at,
    );
    const unitPrice = dynamicPrice.currentPrice;
    const totalPrice = unitPrice * quantity;

    async function handleConfirm() {
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            // Step 1: Check latest stock availability
            const { data: freshProduct, error: fetchError } = await supabase
                .from('products')
                .select('stock_quantity')
                .eq('id', product.id)
                .single();

            if (fetchError) throw new Error('Could not verify stock availability.');
            if (!freshProduct || freshProduct.stock_quantity < quantity) {
                throw new Error(
                    `Only ${freshProduct?.stock_quantity ?? 0} item(s) left in stock. Please reduce your quantity.`
                );
            }

            // Step 2: Insert the order
            const code = generatePickupCode();
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    product_id: product.id,
                    quantity,
                    total_price: totalPrice,
                    pickup_code: code,
                    status: 'pending',
                })
                .select('id')
                .single();

            if (orderError) throw orderError;

            // Step 3: Decrement stock — try RPC first, fallback to direct update
            let stockUpdateFailed = false;
            let stockErrorMsg = '';

            try {
                const { error: rpcError } = await supabase.rpc('decrement_stock', {
                    p_id: product.id,
                    qty: quantity,
                });
                if (rpcError) throw rpcError;
            } catch {
                // RPC not available — fallback to direct update with guard
                const newStock = freshProduct.stock_quantity - quantity;
                const { error: updateError, count } = await supabase
                    .from('products')
                    .update({ stock_quantity: newStock })
                    .eq('id', product.id)
                    .gte('stock_quantity', quantity);

                if (updateError) {
                    stockUpdateFailed = true;
                    stockErrorMsg = updateError.message;
                } else if (count === 0) {
                    stockUpdateFailed = true;
                    stockErrorMsg = 'Stock was modified by another user. Please try again.';
                }
            }

            // Step 4: If stock update failed, rollback the order
            if (stockUpdateFailed) {
                await supabase.from('orders').delete().eq('id', orderData.id);
                throw new Error(`Stock update failed: ${stockErrorMsg}`);
            }

            // Step 5: Success
            setPickupCode(code);
        } catch (err) {
            console.error('Reservation error:', err);
            setError(`Reservation failed: ${extractErrorMessage(err)}`);
        } finally {
            setLoading(false);
        }
    }

    async function handleCopyCode() {
        if (pickupCode) {
            await navigator.clipboard.writeText(pickupCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <div
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="animate-scale-in w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        {pickupCode ? '🎉 Rescue Berhasil!' : 'Rescue This Food'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Not logged in state */}
                    {!user ? (
                        <div className="flex flex-col items-center gap-5 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                                <LogIn className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Login Required
                                </h3>
                                <p className="mt-1 text-sm text-muted">
                                    You need to be logged in to rescue food. Create a free account to get started!
                                </p>
                            </div>
                            <div className="flex w-full flex-col gap-2">
                                <Link
                                    href="/login"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:brightness-110"
                                >
                                    <LogIn className="h-4 w-4" />
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    ) : pickupCode ? (
                        /* ✅ Success State */
                        <div className="flex flex-col items-center gap-6 text-center">
                            {/* Animated success icon */}
                            <div className="relative">
                                <div className="absolute inset-0 animate-ping rounded-full bg-green-400/30" style={{ animationDuration: '1.5s', animationIterationCount: '2' }} />
                                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30">
                                    <CheckCircle className="h-10 w-10 text-white" />
                                </div>
                            </div>

                            {/* Success heading */}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    🎉 Rescue Berhasil!
                                </h3>
                                <p className="mt-1 text-sm text-muted">
                                    Pesanan kamu telah dikonfirmasi
                                </p>
                            </div>

                            {/* Pickup Code */}
                            <div className="w-full rounded-2xl border-2 border-dashed border-green-300 bg-green-50/80 p-5 dark:border-green-700 dark:bg-green-900/20">
                                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-green-600 dark:text-green-400">
                                    Kode Pickup
                                </p>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="font-mono text-4xl font-black tracking-[0.3em] text-gray-900 dark:text-white">
                                        {pickupCode}
                                    </span>
                                    <button
                                        onClick={handleCopyCode}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm transition-all hover:bg-green-100 hover:text-green-600"
                                        title="Salin kode"
                                    >
                                        {copied ? (
                                            <Check className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <Copy className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {copied && (
                                    <p className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">
                                        ✓ Kode disalin!
                                    </p>
                                )}
                            </div>

                            {/* Order Summary */}
                            <div className="w-full space-y-3 rounded-xl bg-gray-50 p-4 text-left">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Detail Pesanan
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-700">{product.title}</span>
                                    </div>
                                    <span className="font-medium text-gray-900">×{quantity}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Total</span>
                                        <span className="text-lg font-bold text-primary">
                                            Rp{totalPrice.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Store pickup info */}
                            <div className="flex w-full items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-left dark:bg-amber-900/15">
                                <MapPin className="h-5 w-5 flex-shrink-0 text-amber-500" />
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    Tunjukkan kode ini di <strong>{product.stores?.name || 'toko'}</strong> untuk mengambil pesananmu.
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex w-full flex-col gap-2">
                                <Link
                                    href="/history"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:brightness-110"
                                >
                                    <Clock className="h-4 w-4" />
                                    Lihat Pesanan Saya
                                </Link>
                                <button
                                    onClick={() => { onSuccess?.(); onClose(); }}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Booking Form */
                        <div className="flex flex-col gap-5">
                            {/* Partner tester banner */}
                            {profile?.role === 'partner' && (
                                <div className="rounded-lg bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                                    🧪 As a Partner, you are rescuing this as a tester.
                                </div>
                            )}

                            {/* Product info */}
                            <div className="flex gap-4">
                                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-50 dark:bg-green-900/20">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <ShoppingBag className="h-8 w-8 text-green-300" />
                                    )}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {product.title}
                                    </h3>
                                    <p className="text-sm text-muted">{product.stores?.name}</p>
                                    <div className="mt-1 flex items-baseline gap-2">
                                        <span className="text-lg font-bold text-primary">
                                            Rp{unitPrice.toLocaleString('id-ID')}
                                        </span>
                                        {unitPrice < product.discount_price && (
                                            <span className="text-xs text-gray-400 line-through">
                                                Rp{product.discount_price.toLocaleString('id-ID')}
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-300 line-through">
                                            Rp{product.original_price.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    {dynamicPrice.dynamicDiscountPercent > 0 && (
                                        <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                            <Brain className="h-2.5 w-2.5" />
                                            AI Price Drop -{dynamicPrice.dynamicDiscountPercent}%
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quantity selector */}
                            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                                <span className="text-sm font-medium text-gray-700">
                                    Quantity
                                </span>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-8 text-center text-lg font-bold text-gray-900">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                        disabled={quantity >= maxQuantity}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between rounded-xl border-2 border-green-100 px-4 py-3 dark:border-green-900/30">
                                <span className="text-sm font-medium text-gray-600">Total</span>
                                <span className="text-xl font-bold text-primary">
                                    Rp{totalPrice.toLocaleString('id-ID')}
                                </span>
                            </div>

                            {error && (
                                <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                    {error}
                                </p>
                            )}

                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:brightness-110 disabled:opacity-60"
                            >
                                {loading ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4" />
                                        Confirm Rescue
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
