'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import type { Store, Product } from '@/types';
import { MapPin, Navigation, ExternalLink, Clock, Package } from 'lucide-react';
import Image from 'next/image';
import {
    Map,
    MapMarker,
    MarkerContent,
    MarkerLabel,
    MarkerPopup,
    MapControls,
} from '@/components/ui/map';
import { Button } from '@/components/ui/button';

interface StoreWithProducts extends Store {
    products: Product[];
}

interface MapViewProps {
    selectedStoreId: string | null;
    onMarkerClick: (storeId: string) => void;
}

export default function MapView({ selectedStoreId, onMarkerClick }: MapViewProps) {
    const [stores, setStores] = useState<StoreWithProducts[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch stores and their products
    const fetchStoresData = async () => {
        try {
            const { data, error } = await supabase
                .from('stores')
                .select(`
          *,
          products (*)
        `);
            if (error) throw error;
            setStores(data || []);
        } catch (err: any) {
            console.error('Error fetching stores:', err?.message || err?.code || JSON.stringify(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStoresData();

        // Subscribe to realtime changes in stores and products
        const storesSubscription = supabase
            .channel('stores-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'stores' }, () => {
                fetchStoresData();
            })
            .subscribe();

        const productsSubscription = supabase
            .channel('products-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                fetchStoresData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(storesSubscription);
            supabase.removeChannel(productsSubscription);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                <div className="flex flex-col items-center gap-3">
                    <MapPin className="h-8 w-8 animate-pulse text-gray-400" />
                    <span className="text-sm text-gray-400">Loading map...</span>
                </div>
            </div>
        );
    }

    // Find center point from first store or use default
    const defaultCenter: [number, number] = stores.length > 0
        ? [stores[0].longitude, stores[0].latitude]
        : [106.816666, -6.2]; // Jakarta default

    const viewport = selectedStoreId
        ? {
            center: [
                stores.find(s => s.id === selectedStoreId)?.longitude || defaultCenter[0],
                stores.find(s => s.id === selectedStoreId)?.latitude || defaultCenter[1]
            ] as [number, number],
            zoom: 15,
        }
        : undefined;

    return (
        <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100 relative">
            <Map
                viewport={viewport}
                center={defaultCenter}
                zoom={11}
            // Carto basemaps are free and look clean
            >
                <MapControls position="bottom-right" showCompass showZoom showLocate />

                {stores.map((store) => {
                    const isSelected = store.id === selectedStoreId;
                    // Calculate stats for this store
                    const activeProducts = store.products?.filter(p => new Date(p.expiry_date).getTime() > Date.now());
                    const totalStock = activeProducts?.reduce((acc, p) => acc + p.stock_quantity, 0) || 0;

                    return (
                        <MapMarker
                            key={store.id}
                            longitude={store.longitude}
                            latitude={store.latitude}
                            onClick={() => onMarkerClick(store.id)}
                        >
                            <MarkerContent>
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full border-[3px] shadow-lg cursor-pointer transition-transform duration-300 ${isSelected
                                            ? 'bg-primary border-white scale-110 z-50'
                                            : 'bg-white border-primary/20 hover:scale-105 hover:border-primary/50'
                                        }`}
                                >
                                    <MapPin className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-primary'}`} />
                                </div>
                                <MarkerLabel position="bottom" className="font-bold text-gray-800 bg-white/80 px-1.5 py-0.5 rounded backdrop-blur-sm mt-1">
                                    {store.name}
                                </MarkerLabel>
                            </MarkerContent>

                            {/* Only show popup if clicked or if it has interesting data */}
                            <MarkerPopup className="p-0 w-64 rounded-xl overflow-hidden shadow-2xl border-0 border-primary/10 bg-white/95 backdrop-blur-md">
                                <div className="relative h-24 overflow-hidden bg-gradient-to-br from-green-50 to-primary/10">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                        <MapPin className="h-16 w-16 text-primary" />
                                    </div>
                                </div>

                                <div className="space-y-3 p-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                            Partner Store
                                        </span>
                                        <h3 className="text-base font-bold text-gray-900 leading-tight">
                                            {store.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {store.address}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm pt-2 border-t border-gray-100">
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600">
                                                <Package className="h-3 w-3" />
                                            </div>
                                            <span className="font-semibold text-gray-800">{totalStock}</span>
                                            <span className="text-xs text-gray-500">porsi food rescue</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Realtime Available</span>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            className="flex-1 h-8 bg-primary hover:bg-primary/90 text-[11px] font-semibold rounded-lg"
                                            onClick={() => onMarkerClick(store.id)}
                                        >
                                            <Navigation className="w-3 h-3 mr-1.5" />
                                            Lihat Produk
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                                            onClick={() => {
                                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`, '_blank');
                                            }}
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </MarkerPopup>
                        </MapMarker>
                    );
                })}
            </Map>
        </div>
    );
}
