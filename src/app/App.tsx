import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { NotificationBannerProvider, useNotificationBanner } from './context/NotificationBannerContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from './hooks/useNotifications';
import { useWebPush } from './hooks/useWebPush';

// Consumer Components
import { ConsumerHome } from './components/consumer/ConsumerHome';
import { ConsumerHistory } from './components/consumer/ConsumerHistory';
import { ConsumerSettings } from './components/consumer/ConsumerSettings';
import { MakeTransaction } from './components/consumer/MakeTransaction';

// Admin Components
import { AdminHome } from './components/admin/AdminHome';
import { AdminHistory } from './components/admin/AdminHistory';
import { AdminSettings } from './components/admin/AdminSettings';
import { MakeWorkOrder } from './components/admin/MakeWorkOrder';

// Worker Components
import { WorkerHome } from './components/worker/WorkerHome';
import { WorkerHistory } from './components/worker/WorkerHistory';
import { WorkerSettings } from './components/worker/WorkerSettings';
import { WorkOrder } from './components/worker/WorkOrder';

const MainApp: React.FC = () => {
  const { currentUser, isInitializing, refreshData } = useApp();
  const { showBanner } = useNotificationBanner() ?? {};
  const [currentPage, setCurrentPage] = useState('home');

  const handleNewOrderBanner = React.useCallback(
    (title: string, message: string) => {
      showBanner?.({ title, message, type: 'new_order' });
    },
    [showBanner]
  );

  // Notifikasi real-time: pesanan baru, work order assigned, work order selesai
  useNotifications(!!currentUser, currentUser?.role, refreshData, handleNewOrderBanner);
  // Web Push (notifikasi sistem saat tab tertutup) — admin & worker
  useWebPush(!!currentUser, currentUser?.role);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src="/lynx-logo.png" alt="LYNX" className="h-8 w-auto opacity-80 animate-pulse" />
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderPage = () => {
    // Consumer Pages
    if (currentUser.role === 'consumer') {
      switch (currentPage) {
        case 'home':
          return <ConsumerHome onNavigate={setCurrentPage} />;
        case 'history':
          return <ConsumerHistory />;
        case 'make-transaction':
          return <MakeTransaction onNavigate={setCurrentPage} />;
        case 'settings':
          return <ConsumerSettings />;
        default:
          return <ConsumerHome onNavigate={setCurrentPage} />;
      }
    }

    // Admin Pages
    if (currentUser.role === 'admin') {
      switch (currentPage) {
        case 'home':
          return <AdminHome onNavigate={setCurrentPage} />;
        case 'history':
          return <AdminHistory />;
        case 'make-work-order':
          return <MakeWorkOrder onNavigate={setCurrentPage} />;
        case 'settings':
          return <AdminSettings />;
        default:
          return <AdminHome onNavigate={setCurrentPage} />;
      }
    }

    // Worker Pages
    if (currentUser.role === 'worker') {
      switch (currentPage) {
        case 'home':
          return <WorkerHome onNavigate={setCurrentPage} />;
        case 'history':
          return <WorkerHistory />;
        case 'work-order':
          return <WorkOrder onNavigate={setCurrentPage} />;
        case 'settings':
          return <WorkerSettings />;
        default:
          return <WorkerHome onNavigate={setCurrentPage} />;
      }
    }

    return null;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="flex-1 lg:ml-0 relative min-h-screen">
        {/* Logo watermark - lebar memenuhi main */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src="/lynx-logo.png"
            alt=""
            className="min-w-full w-full h-auto object-contain object-center opacity-[0.08]"
            aria-hidden
          />
        </div>
        <div className="pt-16 lg:pt-0 p-6 max-w-7xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <NotificationBannerProvider>
        <MainApp />
        <Toaster position="top-center" richColors theme="dark" />
      </NotificationBannerProvider>
    </AppProvider>
  );
}