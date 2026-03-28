import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { Clock, CheckCircle2 } from 'lucide-react';

interface MakeWorkOrderProps {
  onNavigate: (page: string) => void;
}

export const MakeWorkOrder: React.FC<MakeWorkOrderProps> = ({ onNavigate }) => {
  const { transactions, users, workOrders, addWorkOrder } = useApp();
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const transactionIdsWithWorkOrders = new Set(workOrders.map(wo => wo.transactionId));
  const receivedOrders = transactions.filter(
    t => t.status === 'received' && !transactionIdsWithWorkOrders.has(t.id)
  );
  const workers = users.filter(u => u.role === 'worker');

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

  const handleProcessOrder = (transactionId: string) => {
    setSelectedTransaction(transactionId);
    setSelectedWorker('');
    setDialogOpen(true);
  };

  const handleSubmitWorkOrder = async () => {
    if (!selectedTransaction || !selectedWorker) {
      toast.error('Pilih worker terlebih dahulu');
      return;
    }

    try {
      const workOrderNumber = await addWorkOrder(selectedTransaction, selectedWorker);
      toast.success(`Work Order berhasil dibuat! Nomor: ${workOrderNumber}`);
      
      setDialogOpen(false);
      setSelectedTransaction(null);
      setSelectedWorker('');
    } catch (error: any) {
      toast.error(error.message || 'Gagal membuat work order');
    }
  };

  const transaction = selectedTransaction 
    ? transactions.find(t => t.id === selectedTransaction) 
    : null;

  if (receivedOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Tidak Ada Pesanan</h2>
          <p className="text-muted-foreground">Semua pesanan telah diproses</p>
          <Button onClick={() => onNavigate('home')}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Buat Work Order</h1>
        <p className="text-gray-500">Assign worker ke pesanan yang masuk</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {receivedOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{order.orderNumber}</CardTitle>
                  <CardDescription className="mt-1">{order.consumerName}</CardDescription>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Clock className="w-3 h-3 mr-1" /> Baru
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Paket</p>
                  <p className="font-medium">{getPackageName(order.selectedPackage)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Kendaraan</p>
                  <p className="font-medium">
                    {order.carBrand} {order.carYear}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Tanggal</p>
                  <p className="font-medium">
                    {new Date(order.date).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <Button 
                  className="w-full mt-2" 
                  size="sm"
                  onClick={() => handleProcessOrder(order.id)}
                >
                  Process Order
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog for creating work order */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buat Work Order</DialogTitle>
            <DialogDescription>
              Assign worker untuk pesanan ini
            </DialogDescription>
          </DialogHeader>

          {transaction && (
            <div className="space-y-6 py-4">
              {/* Transaction Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Detail Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500">Nomor Pesanan</p>
                      <p className="font-medium">{transaction.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pelanggan</p>
                      <p className="font-medium">{transaction.consumerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">WhatsApp</p>
                      <p className="font-medium">{transaction.whatsapp}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tanggal Pengerjaan</p>
                      <p className="font-medium">
                        {new Date(transaction.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Alamat</p>
                    <p className="font-medium">{transaction.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500">Kendaraan</p>
                      <p className="font-medium">
                        {transaction.carBrand} {transaction.carYear}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Warna</p>
                      <p className="font-medium">{transaction.carColor}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Paket</p>
                      <p className="font-medium">{getPackageName(transaction.selectedPackage)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Jok</p>
                      <p className="font-medium">
                        {transaction.currentSeat} {transaction.hasStain ? '(Ada Noda)' : ''}
                      </p>
                    </div>
                  </div>

                  {transaction.specialComplaints && (
                    <div>
                      <p className="text-gray-500">Keluhan Khusus</p>
                      <p className="font-medium">{transaction.specialComplaints}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Worker Selection */}
              <div className="space-y-2">
                <Label>Pilih Worker</Label>
                <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih worker yang tersedia" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Batal
                </Button>
                <Button onClick={handleSubmitWorkOrder} className="flex-1">
                  Submit Work Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
