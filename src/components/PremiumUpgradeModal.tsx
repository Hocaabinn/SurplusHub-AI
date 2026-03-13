'use client';

import { useState } from 'react';
import {
    Crown,
    X,
    Check,
    Sparkles,
    Wand2,
    TrendingUp,
    Shield,
    Star,
    Zap,
    Loader2,
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface PremiumUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgradeSuccess: () => void;
}

const PREMIUM_FEATURES = [
    {
        icon: <Wand2 className="h-5 w-5" />,
        title: 'AI Image Generator',
        description: 'Generate gambar makanan otomatis dengan berbagai style',
    },
    {
        icon: <TrendingUp className="h-5 w-5" />,
        title: 'Advanced Analytics',
        description: 'Analisis penjualan & insight AI untuk bisnis Anda',
    },
    {
        icon: <Shield className="h-5 w-5" />,
        title: 'Priority Support',
        description: 'Dukungan prioritas & respons lebih cepat',
    },
    {
        icon: <Zap className="h-5 w-5" />,
        title: 'Smart Recommendations',
        description: 'Rekomendasi AI untuk harga & inventory optimal',
    },
];

export default function PremiumUpgradeModal({
    isOpen,
    onClose,
    onUpgradeSuccess,
}: PremiumUpgradeModalProps) {
    const { user } = useAuth();
    const [upgrading, setUpgrading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    async function handleUpgrade() {
        if (!user) return;
        setUpgrading(true);
        setError(null);

        try {
            // Update the profile to premium
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ is_premium: true })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                onUpgradeSuccess();
                onClose();
                setSuccess(false);
            }, 2000);
        } catch (err) {
            console.error('Upgrade error:', err);
            setError('Upgrade gagal. Silakan coba lagi.');
        } finally {
            setUpgrading(false);
        }
    }

    return (
        <div
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="animate-scale-in relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
                {/* Decorative top gradient */}
                <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500" />

                {/* Decorative sparkles */}
                <div className="absolute left-6 top-4 text-2xl animate-hero-float opacity-40">✨</div>
                <div className="absolute right-10 top-8 text-lg animate-hero-float-d1 opacity-30">⭐</div>
                <div className="absolute left-20 top-14 text-sm animate-hero-float-d2 opacity-25">💫</div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/30"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="relative px-6 pb-6 pt-6">
                    {/* Crown icon */}
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/40">
                        <Crown className="h-10 w-10 text-white" />
                    </div>

                    {/* Title */}
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-extrabold text-gray-900">
                            Upgrade ke <span className="text-amber-500">Premium</span>
                        </h2>
                        <p className="mt-1.5 text-sm text-gray-500">
                            Buka semua fitur eksklusif untuk bisnis Anda
                        </p>
                    </div>

                    {success ? (
                        /* Success state */
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="relative">
                                <div className="absolute inset-0 animate-ping rounded-full bg-green-400/30" style={{ animationDuration: '1.5s', animationIterationCount: '2' }} />
                                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30">
                                    <Check className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-900">
                                    🎉 Selamat!
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Anda sekarang member Premium
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Pricing */}
                            <div className="mb-5 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm text-gray-400 line-through">Rp99.000</span>
                                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">GRATIS BETA</span>
                                </div>
                                <p className="mt-1 text-3xl font-extrabold text-gray-900">
                                    Rp0 <span className="text-sm font-medium text-gray-400">/bulan</span>
                                </p>
                                <p className="mt-1 text-xs text-amber-600 font-medium">
                                    🎁 Gratis selama periode beta!
                                </p>
                            </div>

                            {/* Features */}
                            <div className="mb-5 space-y-3">
                                {PREMIUM_FEATURES.map((feature, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                    >
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900">{feature.title}</h4>
                                            <p className="text-xs text-gray-500">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Error */}
                            {error && (
                                <p className="mb-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
                            )}

                            {/* CTA */}
                            <button
                                onClick={handleUpgrade}
                                disabled={upgrading}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                            >
                                {upgrading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Crown className="h-5 w-5" />
                                        Aktifkan Premium Sekarang
                                    </>
                                )}
                            </button>

                            <p className="mt-3 text-center text-[10px] text-gray-400">
                                Dengan mengaktifkan Premium, Anda menyetujui Terms of Service kami.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
