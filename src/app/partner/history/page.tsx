'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { Clock, Package, TrendingUp, AlertCircle, Store, History } from 'lucide-react';

interface OrderHistory {
  id: string;
  created_at: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'completed' | 'cancelled';
  products: {
    id: string;
    title: string;
    image_url: string;
    co2_saved?: number;
    stores?: {
      name: string;
    };
  };
}

type RawOrderHistory = {
  id: string;
  created_at: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'completed' | 'cancelled';
  products: unknown;
};

function normalizeProductRelation(productRelation: unknown) {
  const product = Array.isArray(productRelation) ? productRelation[0] : productRelation;
  if (!product || typeof product !== 'object') {
    return null;
  }

  const stores = (product as { stores?: unknown }).stores;
  const store = Array.isArray(stores) ? stores[0] : stores;

  return {
    ...(product as Record<string, unknown>),
    stores: store && typeof store === 'object' ? (store as { name: string }) : undefined,
  };
}

export default function PartnerHistoryPage() {
  const { user, profile } = useAuth();
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;

      setLoading(true);
      setError('');

      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id);

      if (storesError) {
        setError('Failed to load merchant store list.');
        setLoading(false);
        return;
      }

      const storeIds = (storesData || []).map((store) => store.id);
      if (storeIds.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id')
        .in('store_id', storeIds);

      if (productsError) {
        setError('Failed to load merchant product list.');
        setLoading(false);
        return;
      }

      const productIds = (productsData || []).map((product) => product.id);
      if (productIds.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          quantity,
          total_price,
          status,
          products!inner (
            id,
            title,
            image_url,
            co2_saved,
            stores (
              name
            )
          )
        `)
        .in('product_id', productIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (ordersError) {
        setError('Failed to load transaction history.');
        setLoading(false);
        return;
      }

      const normalizedHistory = ((ordersData || []) as RawOrderHistory[]).map((order) => ({
        ...order,
        products: normalizeProductRelation(order.products),
      }));

      setHistory(normalizedHistory as OrderHistory[]);
      setLoading(false);
    }

    if (user && profile?.role === 'partner') {
      fetchHistory();
    }
  }, [user, profile]);

  return (
    <ProtectedRoute requiredRole="partner">
      <div className="min-h-screen bg-[#f5f5f5] py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
              <p className="text-sm text-gray-500">
                Order statuses are shown directly from the orders table.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 w-full animate-pulse rounded-2xl border border-gray-100 bg-white shadow-sm" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-6 text-red-700">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <div>
                <h3 className="font-semibold">Something Went Wrong</h3>
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-100 bg-gray-50">
                <History className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No order history yet</h3>
              <p className="mb-6 max-w-sm text-gray-500">
                Customer orders will appear here with live status from the database.
              </p>
              <Link
                href="/merchant"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark"
              >
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((order) => {
                const date = new Date(order.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={order.id} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/50 px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{date}</span>
                      </div>
                      <OrderStatusBadge status={order.status} context="partner" />
                    </div>

                    <div className="flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {order.products?.image_url ? (
                          <img
                            src={order.products.image_url}
                            alt={order.products.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            <Package className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Store className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">
                            {order.products?.stores?.name || 'Unknown Store'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{order.products?.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {order.quantity} portions sold - Total:{' '}
                          <span className="font-semibold text-gray-900">
                            Rp {order.total_price.toLocaleString('id-ID')}
                          </span>
                        </p>
                      </div>

                      <div className="mt-4 flex w-full shrink-0 items-center gap-2 rounded-xl bg-[#F0FDF4] p-4 text-primary sm:mt-0 sm:w-auto">
                        <TrendingUp className="h-5 w-5" />
                        <div>
                          <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-green-700">
                            Positive Impact
                          </p>
                          <p className="font-bold">
                            {(order.products?.co2_saved || 0.5 * order.quantity).toFixed(1)} kg CO2 rescued
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
