'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ScanBarcode, Search, CheckCircle, XCircle, Package, User as UserIcon } from 'lucide-react';
import { Order } from '@/types';

type RedeemOrder = Order & {
    profiles?: {
        full_name?: string;
        role?: string;
    };
    products?: {
        title: string;
        image_url?: string;
        partner_id?: string;
    } | null;
};

function normalizeProductRelation(productRelation: unknown) {
    const product = Array.isArray(productRelation) ? productRelation[0] : productRelation;
    if (!product || typeof product !== 'object') {
        return null;
    }

    return {
        ...(product as Record<string, unknown>),
    };
}

export default function PartnerRedeemPage() {
    const { user } = useAuth();
    const [pickupCode, setPickupCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        order?: RedeemOrder;
    } | null>(null);

    async function handleRedeem(e: React.FormEvent) {
        e.preventDefault();
        if (!user || !pickupCode.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            const normalizedPickupCode = pickupCode.trim().toUpperCase();

            // 1. Find the order
            const { data: orders, error: searchError } = await supabase
                .from('orders')
                .select(`
                    *,
                    products (
                        title,
                        image_url,
                        partner_id
                    ),
                    profiles:user_id (full_name, role)
                `)
                .eq('pickup_code', normalizedPickupCode)
                .eq('status', 'pending')
                .limit(1);

            if (searchError) throw searchError;

            if (!orders || orders.length === 0) {
                setResult({
                    success: false,
                    message: 'Kode pickup tidak ditemukan. Mohon periksa kembali.'
                });
                return;
            }

            const order = orders[0] as RedeemOrder;
            const normalizedProduct = normalizeProductRelation(order.products);
            const normalizedOrder: RedeemOrder = {
                ...order,
                products: normalizedProduct as RedeemOrder['products'],
            };

            if ((normalizedProduct as { stores?: { owner_id?: string } } | null)?.stores?.owner_id !== user.id) {
                setResult({
                    success: false,
                    message: 'Pesanan ini tidak terdaftar pada toko Anda.'
                });
                return;
            }

            // 2. Validate status
            if (normalizedOrder.status === 'completed') {
                setResult({
                    success: false,
                    message: 'Pesanan ini sudah diambil sebelumnya.',
                    order: normalizedOrder
                });
                return;
            }

            if (normalizedOrder.status === 'cancelled') {
                setResult({
                    success: false,
                    message: 'Pesanan ini telah dibatalkan.',
                    order: normalizedOrder
                });
                return;
            }

            // 3. Update status to completed
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status: 'completed' })
                .eq('id', order.id);

            if (updateError) throw updateError;

            setResult({
                success: true,
                message: 'Pesanan berhasil diverifikasi dan diselesaikan!',
                order: { ...normalizedOrder, status: 'completed' }
            });
            setPickupCode('');

        } catch (err: unknown) {
            console.error('Redeem error:', err);
            setResult({
                success: false,
                message: 'Terjadi kesalahan sistem. Silakan coba lagi.'
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <ProtectedRoute requiredRole="partner">
            <div className="min-h-screen bg-gray-50 pb-12 pt-8 dark:bg-[#0a0f0a]">
                <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-green-500/20">
                            <ScanBarcode className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Redeem Pesanan
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Masukkan kode pickup dari pelanggan untuk menyelesaikan pesanan.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-900">
                        <div className="p-8">
                            <form onSubmit={handleRedeem} className="space-y-4">
                                <div>
                                    <label htmlFor="pickup-code" className="sr-only">Pickup Code</label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="pickup-code"
                                            value={pickupCode}
                                            onChange={(e) => setPickupCode(e.target.value.toUpperCase())}
                                            placeholder="Masukkan Kode Pickup (Contoh: A1B2C3)"
                                            className="block w-full rounded-xl border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-lg font-mono font-bold tracking-wider text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-primary dark:border-gray-800 dark:bg-gray-800 dark:text-white"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !pickupCode.trim()}
                                    className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sem font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-green-500/30 disabled:opacity-70 disabled:shadow-none"
                                >
                                    {loading ? 'Memproses...' : 'Verifikasi Kode'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {result && (
                        <div className={`mt-6 animate-fade-in overflow-hidden rounded-2xl border shadow-sm ${result.success
                            ? 'border-green-100 bg-white dark:border-green-900/30 dark:bg-gray-900'
                            : 'border-red-100 bg-white dark:border-red-900/30 dark:bg-gray-900'
                            }`}>
                            <div className={`flex items-center gap-3 px-6 py-4 ${result.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                                }`}>
                                {result.success ? (
                                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                ) : (
                                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                )}
                                <h3 className={`font-semibold ${result.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                                    }`}>
                                    {result.success ? 'Berhasil Di-redeem!' : 'Gagal Memproses'}
                                </h3>
                            </div>

                            <div className="p-6">
                                <p className={`mb-4 text-sm ${result.success ? 'text-gray-600 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {result.message}
                                </p>

                                {result.order && (
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                                        <div className="mb-3 flex items-start gap-4">
                                            {result.order.products?.image_url && (
                                                <img
                                                    src={result.order.products.image_url}
                                                    alt="Product"
                                                    className="h-16 w-16 rounded-lg object-cover bg-gray-200"
                                                />
                                            )}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    {result.order.products?.title}
                                                </h4>
                                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                                    <Package className="h-4 w-4" />
                                                    <span>{result.order.quantity} porsi</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <UserIcon className="h-4 w-4" />
                                                <span className="font-medium">
                                                    Pemesan: {result.order.profiles?.full_name || 'User'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
