import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, Package, CheckCircle, History } from 'lucide-react';

export const ConsumerHistory: React.FC = () => {
  const { currentUser, transactions } = useApp();

  const myTransactions = transactions
    .filter(t => t.consumerId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" /> Diterima
        </Badge>;
      case 'ordered':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Package className="w-3 h-3 mr-1" /> Dikerjakan
        </Badge>;
      case 'finished':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <History className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold">Belum Ada Riwayat</h2>
          <p className="text-gray-500">Riwayat pesanan Anda akan muncul di sini</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Riwayat Transaksi</h1>
        <p className="text-gray-500">Semua pesanan yang pernah Anda buat</p>
      </div>

      <div className="space-y-4">
        {myTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{transaction.orderNumber}</CardTitle>
                  <CardDescription className="mt-1">
                    {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </div>
                {getStatusBadge(transaction.status)}
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
                <div className="md:col-span-3">
                  <p className="text-gray-500">Alamat</p>
                  <p className="font-medium">{transaction.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
