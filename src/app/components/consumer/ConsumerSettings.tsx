import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from 'sonner';

export const ConsumerSettings: React.FC = () => {
  const { currentUser, setCurrentUser } = useApp();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [language, setLanguage] = useState(currentUser?.language || 'id');

  const handleSave = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        name,
        phone,
        language: language as 'id' | 'en',
      });
      toast.success('Pengaturan berhasil disimpan');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Pengaturan</h1>
        <p className="text-gray-500">Kelola profil dan preferensi Anda</p>
      </div>

      {/* Profil */}
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Informasi akun Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={currentUser?.username || ''}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bahasa */}
      <Card>
        <CardHeader>
          <CardTitle>Bahasa</CardTitle>
          <CardDescription>Pilih bahasa aplikasi</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={language} onValueChange={setLanguage}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="id" id="indonesian" />
              <Label htmlFor="indonesian" className="cursor-pointer">Bahasa Indonesia</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="en" id="english" />
              <Label htmlFor="english" className="cursor-pointer">English</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Simpan Perubahan</Button>
      </div>
    </div>
  );
};
