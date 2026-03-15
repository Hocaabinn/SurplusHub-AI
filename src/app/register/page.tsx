'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Leaf,
    Mail,
    Lock,
    User,
    ArrowRight,
    AlertCircle,
    Eye,
    EyeOff,
    ShoppingBag,
    Store,
} from 'lucide-react';

type Role = 'consumer' | 'partner';

export default function RegisterPage() {
    const { signUp } = useAuth();
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<Role>('consumer');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        const { error: err, needsEmailVerification } = await signUp(email, password, fullName, role);

        if (err) {
            setError(err);
            setLoading(false);
            return;
        }

        if (needsEmailVerification) {
            router.push('/check-email');
        } else {
            router.push('/');
        }
    }

    const roles: { value: Role; label: string; desc: string; icon: React.ReactNode }[] = [
        {
            value: 'consumer',
            label: 'Consumer',
            desc: 'Browse & rescue surplus food',
            icon: <ShoppingBag className="h-5 w-5" />,
        },
        {
            value: 'partner',
            label: 'Partner',
            desc: 'List & manage your store\'s surplus',
            icon: <Store className="h-5 w-5" />,
        },
    ];

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
            {/* Background decoration */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-green-500/5 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
                <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/3 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center">
                    <img 
                        src="/favicon.png" 
                        alt="SurplusHub Logo" 
                        className="mb-4 h-14 w-14 drop-shadow-sm"
                    />
                    <h1 className="text-2xl font-bold text-gray-900">
                        Create your account
                    </h1>
                    <p className="mt-1 text-sm text-muted">
                        Join PlateRescue and start reducing food waste
                    </p>
                </div>

                {/* Form Card */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Role selector */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                I am a...
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {roles.map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setRole(r.value)}
                                        className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-center transition-all ${role === r.value
                                            ? 'border-primary bg-green-50 text-primary shadow-md shadow-green-500/10'
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${role === r.value
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-400'
                                                }`}
                                        >
                                            {r.icon}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold ${role === r.value ? 'text-primary' : 'text-gray-700'}`}>
                                                {r.label}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted">{r.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                <User className="h-4 w-4 text-muted" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                placeholder="John Doe"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                <Mail className="h-4 w-4 text-muted" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                <Lock className="h-4 w-4 text-muted" />
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Min. 6 characters"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-11 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                <Lock className="h-4 w-4 text-muted" />
                                Confirm Password
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Repeat password"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                        >
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 text-center">
                        <p className="text-sm text-muted">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="font-semibold text-primary hover:text-primary-dark transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
