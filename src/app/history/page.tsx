'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Order } from '@/types';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { Store, Calendar, ShoppingBag } from 'lucide-react';

export default function OrderHistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        products!inner (
                            title,
                            image_url,
                            stores!inner (
                                name,
                                owner_id
                            )
                        )
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                console.log("Orders:", data);
                console.log("Error:", error);

                if (error) {
                    console.error('Database error:', error);
                }
                
                setOrders((data || []) as unknown as Order[]);
            } catch (err) {
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        }

        if (!authLoading && user) {
            fetchOrders();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 pb-12 pt-8 dark:bg-[#0a0f0a]">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
                        Order History
                    </h1>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 animate-pulse rounded-2xl bg-white dark:bg-gray-900" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-sm dark:bg-gray-900">
                            <div className="mb-4 rounded-full bg-green-50 p-4 dark:bg-green-900/20">
                                <ShoppingBag className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                                No orders yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                No rescued orders yet. Keep your surplus listings fresh to drive more demand.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md dark:bg-gray-900"
                                >
                                    <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                                {order.products?.image_url ? (
                                                    <img
                                                        src={order.products.image_url}
                                                        alt={order.products.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                        <Store className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {order.products?.title || 'Unknown Product'}
                                                </h3>
                                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Store className="h-3.5 w-3.5" />
                                                    <span>{order.products?.stores?.name || 'Unknown Store'}</span>
                                                </div>
                                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>{new Date(order.created_at || '').toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-2">
                                            <div className="text-right">
                                                <span className="block text-sm text-gray-500 dark:text-gray-400">Quantity</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{order.quantity}x</span>
                                            </div>
                                            <OrderStatusBadge status={order.status} context="customer" />
                                        </div>
                                    </div>

                                    {order.status === 'pending' && (
                                        <div className="border-t border-gray-100 bg-orange-50/50 px-6 py-3 dark:border-gray-800 dark:bg-orange-900/10">
                                            <p className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-400">
                                                <span className="font-medium">Pickup Code:</span>
                                                <code className="rounded bg-white px-2 py-0.5 font-mono text-base font-bold tracking-wider dark:bg-black">
                                                    {order.pickup_code}
                                                </code>
                                                <span className="hidden sm:inline">- Show this code to store staff during pickup.</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}

