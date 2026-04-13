'use client';

import { useState } from 'react';
import { Crown, X, Check, Wand2, TrendingUp, Shield, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface PremiumUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgradeSuccess: () => void;
}

const PREMIUM_FEATURES = [
    { icon: <Wand2 className="h-5 w-5" />, title: 'AI Image Generator', description: 'Auto-generate high-quality food visuals' },
    { icon: <TrendingUp className="h-5 w-5" />, title: 'Advanced Analytics', description: 'AI-powered insights for your business' },
    { icon: <Shield className="h-5 w-5" />, title: 'Priority Support', description: 'Faster response from our team' },
    { icon: <Zap className="h-5 w-5" />, title: 'Smart Recommendations', description: 'Optimized pricing recommendations' },
];

export default function PremiumUpgradeModal({ isOpen, onClose, onUpgradeSuccess }: PremiumUpgradeModalProps) {
    const { user } = useAuth();
    const [upgrading, setUpgrading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    // Instant upgrade flow (mock payment)
    async function handleUpgrade() {
        if (!user) return;
        setUpgrading(true);
        setError(null);

        try {
            // Force-update is_premium in the database
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ is_premium: true })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                onUpgradeSuccess(); // Triggers user data refresh in parent
                onClose();
                setSuccess(false);
            }, 2000);
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setUpgrading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-amber-400 to-orange-500" />

                <button onClick={onClose} className="absolute right-4 top-4 z-10 p-2 rounded-full bg-black/10 text-white hover:bg-black/20 transition-colors">
                    <X className="h-4 w-4" />
                </button>

                <div className="relative px-6 pb-8 pt-10">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl">
                        <Crown className="h-10 w-10 text-amber-500" />
                    </div>

                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-extrabold text-gray-900">
                            Upgrade to <span className="bg-amber-500 text-white px-2 py-0.5 rounded-lg">Premium</span>
                        </h2>
                        <p className="mt-1.5 text-sm text-gray-500">Unlock AI Image Generator today</p>
                    </div>

                    {success ? (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <Check className="h-10 w-10" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-900">Success!</h3>
                                <p className="text-sm text-gray-500">Your account is now Premium</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 space-y-3">
                                {PREMIUM_FEATURES.map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                                        <div className="text-amber-500">{f.icon}</div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{f.title}</p>
                                            <p className="text-[11px] text-gray-500">{f.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {error && <p className="mb-4 text-center text-sm text-red-500 font-medium">{error}</p>}

                            <button
                                onClick={handleUpgrade}
                                disabled={upgrading}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-4 text-white font-bold shadow-lg hover:brightness-110 transition-all active:scale-95 disabled:opacity-70"
                            >
                                {upgrading ? <Loader2 className="animate-spin" /> : "Activate Premium Now"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
