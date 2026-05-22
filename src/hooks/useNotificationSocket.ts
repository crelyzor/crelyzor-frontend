import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores';
import { queryKeys } from '@/lib/queryKeys';

function getWsUrl(): string {
  const apiBase =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';

  if (apiBase.startsWith('http')) {
    return apiBase.replace(/^http/, 'ws').replace(/\/api\/?$/, '') + '/ws';
  }

  // Relative path — build from current origin
  const origin = window.location.origin.replace(/^http/, 'ws');
  return `${origin}/ws`;
}

export function useNotificationSocket() {
  const qc = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    let ws: WebSocket | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 3_000;
    let unmounted = false;

    const connect = () => {
      if (unmounted) return;

      try {
        ws = new WebSocket(getWsUrl());
      } catch {
        // WebSocket constructor can throw if URL is invalid — bail out
        return;
      }

      ws.onopen = () => {
        retryDelay = 3_000;
        ws!.send(JSON.stringify({ type: 'AUTH', token: accessToken }));
      };

      ws.onmessage = (event: MessageEvent<string>) => {
        try {
          const msg = JSON.parse(event.data) as Record<string, unknown>;

          if (msg.type === 'CONNECTED') {
            const unreadCount = msg.unreadCount as number;
            qc.setQueryData(queryKeys.notifications.unreadCount(), unreadCount);
          } else if (msg.type === 'NOTIFICATION') {
            qc.invalidateQueries({
              queryKey: queryKeys.notifications.all,
            });
            const data = msg.data as Record<string, unknown>;
            toast.info(data.title as string, {
              description: (data.body as string | null) ?? undefined,
              duration: 4_000,
            });
          } else if (msg.type === 'PING') {
            ws!.send(JSON.stringify({ type: 'PONG' }));
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (unmounted) return;
        retryTimeout = setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, 60_000);
          connect();
        }, retryDelay);
      };

      ws.onerror = () => {
        // onclose fires after onerror — let it handle the reconnect
        ws?.close();
      };
    };

    connect();

    return () => {
      unmounted = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      if (ws) {
        ws.onclose = null; // suppress reconnect on intentional close
        ws.close();
      }
    };
  }, [isAuthenticated, accessToken, qc]);
}
