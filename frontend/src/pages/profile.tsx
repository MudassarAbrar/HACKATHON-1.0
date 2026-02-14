import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Mail, User as UserIcon, Calendar } from 'lucide-react';

export default function Profile() {
    const { user, loading } = useAuth();
    const [, setLocation] = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        setLocation('/login');
        return null;
    }

    const formattedDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Unknown';

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">My Profile</h1>
                <p className="text-muted-foreground">Manage your account information</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Overview Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="text-2xl">
                                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="text-2xl font-semibold">{user.name || 'User'}</h3>
                                <p className="text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid gap-4 pt-4 border-t">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                    <UserIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium">{user.name || 'Not set'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Member Since</p>
                                    <p className="font-medium">{formattedDate}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Shopping Preferences Card (Placeholder) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shopping Preferences</CardTitle>
                        <CardDescription>Your style and preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Profile customization coming soon! You'll be able to set your style preferences,
                            favorite colors, and budget ranges to get personalized recommendations.
                        </p>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setLocation('/')}
                    >
                        Back to Home
                    </Button>
                    <Button
                        variant="outline"
                        disabled
                    >
                        Edit Profile (Coming Soon)
                    </Button>
                </div>
            </div>
        </div>
    );
}
