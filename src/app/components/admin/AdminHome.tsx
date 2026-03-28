import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, Package, Sparkles, Calendar, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminHomeProps {
  onNavigate: (page: string) => void;
}

export const AdminHome: React.FC<AdminHomeProps> = ({ onNavigate }) => {
  const { transactions } = useApp();

  const receivedOrders = transactions
    .filter(t => t.status === 'received')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getPackageName = (pkg: string) => {
    switch (pkg) {
      case 'interior':
        return 'Interior Detailing';
      case 'exterior':
        return 'Eksterior Detailing';
      case 'complete':
        return 'Paket Lengkap';
      default:
        return pkg;
    }
  };

  if (receivedOrders.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[60vh] px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1 
            }}
            className="relative"
          >
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto relative">
              <motion.div
                className="absolute inset-0 bg-primary/30 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Package className="w-12 h-12 text-primary relative z-10" />
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-semibold text-foreground">
              Semua Pesanan Telah Diproses
            </h2>
            <p className="text-muted-foreground mt-2">Tidak ada pesanan baru yang perlu diproses</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard Admin
          </h1>
          <p className="text-muted-foreground mt-2">Pesanan baru yang perlu diproses</p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="px-4 py-2 bg-primary/20 rounded-full border border-primary/40"
        >
          <p className="text-sm font-semibold text-primary">
            {receivedOrders.length} Pesanan Baru
          </p>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {receivedOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
          >
            <Card className="overflow-hidden border border-border shadow-lg hover:shadow-xl hover:shadow-primary/5 transition-all">
              <motion.div 
                className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full -mr-12 -mt-12"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">{order.orderNumber}</CardTitle>
                    <CardDescription className="mt-1">{order.consumerName}</CardDescription>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40">
                      <Clock className="w-3 h-3 mr-1" /> Baru
                    </Badge>
                  </motion.div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-2 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Paket</p>
                    <p className="font-semibold text-primary">{getPackageName(order.selectedPackage)}</p>
                  </div>
                  
                  <div className="p-2 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Kendaraan</p>
                    <p className="font-medium">
                      {order.carBrand} {order.carYear} - {order.carColor}
                    </p>
                  </div>
                  
                  <div className="p-2 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Tanggal Pengerjaan
                    </p>
                    <p className="font-medium">
                      {new Date(order.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div className="p-2 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Alamat
                    </p>
                    <p className="font-medium text-xs line-clamp-2">{order.address}</p>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full mt-2 bg-primary hover:bg-primary/90 shadow-md" 
                      size="sm"
                      onClick={() => onNavigate('make-work-order')}
                    >
                      Proses
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};