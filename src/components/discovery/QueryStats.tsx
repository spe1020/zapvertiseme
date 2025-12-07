import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, Bot, CheckCircle2, Clock } from 'lucide-react';
import type { QueryStats as QueryStatsType } from '@/hooks/useDiscovery';

interface QueryStatsProps {
  stats: QueryStatsType;
}

export function QueryStats({ stats }: QueryStatsProps) {
  const { totalEvents, uniqueAuthors, botsFiltered, realUsers, queryTime } = stats;

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalEvents.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Events</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{uniqueAuthors.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Authors</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Bot className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{botsFiltered.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Bots Filtered</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{realUsers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Real Users</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(queryTime / 1000).toFixed(2)}s</p>
              <p className="text-xs text-muted-foreground">Query Time</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
