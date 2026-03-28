import React, { useState } from 'react';
import { Home, History, Settings, FileText, ClipboardList, Menu, X, LogOut, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { currentUser, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) return null;

  const getMenuItems = () => {
    switch (currentUser.role) {
      case 'consumer':
        return [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'history', label: 'Riwayat Transaksi', icon: History },
          { id: 'make-transaction', label: 'Buat Pesanan', icon: FileText },
          { id: 'settings', label: 'Pengaturan', icon: Settings },
        ];
      case 'admin':
        return [
          { id: 'home', label: 'Dashboard', icon: Home },
          { id: 'history', label: 'Semua Transaksi', icon: History },
          { id: 'make-work-order', label: 'Buat Work Order', icon: ClipboardList },
          { id: 'settings', label: 'Pengaturan', icon: Settings },
        ];
      case 'worker':
        return [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'history', label: 'Riwayat Pengerjaan', icon: History },
          { id: 'work-order', label: 'Work Order', icon: ClipboardList },
          { id: 'settings', label: 'Pengaturan', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center"
        >
          <img
            src="/lynx-logo.png"
            alt="LYNX Auto Detailing"
            className="h-14 w-auto object-contain mb-4"
          />
          <h2 className="font-semibold text-lg text-foreground">
            {currentUser.name}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <motion.div 
              className={cn(
                "w-2 h-2 rounded-full",
                currentUser.role === 'consumer' ? "bg-emerald-500" :
                currentUser.role === 'admin' ? "bg-primary" : "bg-amber-500"
              )}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <p className="text-sm text-muted-foreground capitalize">{currentUser.role}</p>
          </div>
        </motion.div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-primary/30"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn("w-5 h-5 relative z-10", isActive && "animate-pulse")} />
              <span className="relative z-10">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            className="w-full transition-colors hover:bg-accent hover:text-accent-foreground hover:border-primary/50"
            onClick={handleLogout}
          >
            {currentUser.role === 'consumer' ? (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <img src="/lynx-logo.png" alt="LYNX" className="h-8 w-auto object-contain" />
          <span className="font-semibold text-foreground">LYNX</span>
        </motion.div>
        <motion.div
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="hover:bg-accent"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-50 shadow-2xl"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 shadow-sm">
        <SidebarContent />
      </aside>
    </>
  );
};