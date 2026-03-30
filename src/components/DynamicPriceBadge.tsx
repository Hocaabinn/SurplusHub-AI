'use client';

import { useState, useEffect } from 'react';
import { TrendingDown, Brain, Zap, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import {
    calculateDynamicPrice,
    getDynamicPriceLabel,
    getDynamicPriceDescription,
    type DynamicPriceResult,
} from '@/lib/dynamicPricing';

interface DynamicPriceBadgeProps {
    originalPrice: number;
    discountAmount: number;
    expiryDate: string;
    createdAt?: string;
    /** When true, show price inline (compact mode for cards) */
    compact?: boolean;
    /** Callback with real-time dynamic price */
    onPriceChange?: (result: DynamicPriceResult) => void;
}

export default function DynamicPriceBadge({
    originalPrice,
    discountAmount,
    expiryDate,
    createdAt,
    compact = false,
    onPriceChange,
}: DynamicPriceBadgeProps) {
    const [priceResult, setPriceResult] = useState<DynamicPriceResult>(
        calculateDynamicPrice(originalPrice, discountAmount, expiryDate, createdAt)
    );
    const [showDetail, setShowDetail] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Update price every 30 seconds
        const interval = setInterval(() => {
            const newResult = calculateDynamicPrice(originalPrice, discountAmount, expiryDate, createdAt);

            // Trigger animation if price changed
            if (newResult.currentPrice !== priceResult.currentPrice) {
                setIsAnimating(true);
                setTimeout(() => setIsAnimating(false), 600);
            }

            setPriceResult(newResult);
            onPriceChange?.(newResult);
        }, 30000);

        // Initial callback
        onPriceChange?.(priceResult);

        return () => clearInterval(interval);
    }, [originalPrice, discountAmount, expiryDate, createdAt]);

    const label = getDynamicPriceLabel(priceResult);
    const description = getDynamicPriceDescription(priceResult);

    const urgencyIcons = {
        'normal': <TrendingDown className="h-3 w-3" />,
        'dropping': <TrendingDown className="h-3 w-3" />,
        'flash-sale': <Zap className="h-3 w-3" />,
        'last-chance': <Flame className="h-3 w-3" />,
    };

    const urgencyBgColors = {
        'normal': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'dropping': 'bg-amber-50 text-amber-700 border-amber-200',
        'flash-sale': 'bg-orange-50 text-orange-700 border-orange-200',
        'last-chance': 'bg-red-50 text-red-700 border-red-200',
    };

    const urgencyPillColors = {
        'normal': 'bg-emerald-500',
        'dropping': 'bg-amber-500',
        'flash-sale': 'bg-orange-500',
        'last-chance': 'bg-red-500',
    };

    // Compact mode for product cards
    if (compact) {
        return (
            <div className="flex flex-col gap-1.5">
                {/* Dynamic Price */}
                <div className="flex items-baseline gap-2">
                    <span className={`text-xl font-bold text-primary transition-all duration-500 ${isAnimating ? 'scale-110 text-green-500' : ''}`}>
                        Rp{priceResult.currentPrice.toLocaleString('id-ID')}
                    </span>
                    {priceResult.currentPrice < priceResult.sellerFinalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                            Rp{priceResult.sellerFinalPrice.toLocaleString('id-ID')}
                        </span>
                    )}
                    <span className="text-sm text-gray-400 line-through">
                        Rp{originalPrice.toLocaleString('id-ID')}
                    </span>
                </div>

                {/* AI Dynamic Pricing Badge */}
                {priceResult.dynamicDiscountPercent > 0 && (
                    <div
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-semibold ${urgencyBgColors[priceResult.urgencyLabel]}`}
                    >
                        <Brain className="h-3 w-3" />
                        <span>AI Pricing</span>
                        <span className="font-mono">-{priceResult.dynamicDiscountPercent}%</span>
                        {urgencyIcons[priceResult.urgencyLabel]}
                    </div>
                )}
            </div>
        );
    }

    // Full detailed mode
    return (
        <div className={`overflow-hidden rounded-xl border transition-all ${urgencyBgColors[priceResult.urgencyLabel]}`}>
            {/* Header */}
            <button
                onClick={() => setShowDetail(!showDetail)}
                className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:opacity-80"
            >
                <div className="flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${urgencyPillColors[priceResult.urgencyLabel]} text-white`}>
                        <Brain className="h-3 w-3" />
                    </div>
                    <div>
                        <span className="text-xs font-bold">Smart AI Pricing</span>
                        <span className="ml-1.5 text-[10px] font-medium opacity-70">{label}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    {priceResult.dynamicDiscountPercent > 0 && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${urgencyPillColors[priceResult.urgencyLabel]}`}>
                            -{priceResult.dynamicDiscountPercent}% extra
                        </span>
                    )}
                    {showDetail ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </div>
            </button>

            {/* Detail Panel */}
            {showDetail && (
                <div className="border-t border-current/10 px-3 py-2.5 text-[11px] leading-relaxed opacity-80">
                    <p>{description}</p>

                    {/* Price breakdown */}
                    <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between">
                            <span>Harga Asli</span>
                            <span className="font-medium line-through">Rp{originalPrice.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Diskon Partner</span>
                            <span className="font-medium">Rp{priceResult.sellerFinalPrice.toLocaleString('id-ID')} ({priceResult.sellerDiscountPercent}%)</span>
                        </div>
                        {priceResult.dynamicDiscountPercent > 0 && (
                            <div className="flex items-center justify-between font-bold">
                                <span className="flex items-center gap-1">
                                    <Brain className="h-3 w-3" />
                                    AI Dynamic Price
                                </span>
                                <span>Rp{priceResult.currentPrice.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                    </div>

                    {/* Progress bar showing time */}
                    <div className="mt-2.5">
                        <div className="mb-1 flex items-center justify-between text-[10px]">
                            <span>Sisa waktu</span>
                            <span className="font-mono">{priceResult.hoursLeft.toFixed(1)}h</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-current/10">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${priceResult.urgencyColor} transition-all duration-1000`}
                                style={{ width: `${priceResult.timeRatio * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
