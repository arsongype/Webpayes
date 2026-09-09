import { useEffect, useRef, useCallback } from 'react';

interface BalanceMessage {
  userId: string;
  balance: number;
  currency: string;
}

interface CustomEventSourceOptions extends EventSourceInit {
  headers?: Record<string, string>;
}

export function useBalanceStream(onUpdate: (balance: number, currency: string) => void) {
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    function reconnect() {
      if (typeof window === 'undefined') return;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const token = localStorage.getItem('token');
      if (!token) return;

      const es = new EventSource('/api/transactions/stream/balance', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } as CustomEventSourceOptions);

      es.addEventListener('balance', (event: MessageEvent) => {
        try {
          const data: BalanceMessage = JSON.parse(event.data);
          onUpdate(data.balance, data.currency);
        } catch {
          // ignore parse errors
        }
      });

      es.onerror = () => {
        es.close();
        setTimeout(reconnect, 3000);
      };

      eventSourceRef.current = es;
    }

    reconnect();
  }, [onUpdate]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);
}
