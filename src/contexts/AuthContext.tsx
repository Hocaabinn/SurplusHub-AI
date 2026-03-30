'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/app/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/types';

interface SignUpResult {
    error: string | null;
    needsEmailVerification: boolean;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string, fullName: string, role: 'consumer' | 'partner') => Promise<SignUpResult>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (!error && data) {
            setProfile(data as Profile);
        } else if (error) {
            // Profile might not exist yet (pre-email-verification).
            // Try to create it from user metadata as a fallback.
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            const meta = currentUser?.user_metadata;
            if (meta?.full_name && meta?.role) {
                const { data: newProfile, error: insertErr } = await supabase
                    .from('profiles')
                    .upsert({
                        id: userId,
                        full_name: meta.full_name,
                        role: meta.role,
                    }, { onConflict: 'id' })
                    .select()
                    .single();

                if (!insertErr && newProfile) {
                    setProfile(newProfile as Profile);
                } else {
                    console.warn('Profile fetch/create failed:', insertErr?.message || error.message);
                }
            }
        }
    }, []);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            setUser(s?.user ?? null);
            if (s?.user) {
                fetchProfile(s.user.id);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, s) => {
                setSession(s);
                setUser(s?.user ?? null);
                if (s?.user) {
                    fetchProfile(s.user.id);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    async function signIn(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
    }

    async function signUp(
        email: string,
        password: string,
        fullName: string,
        role: 'consumer' | 'partner'
    ): Promise<SignUpResult> {
        try {
            // 1. Create auth user — store profile data in user_metadata so it
            //    survives even if the profile insert fails (e.g. RLS before
            //    email verification).
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role,
                    },
                },
            });

            if (authError) {
                console.error('[signUp] Auth error:', authError);

                // Handle rate limit error with a friendly message
                if (
                    authError.message?.toLowerCase().includes('rate limit') ||
                    authError.status === 429
                ) {
                    return {
                        error: 'Too many sign-up attempts. Please wait a few minutes before trying again.',
                        needsEmailVerification: false,
                    };
                }

                return { error: authError.message, needsEmailVerification: false };
            }

            if (!data.user) {
                return { error: 'Failed to create account.', needsEmailVerification: false };
            }

            // Supabase returns a user with no identities when the email is
            // already registered (to prevent email enumeration).
            if (
                data.user.identities &&
                data.user.identities.length === 0
            ) {
                return {
                    error: 'An account with this email already exists. Please sign in instead.',
                    needsEmailVerification: false,
                };
            }

            // 2. Check if we got a real session — if not, email confirmation is
            //    required and the profile insert will likely be blocked by RLS.
            const hasSession = !!data.session;

            // 3. Attempt to insert the profile row. This may fail when email
            //    confirmation is enabled because auth.uid() is null in RLS.
            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                full_name: fullName,
                role,
            });

            if (profileError) {
                console.error('[signUp] Profile insert error:', JSON.stringify(profileError, null, 2));

                // If we have no session (email not confirmed yet), the insert
                // failure is expected — the profile will be created on first
                // login via fetchProfile's upsert fallback.
                if (!hasSession) {
                    return { error: null, needsEmailVerification: true };
                }

                // If we DO have a session but insert still failed, that's a real
                // problem (schema mismatch, RLS misconfiguration, etc.).
                return {
                    error: `Account created but profile setup failed: ${profileError.message || profileError.code || 'Unknown error'}. Please try logging in — your profile will be set up automatically.`,
                    needsEmailVerification: false,
                };
            }

            // 4. Everything succeeded
            if (!hasSession) {
                return { error: null, needsEmailVerification: true };
            }

            return { error: null, needsEmailVerification: false };
        } catch (err) {
            console.error('[signUp] Unexpected error:', err);
            return {
                error: 'An unexpected error occurred. Please try again later.',
                needsEmailVerification: false,
            };
        }
    }

    async function signOut() {
        await supabase.auth.signOut();
        setProfile(null);
    }

    return (
        <AuthContext.Provider
            value={{ user, profile, session, loading, signIn, signUp, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
