import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores';
import { queryKeys } from '@/lib/queryKeys';
import type { Notification } from '@/services/notificationService';

function getWsUrl(): string {
  const apiBase =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';

  if (apiBase.startsWith('http')) {
    // Strip everything from /api onwards to get the server origin
    const origin = apiBase.replace(/\/api.*$/, '');
    return origin.replace(/^http/, 'ws') + '/ws';
  }

  // Relative path — build from current origin
  const origin = window.location.origin.replace(/^http/, 'ws');
  return `${origin}/ws`;
}

const TOAST_BURST_WINDOW_MS = 3_000;
const TOAST_BURST_THRESHOLD = 2;

export function useNotificationSocket() {
  const qc = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Toast burst de-dup state — lives outside the effect so it persists across re-renders
  const burstCountRef = useRef(0);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    let ws: WebSocket | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 3_000;
    let unmounted = false;

    const showToast = (notification: Notification) => {
      burstCountRef.current += 1;

      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);

      if (burstCountRef.current > TOAST_BURST_THRESHOLD) {
        // Grouped toast — will be shown when burst window expires
        burstTimerRef.current = setTimeout(() => {
          toast.info(`${burstCountRef.current} new notifications`);
          burstCountRef.current = 0;
        }, TOAST_BURST_WINDOW_MS);
        return;
      }

      burstTimerRef.current = setTimeout(() => {
        burstCountRef.current = 0;
      }, TOAST_BURST_WINDOW_MS);

      toast.info(notification.title, {
        description: notification.body ?? undefined,
        duration: 4_000,
      });
    };

    const connect = () => {
      if (unmounted) return;

      try {
        ws = new WebSocket(getWsUrl());
      } catch {
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
            // Re-sync list in case notifications arrived while disconnected
            qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
          } else if (msg.type === 'NOTIFICATION') {
            qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
            showToast(msg.data as Notification);
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
        ws?.close();
      };
    };

    connect();

    return () => {
      unmounted = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [isAuthenticated, accessToken, qc]);
}
