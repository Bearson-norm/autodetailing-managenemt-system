import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Package, ClipboardList } from 'lucide-react';

interface WorkerHomeProps {
  onNavigate: (page: string) => void;
}

export const WorkerHome: React.FC<WorkerHomeProps> = ({ onNavigate }) => {
  const { currentUser, workOrders, transactions } = useApp();

  const myWorkOrders = workOrders
    .filter(wo => wo.workerId === currentUser?.id && wo.status === 'assigned')
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

  if (myWorkOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <ClipboardList className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold">Belum Ada Work Order</h2>
          <p className="text-gray-500">Work order yang di-assign ke Anda akan muncul di sini</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Work Order Aktif</h1>
        <p className="text-gray-500">Pesanan yang di-assign ke Anda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myWorkOrders.map((workOrder) => {
          const transaction = transactions.find(t => t.id === workOrder.transactionId);
          if (!transaction) return null;

          return (
            <Card key={workOrder.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{workOrder.workOrderNumber}</CardTitle>
                    <CardDescription className="mt-1">
                      {transaction.orderNumber}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Package className="w-3 h-3 mr-1" /> Aktif
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Pelanggan</p>
                    <p className="font-medium">{transaction.consumerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Paket</p>
                    <p className="font-medium">{getPackageName(transaction.selectedPackage)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Kendaraan</p>
                    <p className="font-medium">
                      {transaction.carBrand} {transaction.carYear}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tanggal</p>
                    <p className="font-medium">
                      {new Date(transaction.date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <Button 
                    className="w-full mt-2" 
                    size="sm"
                    onClick={() => onNavigate('work-order')}
                  >
                    Lihat Detail
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
