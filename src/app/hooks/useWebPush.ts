import { useEffect, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Daftarkan Web Push untuk admin & worker (notifikasi saat tab tertutup / HP terkunci).
 */
export function useWebPush(isLoggedIn: boolean, userRole?: string) {
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || !userRole) {
      attemptedRef.current = false;
      return;
    }
    if (userRole !== 'admin' && userRole !== 'worker') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (attemptedRef.current) return;
      attemptedRef.current = true;

      try {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted' || cancelled) {
          attemptedRef.current = false;
          return;
        }

        const reg = await navigator.serviceWorker.register('/push-sw.js', { scope: '/' });
        await navigator.serviceWorker.ready;

        const keyRes = await fetch(`${API_BASE_URL}/push/vapid-public-key`, {
          credentials: 'include',
        });
        if (!keyRes.ok) {
          attemptedRef.current = false;
          return;
        }
        const { publicKey } = (await keyRes.json()) as { publicKey: string };
        if (!publicKey || cancelled) return;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        await fetch(`${API_BASE_URL}/push/subscribe`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub.toJSON() }),
        });
      } catch {
        attemptedRef.current = false;
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, userRole]);
}
