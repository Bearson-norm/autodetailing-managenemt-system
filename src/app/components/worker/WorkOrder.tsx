import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { Package, Upload, CheckCircle2 } from 'lucide-react';

interface WorkOrderProps {
  onNavigate: (page: string) => void;
}

export const WorkOrder: React.FC<WorkOrderProps> = ({ onNavigate }) => {
  const { currentUser, workOrders, transactions, finishWorkOrder, updateWorkOrder } = useApp();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const myWorkOrders = workOrders
    .filter(wo => wo.workerId === currentUser?.id && wo.status === 'assigned')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleOpenDetail = (workOrderId: string) => {
    setSelectedWorkOrder(workOrderId);
    setUploadedFiles([]);
    setDialogOpen(true);
  };

  const getExistingDocs = () => {
    if (!selectedWorkOrder) return [];
    const workOrder = workOrders.find(wo => wo.id === selectedWorkOrder);
    if (!workOrder?.documentation) return [];
    
    // Handle both string[] and WorkOrderDoc[] formats
    if (Array.isArray(workOrder.documentation) && workOrder.documentation.length > 0) {
      if (typeof workOrder.documentation[0] === 'string') {
        return workOrder.documentation as string[];
      }
      return (workOrder.documentation as any[]).map((doc: any) => doc.fileName || doc);
    }
    return [];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && selectedWorkOrder) {
      const newFiles = Array.from(files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      
      setIsUploading(true);
      try {
        await updateWorkOrder(selectedWorkOrder, newFiles);
        toast.success('File berhasil diupload!');
      } catch (error: any) {
        toast.error(error.message || 'Gagal upload file');
        // Remove files that failed to upload
        setUploadedFiles(uploadedFiles);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFinish = async () => {
    if (!selectedWorkOrder) return;

    const workOrder = workOrders.find(wo => wo.id === selectedWorkOrder);
    const hasDocs = workOrder?.documentation && 
      (Array.isArray(workOrder.documentation) ? workOrder.documentation.length > 0 : true);

    if (!hasDocs) {
      toast.error('Upload minimal 1 dokumentasi sebelum menyelesaikan');
      return;
    }

    try {
      await finishWorkOrder(selectedWorkOrder);
      toast.success('Work order berhasil diselesaikan!');
      
      setDialogOpen(false);
      setSelectedWorkOrder(null);
      setUploadedFiles([]);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyelesaikan work order');
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

  const workOrder = selectedWorkOrder 
    ? workOrders.find(wo => wo.id === selectedWorkOrder) 
    : null;
  
  const transaction = workOrder 
    ? transactions.find(t => t.id === workOrder.transactionId) 
    : null;

  if (myWorkOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold">Tidak Ada Work Order</h2>
          <p className="text-gray-500">Semua work order telah diselesaikan</p>
          <Button onClick={() => onNavigate('home')}>
            Kembali ke Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Work Order</h1>
        <p className="text-gray-500">Proses pesanan yang di-assign ke Anda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myWorkOrders.map((wo) => {
          const trans = transactions.find(t => t.id === wo.transactionId);
          if (!trans) return null;

          return (
            <Card key={wo.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleOpenDetail(wo.id)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{wo.workOrderNumber}</CardTitle>
                    <CardDescription className="mt-1">{trans.consumerName}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Package className="w-3 h-3 mr-1" /> Aktif
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Paket</p>
                    <p className="font-medium">{getPackageName(trans.selectedPackage)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Kendaraan</p>
                    <p className="font-medium">{trans.carBrand} {trans.carYear}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Work Order</DialogTitle>
            <DialogDescription>
              Informasi lengkap pesanan dan upload dokumentasi
            </DialogDescription>
          </DialogHeader>

          {transaction && workOrder && (
            <div className="space-y-6 py-4">
              {/* Work Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informasi Work Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500">WO Number</p>
                      <p className="font-medium">{workOrder.workOrderNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Order Number</p>
                      <p className="font-medium">{transaction.orderNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informasi Pelanggan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500">Nama</p>
                      <p className="font-medium">{transaction.consumerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">WhatsApp</p>
                      <p className="font-medium">{transaction.whatsapp}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500">Alamat</p>
                    <p className="font-medium">{transaction.address}</p>
                  </div>
                  {transaction.location && (
                    <div>
                      <p className="text-gray-500">Location</p>
                      <a href={transaction.location} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs break-all hover:underline">
                        {transaction.location}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vehicle & Service Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Detail Kendaraan & Layanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500">Kendaraan</p>
                      <p className="font-medium">{transaction.carBrand} {transaction.carYear}</p>
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
                      <p className="text-gray-500">Tanggal Pengerjaan</p>
                      <p className="font-medium">
                        {new Date(transaction.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Jok</p>
                      <p className="font-medium">
                        {transaction.currentSeat} {transaction.hasStain ? '(Ada Noda)' : ''}
                      </p>
                    </div>
                  </div>

                  {transaction.audioSystem && (
                    <div>
                      <p className="text-gray-500">Audio/TV Tambahan</p>
                      <p className="font-medium">{transaction.audioSystem}</p>
                    </div>
                  )}

                  {transaction.specialComplaints && (
                    <div>
                      <p className="text-gray-500">Keluhan Khusus</p>
                      <p className="font-medium">{transaction.specialComplaints}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-gray-500 mb-1">Fasilitas Tempat</p>
                    <div className="flex flex-wrap gap-2">
                      {transaction.workplaceAvailable ? (
                        <>
                          {transaction.canopy && <Badge variant="outline">Kanopi</Badge>}
                          {transaction.parking && <Badge variant="outline">Parkir</Badge>}
                          {transaction.waterElectricity && <Badge variant="outline">Air & Listrik</Badge>}
                        </>
                      ) : (
                        <Badge variant="outline" className="bg-red-50">Tidak Tersedia</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documentation Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dokumentasi</CardTitle>
                  <CardDescription>Upload foto hasil pengerjaan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentation">Upload Foto</Label>
                    <Input
                      id="documentation"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                    />
                  </div>

                  {getExistingDocs().length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Dokumentasi yang sudah ada: {getExistingDocs().length}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {getExistingDocs().map((doc, idx) => (
                          <div key={idx} className="aspect-square bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                            {typeof doc === 'string' ? doc : (doc as any).fileName}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadedFiles.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">File baru yang diupload: {uploadedFiles.length}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} className="aspect-square bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                            {file.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Tutup
                </Button>
                <Button onClick={handleFinish} disabled={isUploading} className="flex-1">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Selesai'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
