'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Clock, Package, CheckCircle2, TrendingUp, AlertCircle, Store, History } from 'lucide-react';

interface OrderHistory {
  id: string;
  created_at: string;
  quantity: number;
  total_price: number;
  co2_saved: number;
  products: {
    id: string;
    title: string;
    image_url: string;
  };
  stores: {
    name: string;
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

      // Step 1: Get stores belonging to the partner
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id);

      if (storesError) {
        console.error('Error fetching stores:', storesError);
        setError('Gagal memuat riwayat transaksi.');
        setLoading(false);
        return;
      }

      if (!storesData || storesData.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      const storeIds = storesData.map((store) => store.id);

      // Step 2: Get completed orders for those stores
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          products (*),
          stores (*)
        `)
        .in('store_id', storeIds)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        setError('Gagal memuat riwayat transaksi.');
        setLoading(false);
        return;
      }

      // Pastikan data dipassing berupa array kosong jika null
      setHistory((ordersData || []) as any as OrderHistory[]);
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
          
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
              <p className="text-sm text-gray-500">
                Daftar surplus makanan yang berhasil di-rescue oleh pelanggan.
              </p>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-white shadow-sm border border-gray-100" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-6 text-red-700">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <div>
                <h3 className="font-semibold">Terjadi Kesalahan</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-100">
                <History className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Belum ada riwayat pesanan</h3>
              <p className="max-w-sm mb-6 text-gray-500">
                Pesanan yang berhasil di-rescue akan muncul di sini.
              </p>
              <Link
                href="/merchant"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark"
              >
                Kembali ke Dashboard
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
                  minute: '2-digit'
                });

                return (
                  <div key={order.id} className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md border border-gray-100">
                    <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/50 px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Successfully Rescued
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6">
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
                        <div className="flex items-center gap-2 mb-1">
                          <Store className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">{order.stores?.name}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{order.products?.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {order.quantity} porsi terjual • Total: <span className="font-semibold text-gray-900">Rp {order.total_price.toLocaleString('id-ID')}</span>
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 rounded-xl bg-[#F0FDF4] p-4 text-primary w-full sm:w-auto mt-4 sm:mt-0">
                        <TrendingUp className="h-5 w-5" />
                        <div>
                          <p className="text-xs font-medium text-green-700 uppercase tracking-wider mb-0.5">Dampak Positif</p>
                          <p className="font-bold">{(order.co2_saved || (0.5 * order.quantity)).toFixed(1)} kg CO₂ diselamatkan</p>
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
