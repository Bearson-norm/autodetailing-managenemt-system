import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import type { Transaction } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, Package, CheckCircle, History, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export const AdminHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await api.getTransactionsPaginated(page, ITEMS_PER_PAGE);
        setTransactions(res.transactions);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [page]);

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

  const getPageNumbers = (): number[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500">Memuat transaksi...</p>
        </div>
      </div>
    );
  }

  if (!loading && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <History className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold">Belum Ada Transaksi</h2>
          <p className="text-gray-500">Semua transaksi akan muncul di sini</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Semua Transaksi</h1>
        <p className="text-gray-500">Riwayat lengkap semua pesanan</p>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{transaction.orderNumber}</CardTitle>
                  <CardDescription className="mt-1">
                    {transaction.consumerName} • {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
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
                <div>
                  <p className="text-gray-500">WhatsApp</p>
                  <p className="font-medium">{transaction.whatsapp}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500">Alamat</p>
                  <p className="font-medium">{transaction.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tombol Pagination - selalu tampil jika ada transaksi */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
        <p className="text-sm text-muted-foreground">
          Menampilkan {((page - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(page * ITEMS_PER_PAGE, total)} dari {total} transaksi
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </Button>
          <div className="flex items-center gap-1">
            {getPageNumbers().map((p) => (
              <Button
                key={p}
                variant={page === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(p)}
                className="min-w-[2.25rem]"
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="gap-1"
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
