import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bot, Eye, Zap, X, CheckCircle2 } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';
import { useState } from 'react';
import { DiscoveryZapDialog } from '@/components/discovery/DiscoveryZapDialog';
import type { UserData } from '@/hooks/useDiscovery';
import { nip19 } from 'nostr-tools';
import { useAuthor } from '@/hooks/useAuthor';

interface UserCardProps {
  userData: UserData;
  onViewNotes: () => void;
  onRemove: () => void;
}

export function UserCard({ userData, onViewNotes, onRemove }: UserCardProps) {
  const { pubkey, metadata: initialMetadata, isBot, recentNotes } = userData;
  const [isZapped, setIsZapped] = useState(false);

  // Fetch fresh metadata if we don't have it (similar to NoteFeed)
  const { data: authorData } = useAuthor(!initialMetadata ? pubkey : undefined);
  
  // Use fresh metadata if available, otherwise fall back to initial metadata
  const metadata = authorData?.metadata || initialMetadata;

  // Get display name (preferred display name, or name, or generated)
  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey);
  // Get username (actual name field from metadata)
  const username = metadata?.name;
  const nip05 = metadata?.nip05;
  const about = metadata?.about || '';
  const picture = metadata?.picture;
  const hasLightning = !!(metadata?.lud16 || metadata?.lud06);

  // Create a fake event object for ZapDialog (it expects an Event type)
  const fakeEvent = {
    id: pubkey,
    pubkey: pubkey,
    created_at: userData.lastActivity || Math.floor(Date.now() / 1000),
    kind: 0,
    tags: [],
    content: '',
    sig: '',
  };

  const npub = nip19.npubEncode(pubkey);

  return (
    <Card className={`relative ${isBot ? 'opacity-60 border-orange-200 dark:border-orange-800' : ''} ${isZapped ? 'border-green-500 dark:border-green-600' : ''}`}>
      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Zapped indicator */}
      {isZapped && (
        <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={picture} alt={displayName} />
            <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{displayName}</h3>
              {isBot && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  Bot
                </Badge>
              )}
            </div>
            <div className="space-y-0.5">
              {username && (
                <p className="text-sm font-medium text-foreground truncate">
                  {username}
                </p>
              )}
              {nip05 && (
                <p className="text-xs text-muted-foreground truncate font-medium">
                  {nip05}
                </p>
              )}
              {!username && !nip05 && (
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {npub.slice(0, 16)}...
                </p>
              )}
              {(username || nip05) && (
                <p className="text-xs text-muted-foreground font-mono truncate opacity-70">
                  {npub.slice(0, 16)}...
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {about && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {about}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">
            {recentNotes.length} recent note{recentNotes.length !== 1 ? 's' : ''}
          </Badge>
          {hasLightning && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Lightning
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewNotes}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Notes
        </Button>

        {hasLightning && !isBot && (
          <DiscoveryZapDialog
            target={fakeEvent}
            onZapSuccess={() => setIsZapped(true)}
          >
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Zap
            </Button>
          </DiscoveryZapDialog>
        )}
      </CardFooter>
    </Card>
  );
}
