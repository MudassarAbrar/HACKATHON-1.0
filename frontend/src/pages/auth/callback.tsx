import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
    const [, setLocation] = useLocation();
    const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');

    useEffect(() => {
        let mounted = true;

        const createUserProfile = async (userId: string, email: string, name?: string) => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const response = await fetch(`${apiUrl}/api/user/profile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        email,
                        name: name || email.split('@')[0],
                    }),
                });

                if (response.ok) {
                    console.log('✅ Profile created/updated for:', email);
                    return true;
                } else {
                    console.warn('⚠️ Profile creation failed:', response.status);
                    return false;
                }
            } catch (error) {
                console.error('❌ Error creating profile:', error);
                return false;
            }
        };

        const handleCallback = async () => {
            try {
                // Wait a moment for Supabase to process the OAuth callback automatically
                await new Promise(resolve => setTimeout(resolve, 500));

                // Check if we now have a session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (!mounted) return;

                if (error || !session) {
                    console.error('No session after OAuth callback:', error);
                    setStatus('error');
                    setTimeout(() => setLocation('/login'), 2000);
                    return;
                }

                console.log('✅ Session established for:', session.user.email);

                // Create user profile
                await createUserProfile(
                    session.user.id,
                    session.user.email!,
                    session.user.user_metadata?.full_name || session.user.user_metadata?.name
                );

                // Redirect to home
                setStatus('success');
                setTimeout(() => {
                    if (mounted) setLocation('/');
                }, 1000);

            } catch (error) {
                console.error('Callback error:', error);
                if (mounted) {
                    setStatus('error');
                    setTimeout(() => setLocation('/login'), 2000);
                }
            }
        };

        handleCallback();

        return () => {
            mounted = false;
        };
    }, [setLocation]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
            <div className="text-center space-y-4">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
                        <p className="text-lg text-muted-foreground">Completing sign in...</p>
                        <p className="text-sm text-muted-foreground/60">Please wait a moment</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="text-destructive text-6xl">⚠</div>
                        <p className="text-lg text-muted-foreground">Authentication failed</p>
                        <p className="text-sm text-muted-foreground/60">Redirecting to login...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="text-green-500 text-6xl">✓</div>
                        <p className="text-lg text-muted-foreground">Sign in successful!</p>
                        <p className="text-sm text-muted-foreground/60">Redirecting...</p>
                    </>
                )}
            </div>
        </div>
    );
}
