'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Leaf } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'consumer' | 'partner';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!loading && user && requiredRole && profile && profile.role !== requiredRole) {
            router.push('/');
        }
    }, [user, profile, loading, requiredRole, router]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-green-500/20">
                    <Leaf className="h-7 w-7 animate-pulse text-white" />
                </div>
                <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-full w-1/2 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary to-primary-light" />
                </div>
            </div>
        );
    }

    if (!user) return null;
    if (requiredRole && profile?.role !== requiredRole) return null;

    return <>{children}</>;
}
