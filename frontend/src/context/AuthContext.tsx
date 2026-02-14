import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (provider: 'google') => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile from our database
    const fetchUserProfile = async (authUser: SupabaseUser): Promise<User | null> => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            // Backend route is /api/user/profile/:userId (not /api/user-profile)
            const response = await fetch(`${apiUrl}/api/user/profile/${authUser.id}`);
            if (!response.ok) {
                console.error('Failed to fetch user profile:', response.status, response.statusText);
                // If 404, profile doesn't exist yet - this is okay, it will be created
                if (response.status === 404) {
                    console.log('Profile not found, will be created on first use');
                    return null;
                }
                throw new Error('Failed to fetch user profile');
            }
            const data = await response.json();
            console.log('User profile fetched successfully:', data.data?.email);
            return data.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    };

    // Initialize session and user
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user).then(setUser);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session?.user) {
                const profile = await fetchUserProfile(session.user);
                setUser(profile);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (provider: 'google') => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
        setSession(null);
    };

    const refreshUser = async () => {
        if (session?.user) {
            const profile = await fetchUserProfile(session.user);
            setUser(profile);
        }
    };

    const value = {
        user,
        session,
        loading,
        signIn,
        signOut,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
