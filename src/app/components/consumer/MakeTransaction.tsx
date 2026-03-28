import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { MapPicker } from '../MapPicker';
import { toast } from 'sonner';

interface MakeTransactionProps {
  onNavigate: (page: string) => void;
}

export const MakeTransaction: React.FC<MakeTransactionProps> = ({ onNavigate }) => {
  const { currentUser, addTransaction } = useApp();
  const [formData, setFormData] = useState({
    date: '',
    name: currentUser?.name || '',
    address: '',
    location: '',
    whatsapp: currentUser?.phone || '',
    carBrand: '',
    carYear: '',
    carColor: '',
    selectedPackage: 'interior' as 'interior' | 'exterior' | 'complete',
    currentSeat: 'fabric',
    hasStain: false,
    workplaceAvailable: false,
    canopy: false,
    parking: false,
    waterElectricity: false,
    audioSystem: '',
    specialComplaints: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    try {
      const orderNumber = await addTransaction({
        consumerId: currentUser.id,
        consumerName: currentUser.name,
        status: 'received',
        ...formData,
      });

      toast.success(`Pesanan berhasil dibuat! Nomor pesanan: ${orderNumber}`);
      
      // Reset form
      setFormData({
        date: '',
        name: currentUser.name,
        address: '',
        location: '',
        whatsapp: currentUser.phone || '',
        carBrand: '',
        carYear: '',
        carColor: '',
        selectedPackage: 'interior',
        currentSeat: 'fabric',
        hasStain: false,
        workplaceAvailable: false,
        canopy: false,
        parking: false,
        waterElectricity: false,
        audioSystem: '',
        specialComplaints: '',
      });

      // Navigate to home
      setTimeout(() => {
        onNavigate('home');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Gagal membuat pesanan');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Buat Pesanan Baru</h1>
        <p className="text-gray-500">Isi formulir di bawah untuk membuat pesanan detailing</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Umum */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Umum</CardTitle>
            <CardDescription>Detail pelanggan dan pengerjaan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Hari/Tanggal Pengerjaan</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Masukkan alamat lengkap"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Share Location Maps (Link)</Label>
              <MapPicker
                value={formData.location}
                onChange={(value) => setFormData({ ...formData, location: value })}
                placeholder="Klik peta untuk memilih lokasi atau paste link Google Maps"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="08123456789"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Informasi Kendaraan */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kendaraan</CardTitle>
            <CardDescription>Detail mobil yang akan di-detailing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carBrand">Merk / Tahun Mobil</Label>
                <Input
                  id="carBrand"
                  type="text"
                  value={formData.carBrand}
                  onChange={(e) => setFormData({ ...formData, carBrand: e.target.value })}
                  placeholder="Toyota Avanza"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carYear">Tahun</Label>
                <Input
                  id="carYear"
                  type="text"
                  value={formData.carYear}
                  onChange={(e) => setFormData({ ...formData, carYear: e.target.value })}
                  placeholder="2020"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carColor">Warna Mobil</Label>
              <Input
                id="carColor"
                type="text"
                value={formData.carColor}
                onChange={(e) => setFormData({ ...formData, carColor: e.target.value })}
                placeholder="Hitam Metalik"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Paket yang Diambil</Label>
              <RadioGroup
                value={formData.selectedPackage}
                onValueChange={(value) => setFormData({ ...formData, selectedPackage: value as any })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="interior" id="interior" />
                  <Label htmlFor="interior" className="cursor-pointer">Interior Detailing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="exterior" id="exterior" />
                  <Label htmlFor="exterior" className="cursor-pointer">Eksterior Detailing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="complete" id="complete" />
                  <Label htmlFor="complete" className="cursor-pointer">Paket Lengkap</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Jok yang Terpasang Saat Ini</Label>
              <div className="space-y-2">
                <RadioGroup
                  value={formData.currentSeat}
                  onValueChange={(value) => setFormData({ ...formData, currentSeat: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fabric" id="fabric" />
                    <Label htmlFor="fabric" className="cursor-pointer">Fabric</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="leather" id="leather" />
                    <Label htmlFor="leather" className="cursor-pointer">Kulit</Label>
                  </div>
                </RadioGroup>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasStain"
                    checked={formData.hasStain}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasStain: checked as boolean })}
                  />
                  <Label htmlFor="hasStain" className="cursor-pointer">Ada Noda</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tempat Pengerjaan */}
        <Card>
          <CardHeader>
            <CardTitle>Tempat Pengerjaan</CardTitle>
            <CardDescription>Fasilitas yang tersedia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="workplaceAvailable"
                checked={formData.workplaceAvailable}
                onCheckedChange={(checked) => setFormData({ ...formData, workplaceAvailable: checked as boolean })}
              />
              <Label htmlFor="workplaceAvailable" className="cursor-pointer">Tempat Pengerjaan Tersedia</Label>
            </div>

            {formData.workplaceAvailable && (
              <div className="ml-6 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canopy"
                    checked={formData.canopy}
                    onCheckedChange={(checked) => setFormData({ ...formData, canopy: checked as boolean })}
                  />
                  <Label htmlFor="canopy" className="cursor-pointer">Kanopi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parking"
                    checked={formData.parking}
                    onCheckedChange={(checked) => setFormData({ ...formData, parking: checked as boolean })}
                  />
                  <Label htmlFor="parking" className="cursor-pointer">Tempat Parkir Mobil</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="waterElectricity"
                    checked={formData.waterElectricity}
                    onCheckedChange={(checked) => setFormData({ ...formData, waterElectricity: checked as boolean })}
                  />
                  <Label htmlFor="waterElectricity" className="cursor-pointer">Air dan Listrik</Label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informasi Tambahan */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Tambahan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audioSystem">Audio Sistem Tambahan / TV Tambahan</Label>
              <Textarea
                id="audioSystem"
                value={formData.audioSystem}
                onChange={(e) => setFormData({ ...formData, audioSystem: e.target.value })}
                placeholder="Jelaskan jika ada audio sistem atau TV tambahan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialComplaints">Keluhan Khusus</Label>
              <Textarea
                id="specialComplaints"
                value={formData.specialComplaints}
                onChange={(e) => setFormData({ ...formData, specialComplaints: e.target.value })}
                placeholder="Jelaskan keluhan atau permintaan khusus"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => onNavigate('home')}>
            Batal
          </Button>
          <Button type="submit" className="flex-1">
            Konfirmasi Pesanan
          </Button>
        </div>
      </form>
    </div>
  );
};
