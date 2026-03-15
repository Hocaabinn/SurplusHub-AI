'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf, Menu, X, Store, ShoppingBag, LogIn, LogOut, UserCircle, ScanBarcode, Crown, BarChart3, Clock } from 'lucide-react';

export default function Navbar() {
    const { user, profile, loading, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    async function handleSignOut() {
        await signOut();
        setMobileMenuOpen(false);
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl shadow-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href={profile?.role === 'partner' ? '/merchant' : '/'} className="flex items-center gap-2 group">
                    <img 
                        src="/favicon.png" 
                        alt="SurplusHub Logo" 
                        className="h-8 w-8 transition-transform group-hover:scale-105"
                    />
                    <span className="text-xl font-bold tracking-tight text-gray-900">
                        Surplus<span className="text-primary">Hub</span>
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden items-center gap-1 md:flex">
                    {loading ? (
                        <div className="flex gap-2">
                            <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-100" />
                            <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-100" />
                        </div>
                    ) : profile?.role === 'partner' ? (
                        /* Partner Links */
                        <>
                            <Link
                                href="/merchant"
                                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary"
                            >
                                <Store className="h-4 w-4" />
                                Merchant Panel
                            </Link>
                            <Link
                                href="/partner/history"
                                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary"
                            >
                                <Clock className="h-4 w-4" />
                                History
                            </Link>
                        </>
                    ) : (
                        /* Regular / Consumer Links */
                        <>
                            <Link
                                href="/"
                                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                Marketplace
                            </Link>
                            {profile?.role === 'consumer' && (
                                <Link
                                    href="/history"
                                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary"
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    Riwayat
                                </Link>
                            )}
                        </>
                    )}

                    <div className="ml-2 h-6 w-px bg-gray-200" />

                    {loading ? (
                        <div className="ml-2 h-8 w-20 animate-pulse rounded-lg bg-gray-100" />
                    ) : user ? (
                        <div className="ml-2 flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-1.5">
                                <UserCircle className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-gray-700">
                                    {profile?.full_name || user?.email || 'User'}
                                </span>
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold capitalize text-primary">
                                    {profile?.role || '...'}
                                </span>
                                {profile?.is_premium && (
                                    <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                        <Crown className="h-2.5 w-2.5" />
                                        PRO
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="ml-2 flex items-center gap-2">
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary"
                            >
                                <LogIn className="h-4 w-4" />
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-50 md:hidden"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="animate-fade-in border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
                    {loading ? (
                        <div className="my-2 space-y-2">
                            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100" />
                            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100" />
                        </div>
                    ) : profile?.role === 'partner' ? (
                        /* Partner Mobile Links */
                        <>
                            <Link
                                href="/merchant"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
                            >
                                <Store className="h-4 w-4" />
                                Merchant Panel
                            </Link>
                            <Link
                                href="/partner/history"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
                            >
                                <Clock className="h-4 w-4" />
                                History
                            </Link>
                        </>
                    ) : (
                        /* Regular / Consumer Mobile Links */
                        <>
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                Marketplace
                            </Link>
                            {profile?.role === 'consumer' && (
                                <Link
                                    href="/history"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    Riwayat
                                </Link>
                            )}
                        </>
                    )}

                    <div className="my-2 h-px bg-gray-100" />

                    {loading ? (
                        <div className="mx-3 h-10 animate-pulse rounded-lg bg-gray-100" />
                    ) : user ? (
                        <>
                            <div className="flex items-center gap-2 px-3 py-2">
                                <UserCircle className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium text-gray-700">
                                    {profile?.full_name || user?.email || 'User'}
                                </span>
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold capitalize text-primary">
                                    {profile?.role}
                                </span>
                                {profile?.is_premium && (
                                    <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                        <Crown className="h-2.5 w-2.5" />
                                        PRO
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary"
                            >
                                <LogIn className="h-4 w-4" />
                                Login
                            </Link>
                            <Link
                                href="/register"
                                onClick={() => setMobileMenuOpen(false)}
                                className="mx-3 mt-1 flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
                            >
                                Create Account
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
