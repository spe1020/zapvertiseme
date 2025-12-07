import { useSeoMeta } from '@unhead/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, Bot, Filter, RefreshCw } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { UserCard } from '@/components/discovery/UserCard';
import { QueryStats } from '@/components/discovery/QueryStats';
import { NoteFeed } from '@/components/discovery/NoteFeed';
import { useDiscovery } from '@/hooks/useDiscovery';

const Discovery = () => {
  useSeoMeta({
    title: 'Zap Discovery - Find Active Nostr Users',
    description: 'Discover active Nostr users and support them with zaps. Find real people, filter out bots, and spread Bitcoin love.',
  });

  const { user } = useCurrentUser();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const {
    randomUsers,
    queryStats,
    isLoading,
    error,
    fetchRandomUsers,
    removeUser,
  } = useDiscovery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Zap Discovery
                </h1>
                <p className="text-sm text-muted-foreground">Find and support active Nostr users</p>
              </div>
            </div>
            <LoginArea className="max-w-60" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!user ? (
          <Card className="max-w-2xl mx-auto border-dashed">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                Please log in with your Nostr account to discover and zap active users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Zap Discovery helps you find real, active Nostr users and support them with Bitcoin Lightning zaps.
                  Login to get started!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Control Panel */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Discovery Control
                    </CardTitle>
                    <CardDescription>
                      Find random active users on Nostr
                    </CardDescription>
                  </div>
                  <Button
                    onClick={fetchRandomUsers}
                    disabled={isLoading}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Find Random Users
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Query Statistics */}
            {queryStats && <QueryStats stats={queryStats} />}

            {/* Loading State */}
            {isLoading && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* User Cards */}
            {!isLoading && randomUsers.length > 0 && !selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Discovered Users ({randomUsers.length})
                  </h2>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {randomUsers.filter(u => !u.isBot).length} Real
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      {randomUsers.filter(u => u.isBot).length} Bots
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {randomUsers.map((userData) => (
                    <UserCard
                      key={userData.pubkey}
                      userData={userData}
                      onViewNotes={() => setSelectedUser(userData.pubkey)}
                      onRemove={() => removeUser(userData.pubkey)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Note Feed for Selected User */}
            {selectedUser && (
              <NoteFeed
                pubkey={selectedUser}
                onBack={() => setSelectedUser(null)}
              />
            )}

            {/* Empty State */}
            {!isLoading && randomUsers.length === 0 && !error && (
              <Card className="border-dashed">
                <CardContent className="py-16 px-8 text-center">
                  <div className="max-w-sm mx-auto space-y-4">
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Ready to Discover</h3>
                    <p className="text-muted-foreground">
                      Click "Find Random Users" to discover active Nostr users you can support with zaps.
                      We'll automatically filter out bots and show you real people.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Spread Bitcoin love across Nostr •{' '}
            <a
              href="https://shakespeare.diy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              Vibed with Shakespeare
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Discovery;
