import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Megaphone, X } from 'lucide-react';

export interface BannerNotification {
  id: string;
  title: string;
  message: string;
  type: 'new_order' | 'work_order_assigned' | 'work_order_finished';
}

interface NotificationBannerContextType {
  showBanner: (notification: Omit<BannerNotification, 'id'>) => void;
}

const NotificationBannerContext = createContext<NotificationBannerContextType | null>(null);

export function useNotificationBanner() {
  const ctx = useContext(NotificationBannerContext);
  return ctx;
}

export function NotificationBannerProvider({ children }: { children: React.ReactNode }) {
  const [banner, setBanner] = useState<BannerNotification | null>(null);

  const showBanner = useCallback((notification: Omit<BannerNotification, 'id'>) => {
    const id = `banner-${Date.now()}`;
    setBanner({ ...notification, id });
    // Auto-hide setelah 8 detik
    setTimeout(() => {
      setBanner((prev) => (prev?.id === id ? null : prev));
    }, 8000);
  }, []);

  const dismiss = useCallback(() => setBanner(null), []);

  return (
    <NotificationBannerContext.Provider value={{ showBanner }}>
      {children}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -120, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[9999] px-4 pt-4 pb-2 sm:pt-4 sm:pb-4 safe-area-inset-top"
            style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
          >
            <div className="max-w-4xl mx-auto flex items-start gap-3 sm:gap-4 p-4 rounded-xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-950 via-orange-950 to-amber-950 shadow-2xl shadow-amber-500/25">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500/30 flex items-center justify-center">
                <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-500/40 text-amber-200 uppercase tracking-wider">
                    <Bell className="w-3 h-3 mr-1" /> Pesanan Baru
                  </span>
                  <button
                    onClick={dismiss}
                    className="p-1 rounded-full hover:bg-amber-500/20 text-amber-200/80 hover:text-white transition-colors"
                    aria-label="Tutup notifikasi"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-bold text-white text-sm sm:text-base mt-1">{banner.title}</p>
                <p className="text-xs sm:text-sm text-amber-100/90 mt-0.5">{banner.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NotificationBannerContext.Provider>
  );
}
