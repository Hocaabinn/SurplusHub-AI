'use client';

import { useState, useEffect } from 'react';
import { Clock, Leaf, ShoppingBag, Brain, TrendingDown, Zap, Flame } from 'lucide-react';
import type { Product } from '@/types';
import {
    calculateDynamicPrice,
    getDynamicPriceLabel,
    type DynamicPriceResult,
} from '@/lib/dynamicPricing';

interface ProductCardProps {
    product: Product;
    onRescue: (product: Product) => void;
}

function getTimeRemaining(expiryDate: string) {
    const total = new Date(expiryDate).getTime() - Date.now();
    if (total <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0 };
    const hours = Math.floor(total / (1000 * 60 * 60));
    const minutes = Math.floor((total / (1000 * 60)) % 60);
    const seconds = Math.floor((total / 1000) % 60);
    return { total, hours, minutes, seconds };
}

export default function ProductCard({ product, onRescue }: ProductCardProps) {
    const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(product.expiry_date));
    const [dynamicPrice, setDynamicPrice] = useState<DynamicPriceResult>(
        calculateDynamicPrice(product.original_price, product.discount_price, product.expiry_date, product.created_at)
    );
    const [priceAnimating, setPriceAnimating] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(getTimeRemaining(product.expiry_date));

            // Update dynamic price every tick
            const newPrice = calculateDynamicPrice(
                product.original_price,
                product.discount_price,
                product.expiry_date,
                product.created_at,
            );

            if (newPrice.currentPrice !== dynamicPrice.currentPrice) {
                setPriceAnimating(true);
                setTimeout(() => setPriceAnimating(false), 600);
            }

            setDynamicPrice(newPrice);
        }, 1000);

        return () => clearInterval(timer);
    }, [product.expiry_date, product.original_price, product.discount_price, product.created_at]);

    const isExpired = timeRemaining.total <= 0;
    const isOutOfStock = product.stock_quantity <= 0;

    const urgencyColors = {
        'normal': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'dropping': 'bg-amber-50 text-amber-700 border-amber-200',
        'flash-sale': 'bg-orange-50 text-orange-700 border-orange-200',
        'last-chance': 'bg-red-50 text-red-700 border-red-200',
    };

    const urgencyIcons = {
        'normal': <TrendingDown className="h-3 w-3" />,
        'dropping': <TrendingDown className="h-3 w-3" />,
        'flash-sale': <Zap className="h-3 w-3" />,
        'last-chance': <Flame className="h-3 w-3" />,
    };

    const urgencyPulse = {
        'normal': '',
        'dropping': '',
        'flash-sale': 'animate-urgency',
        'last-chance': 'animate-urgency',
    };

    return (
        <div className="animate-fade-in group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5 hover:-translate-y-1">
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-16 w-16 text-green-200" />
                    </div>
                )}

                {/* Total discount badge */}
                <div className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-red-500/30">
                    {dynamicPrice.totalDiscountPercent}% OFF
                </div>

                {/* Eco badge */}
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-green-700 shadow-sm backdrop-blur-sm">
                    <Leaf className="h-3 w-3" />
                    Saved {product.co2_saved}kg CO₂
                </div>

                {/* AI Dynamic Pricing ribbon */}
                {dynamicPrice.dynamicDiscountPercent > 0 && (
                    <div className={`absolute left-0 bottom-0 right-0 flex items-center justify-center gap-1.5 bg-gradient-to-r ${dynamicPrice.urgencyColor} px-3 py-1.5 text-[10px] font-bold text-white shadow-inner`}>
                        <Brain className="h-3 w-3" />
                        <span>AI Price Drop -{dynamicPrice.dynamicDiscountPercent}%</span>
                        {urgencyIcons[dynamicPrice.urgencyLabel]}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Store name */}
                {product.stores && (
                    <span className="text-xs font-medium uppercase tracking-wider text-muted">
                        {product.stores.name}
                    </span>
                )}

                {/* Title */}
                <h3 className="text-base font-semibold leading-tight text-gray-900">
                    {product.title}
                </h3>

                {/* Dynamic Price Display */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                        <span
                            className={`text-xl font-bold text-primary transition-all duration-500 ${priceAnimating ? 'scale-110 text-green-500' : ''
                                }`}
                        >
                            Rp{dynamicPrice.currentPrice.toLocaleString('id-ID')}
                        </span>
                        {dynamicPrice.currentPrice < dynamicPrice.sellerFinalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                                Rp{dynamicPrice.sellerFinalPrice.toLocaleString('id-ID')}
                            </span>
                        )}
                        <span className="text-sm text-gray-300 line-through">
                            Rp{product.original_price.toLocaleString('id-ID')}
                        </span>
                    </div>

                    {/* Smart pricing info pill */}
                    {dynamicPrice.dynamicDiscountPercent > 0 && (
                        <div
                            className={`inline-flex w-fit items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${urgencyColors[dynamicPrice.urgencyLabel]
                                }`}
                        >
                            <Brain className="h-2.5 w-2.5" />
                            {getDynamicPriceLabel(dynamicPrice)}
                            {dynamicPrice.urgencyLabel !== 'normal' && (
                                <span className="font-mono">•</span>
                            )}
                            {dynamicPrice.urgencyLabel !== 'normal' && (
                                <span className="font-mono">-{dynamicPrice.dynamicDiscountPercent}%</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Urgency Timer */}
                <div
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${urgencyColors[dynamicPrice.urgencyLabel]} ${urgencyPulse[dynamicPrice.urgencyLabel]}`}
                >
                    <Clock className="h-3.5 w-3.5" />
                    {isExpired ? (
                        <span>Expired</span>
                    ) : (
                        <span>
                            Expires in {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
                        </span>
                    )}
                </div>

                {/* AI Price Progress Bar */}
                {!isExpired && dynamicPrice.dynamicDiscountPercent > 0 && (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[9px] font-medium text-gray-400">
                            <span className="flex items-center gap-0.5">
                                <Brain className="h-2.5 w-2.5" /> AI Pricing
                            </span>
                            <span className="font-mono">{dynamicPrice.hoursLeft.toFixed(1)}h left</span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${dynamicPrice.urgencyColor} transition-all duration-1000 ease-linear`}
                                style={{ width: `${dynamicPrice.timeRatio * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Stock */}
                <div className="flex items-center justify-between text-xs text-muted">
                    <span>{product.stock_quantity} left</span>
                </div>

                {/* Rescue Button */}
                <button
                    onClick={() => onRescue(product)}
                    disabled={isExpired || isOutOfStock}
                    className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-md shadow-green-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                    <ShoppingBag className="h-4 w-4" />
                    {isExpired ? 'Expired' : isOutOfStock ? 'Sold Out' : `Rescue • Rp${dynamicPrice.currentPrice.toLocaleString('id-ID')}`}
                </button>
            </div>
        </div>
    );
}
