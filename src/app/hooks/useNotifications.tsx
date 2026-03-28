import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  targetRole: string;
  data?: Record<string, string>;
}

function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return Promise.resolve('denied');
  if (Notification.permission === 'granted') return Promise.resolve('granted');
  if (Notification.permission === 'denied') return Promise.resolve('denied');
  return Notification.requestPermission();
}

/** Memainkan sound effect notifikasi menggunakan Web Audio API (tanpa file eksternal) */
function playNotificationSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1320, audioContext.currentTime + 0.2);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch {
  }
}

function showBrowserNotification(title: string, message: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const options: NotificationOptions = {
      body: message,
      icon: '/favicon.ico',
      tag: `autodetail-${Date.now()}`, // Prevent duplicate stacking
      requireInteraction: false,
    };
    // Mobile: vibrate saat notifikasi (Android)
    if ('vibrate' in navigator) {
      options.vibrate = [200, 100, 200];
    }
    const n = new Notification(title, options);
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // Ignore notification errors
  }
}

export function useNotifications(
  isLoggedIn: boolean,
  userRole?: string,
  onNotification?: () => void,
  onNewOrderBanner?: (title: string, message: string) => void
) {
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController | null>(null);
  const onNotificationRef = useRef(onNotification);
  const onNewOrderBannerRef = useRef(onNewOrderBanner);
  onNotificationRef.current = onNotification;
  onNewOrderBannerRef.current = onNewOrderBanner;

  const connect = useCallback(() => {
    if (!isLoggedIn || !userRole) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const url = `${API_BASE_URL}/notifications/stream`;
    fetch(url, {
      credentials: 'include',
      signal: abortRef.current.signal,
    })
      .then((res) => {
        if (!res.ok || !res.body) throw new Error('SSE connection failed');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const processStream = (): Promise<void> =>
          reader.read().then(({ done, value }) => {
            if (done) return Promise.resolve();
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const payload: NotificationPayload = JSON.parse(line.slice(6));
                  if (payload.type === 'connected') continue; // Skip, tapi tetap lanjut baca stream

                  const isNewOrderForAdmin = payload.type === 'new_order' && userRole === 'admin';

                  if (isNewOrderForAdmin) {
                    // Sound effect untuk pesanan baru
                    playNotificationSound();

                    // Banner notification (laptop & mobile)
                    onNewOrderBannerRef.current?.(payload.title, payload.message);
                  } else {
                    // Toast biasa untuk notifikasi lain
                    toast.info(payload.title, {
                      description: payload.message,
                      duration: 5000,
                    });
                  }

                  // Browser notification (muncul meski tab tidak fokus)
                  showBrowserNotification(payload.title, payload.message);

                  // Refresh data agar list ter-update
                  onNotificationRef.current?.();
                } catch {
                  // Ignore parse errors
                }
              }
            }
            return processStream();
          });

        return processStream();
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.warn('Notification stream disconnected, reconnecting...');
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      });
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    if (!isLoggedIn || !userRole) return;

    // Hanya admin dan worker yang perlu notifikasi real-time
    if (userRole !== 'admin' && userRole !== 'worker') return;

    requestNotificationPermission();
    connect();

    return () => {
      abortRef.current?.abort();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [isLoggedIn, userRole, connect]);
}
