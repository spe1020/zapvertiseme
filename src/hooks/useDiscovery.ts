import { useState, useCallback } from 'react';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

export interface UserData {
  pubkey: string;
  metadata?: {
    name?: string;
    display_name?: string;
    about?: string;
    picture?: string;
    nip05?: string;
    lud16?: string;
    lud06?: string;
  };
  isBot: boolean;
  recentNotes: NostrEvent[];
  lastActivity?: number;
}

export interface QueryStats {
  totalEvents: number;
  uniqueAuthors: number;
  botsFiltered: number;
  realUsers: number;
  queryTime: number;
}

export function useDiscovery() {
  const { nostr } = useNostr();
  const [randomUsers, setRandomUsers] = useState<UserData[]>([]);
  const [queryStats, setQueryStats] = useState<QueryStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      // Query for recent notes (kind 1) from the last 6 hours
      const sixHoursAgo = Math.floor(Date.now() / 1000) - (6 * 60 * 60);
      
      const signal = AbortSignal.timeout(10000); // 10 second timeout
      
      // Get recent events
      const events = await nostr.query(
        [{ 
          kinds: [1], 
          limit: 500,
          since: sixHoursAgo,
        }],
        { signal }
      );

      // Group events by author
      const eventsByAuthor = new Map<string, NostrEvent[]>();
      events.forEach(event => {
        const authorEvents = eventsByAuthor.get(event.pubkey) || [];
        authorEvents.push(event);
        eventsByAuthor.set(event.pubkey, authorEvents);
      });

      // Get unique authors
      const uniqueAuthors = Array.from(eventsByAuthor.keys());

      // Randomly select up to 20 authors
      const selectedAuthors = uniqueAuthors
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);

      // Fetch metadata for selected authors
      const metadataEvents = await nostr.query(
        [{ 
          kinds: [0], 
          authors: selectedAuthors,
        }],
        { signal }
      );

      // Create a map of pubkey to metadata
      const metadataMap = new Map<string, NostrEvent>();
      metadataEvents.forEach(event => {
        const existing = metadataMap.get(event.pubkey);
        // Keep the most recent metadata event
        if (!existing || event.created_at > existing.created_at) {
          metadataMap.set(event.pubkey, event);
        }
      });

      // Build user data array with bot detection
      const userData: UserData[] = [];
      let botsFiltered = 0;

      for (const pubkey of selectedAuthors) {
        const metadataEvent = metadataMap.get(pubkey);
        let metadata;
        
        try {
          metadata = metadataEvent ? JSON.parse(metadataEvent.content) : undefined;
        } catch {
          metadata = undefined;
        }

        // Bot detection: check for "bot" in name, display_name, or about
        const isBot = detectBot(metadata);
        
        if (isBot) {
          botsFiltered++;
        }

        const recentNotes = (eventsByAuthor.get(pubkey) || [])
          .sort((a, b) => b.created_at - a.created_at)
          .slice(0, 10); // Keep last 10 notes

        const lastActivity = recentNotes.length > 0 
          ? recentNotes[0].created_at 
          : undefined;

        userData.push({
          pubkey,
          metadata,
          isBot,
          recentNotes,
          lastActivity,
        });
      }

      // Sort: real users first, then by last activity
      userData.sort((a, b) => {
        if (a.isBot !== b.isBot) {
          return a.isBot ? 1 : -1;
        }
        return (b.lastActivity || 0) - (a.lastActivity || 0);
      });

      const queryTime = Date.now() - startTime;
      
      setQueryStats({
        totalEvents: events.length,
        uniqueAuthors: uniqueAuthors.length,
        botsFiltered,
        realUsers: userData.filter(u => !u.isBot).length,
        queryTime,
      });

      setRandomUsers(userData);
    } catch (err) {
      console.error('Discovery error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, [nostr]);

  const removeUser = useCallback((pubkey: string) => {
    setRandomUsers(prev => prev.filter(u => u.pubkey !== pubkey));
  }, []);

  return {
    randomUsers,
    queryStats,
    isLoading,
    error,
    fetchRandomUsers,
    removeUser,
  };
}

function detectBot(metadata?: {
  name?: string;
  display_name?: string;
  about?: string;
  bot?: boolean;
}): boolean {
  if (!metadata) return false;

  // Check explicit bot flag
  if (metadata.bot === true) return true;

  // Check for "bot" keyword in various fields (case insensitive)
  const botKeyword = /\bbot\b/i;
  
  const fields = [
    metadata.name,
    metadata.display_name,
    metadata.about,
  ].filter(Boolean);

  return fields.some(field => botKeyword.test(field || ''));
}
