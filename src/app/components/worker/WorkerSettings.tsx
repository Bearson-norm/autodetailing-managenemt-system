import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from 'sonner';

export const WorkerSettings: React.FC = () => {
  const { currentUser, setCurrentUser } = useApp();
  const [language, setLanguage] = useState(currentUser?.language || 'id');

  const handleSave = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        language: language as 'id' | 'en',
      });
      toast.success('Pengaturan berhasil disimpan');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Pengaturan</h1>
        <p className="text-gray-500">Kelola preferensi Anda</p>
      </div>

      {/* Bahasa */}
      <Card>
        <CardHeader>
          <CardTitle>Bahasa</CardTitle>
          <CardDescription>Pilih bahasa aplikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div className="flex justify-end">
            <Button onClick={handleSave}>Simpan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
