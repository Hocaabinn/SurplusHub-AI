'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), {
    ssr: false,
    loading: () => (
        <div className="flex h-[400px] items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
            <span className="text-sm text-gray-400">Loading map...</span>
        </div>
    ),
});

interface MapWrapperProps {
    selectedStoreId: string | null;
    onMarkerClick: (storeId: string) => void;
}

export default function MapWrapper({ selectedStoreId, onMarkerClick }: MapWrapperProps) {
    return <MapView selectedStoreId={selectedStoreId} onMarkerClick={onMarkerClick} />;
}
