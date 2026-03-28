import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle, History } from 'lucide-react';

export const WorkerHistory: React.FC = () => {
  const { currentUser, workOrders, transactions } = useApp();

  const myCompletedWorkOrders = workOrders
    .filter(wo => wo.workerId === currentUser?.id)
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

  if (myCompletedWorkOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <History className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold">Belum Ada Riwayat</h2>
          <p className="text-gray-500">Riwayat pengerjaan Anda akan muncul di sini</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Riwayat Pengerjaan</h1>
        <p className="text-gray-500">Semua work order yang pernah Anda kerjakan</p>
      </div>

      <div className="space-y-4">
        {myCompletedWorkOrders.map((workOrder) => {
          const transaction = transactions.find(t => t.id === workOrder.transactionId);
          if (!transaction) return null;

          return (
            <Card key={workOrder.id}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{workOrder.workOrderNumber}</CardTitle>
                    <CardDescription className="mt-1">
                      {transaction.consumerName} • {new Date(workOrder.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </CardDescription>
                  </div>
                  {workOrder.status === 'finished' && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" /> Selesai
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                    <p className="text-gray-500">Tanggal Pengerjaan</p>
                    <p className="font-medium">
                      {new Date(transaction.date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  {workOrder.documentation && Array.isArray(workOrder.documentation) && workOrder.documentation.length > 0 && (
                    <div className="md:col-span-3">
                      <p className="text-gray-500 mb-2">Dokumentasi</p>
                      <div className="flex gap-2 flex-wrap">
                        {workOrder.documentation.map((doc: any, idx: number) => {
                          const fileName = typeof doc === 'string' ? doc : (doc.fileName || `Foto ${idx + 1}`);
                          return (
                            <div key={idx} className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                              {fileName}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
