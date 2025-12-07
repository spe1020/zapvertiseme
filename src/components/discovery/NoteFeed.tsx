import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { NoteContent } from '@/components/NoteContent';
import { DiscoveryZapDialog } from '@/components/discovery/DiscoveryZapDialog';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';

interface NoteFeedProps {
  pubkey: string;
  onBack: () => void;
}

export function NoteFeed({ pubkey, onBack }: NoteFeedProps) {
  const { nostr } = useNostr();
  const { data: authorData } = useAuthor(pubkey);

  const { data: notes, isLoading } = useQuery<NostrEvent[]>({
    queryKey: ['user-notes', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      const events = await nostr.query(
        [{ kinds: [1], authors: [pubkey], limit: 20 }],
        { signal }
      );
      return events.sort((a, b) => b.created_at - a.created_at);
    },
  });

  const metadata = authorData?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey);
  const picture = metadata?.picture;
  const hasLightning = !!(metadata?.lud16 || metadata?.lud06);
  const npub = nip19.npubEncode(pubkey);

  // Create a fake event for the zap dialog (targeting the user's profile)
  const fakeEvent = {
    id: pubkey,
    pubkey: pubkey,
    created_at: Math.floor(Date.now() / 1000),
    kind: 0,
    tags: [],
    content: '',
    sig: '',
  };

  return (
    <div className="space-y-4">
      {/* Header with user info */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="mt-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Avatar className="h-16 w-16">
              <AvatarImage src={picture} alt={displayName} />
              <AvatarFallback className="text-xl">{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
              <p className="text-sm text-muted-foreground font-mono mb-2 truncate">
                {npub}
              </p>
              {metadata?.about && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {metadata.about}
                </p>
              )}
            </div>

            {hasLightning && (
              <DiscoveryZapDialog target={fakeEvent}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Zap User
                </Button>
              </DiscoveryZapDialog>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Notes feed */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Notes</h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/6" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} author={authorData} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No recent notes found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface NoteCardProps {
  note: NostrEvent;
  author?: {
    pubkey: string;
    metadata?: {
      name?: string;
      display_name?: string;
      picture?: string;
      lud16?: string;
      lud06?: string;
    };
  };
}

function NoteCard({ note, author }: NoteCardProps) {
  const metadata = author?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(note.pubkey);
  const picture = metadata?.picture;
  const hasLightning = !!(metadata?.lud16 || metadata?.lud06);

  const timeAgo = getTimeAgo(note.created_at);

  // Convert NostrEvent to the Event type expected by ZapDialog
  const eventForZap = {
    id: note.id,
    pubkey: note.pubkey,
    created_at: note.created_at,
    kind: note.kind,
    tags: note.tags,
    content: note.content,
    sig: note.sig,
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={picture} alt={displayName} />
              <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{displayName}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </div>
            </div>
          </div>
          {hasLightning && (
            <DiscoveryZapDialog target={eventForZap}>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-purple-50 dark:hover:bg-purple-950/20"
              >
                <Zap className="h-4 w-4 mr-1" />
                Zap
              </Button>
            </DiscoveryZapDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap break-words text-sm">
          <NoteContent event={eventForZap} />
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}
