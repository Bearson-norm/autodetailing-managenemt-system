import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Package, Clock, CheckCircle, Sparkles, Calendar, Car } from 'lucide-react';
import { motion } from 'motion/react';

interface ConsumerHomeProps {
  onNavigate: (page: string) => void;
}

export const ConsumerHome: React.FC<ConsumerHomeProps> = ({ onNavigate }) => {
  const { currentUser, transactions } = useApp();

  const myTransactions = transactions
    .filter(t => t.consumerId === currentUser?.id)
    .filter(t => t.status !== 'finished')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/40">
          <Clock className="w-3 h-3 mr-1" /> Diterima
        </Badge>;
      case 'ordered':
        return <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40">
          <Package className="w-3 h-3 mr-1" /> Dikerjakan
        </Badge>;
      case 'finished':
        return <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
          <CheckCircle className="w-3 h-3 mr-1" /> Selesai
        </Badge>;
      default:
        return null;
    }
  };

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

  if (myTransactions.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[60vh] px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-6 max-w-md">
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
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
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
              Belum Ada Pesanan
            </h2>
            <p className="text-muted-foreground mt-2">
              Anda belum memiliki pesanan aktif. Buat pesanan baru untuk memulai layanan detailing.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => onNavigate('make-transaction')}
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Buat Pesanan
            </Button>
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
      >
        <h1 className="text-3xl font-bold text-foreground">
          Pesanan Aktif
        </h1>
        <p className="text-muted-foreground mt-2">Pantau status pesanan Anda</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {myTransactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
          >
            <Card className="overflow-hidden border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold">{transaction.orderNumber}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </CardDescription>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                  >
                    {getStatusBadge(transaction.status)}
                  </motion.div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 relative">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Paket</p>
                  <p className="font-semibold text-blue-600">{getPackageName(transaction.selectedPackage)}</p>
                </div>
                
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Car className="w-3 h-3" /> Kendaraan
                  </p>
                  <p className="font-medium text-sm">
                    {transaction.carBrand} {transaction.carYear}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{transaction.carColor}</p>
                </div>
                
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Tanggal Pengerjaan</p>
                  <p className="font-medium text-sm">
                    {new Date(transaction.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};