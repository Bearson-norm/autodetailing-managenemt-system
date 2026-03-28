import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { UserPlus, Trash2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { currentUser, setCurrentUser, users, addWorker } = useApp();
  const [language, setLanguage] = useState(currentUser?.language || 'id');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({
    username: '',
    password: '',
    name: '',
  });

  const workers = users.filter(u => u.role === 'worker');

  const handleSaveLanguage = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        language: language as 'id' | 'en',
      });
      toast.success('Pengaturan bahasa berhasil disimpan');
    }
  };

  const handleAddWorker = async () => {
    if (!newWorker.username || !newWorker.password || !newWorker.name) {
      toast.error('Semua field harus diisi');
      return;
    }

    try {
      await addWorker(newWorker.username, newWorker.password, newWorker.name);
      toast.success(`Worker ${newWorker.name} berhasil ditambahkan`);
      
      setNewWorker({ username: '', password: '', name: '' });
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan worker');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Pengaturan</h1>
        <p className="text-gray-500">Kelola sistem dan user</p>
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
            <Button onClick={handleSaveLanguage}>Simpan</Button>
          </div>
        </CardContent>
      </Card>

      {/* Manajemen Worker */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manajemen Worker</CardTitle>
              <CardDescription>Kelola akun worker</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Tambah Worker
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Worker Baru</DialogTitle>
                  <DialogDescription>
                    Buat akun worker baru untuk sistem
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="workerName">Nama</Label>
                    <Input
                      id="workerName"
                      value={newWorker.name}
                      onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                      placeholder="Nama lengkap worker"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workerUsername">Username</Label>
                    <Input
                      id="workerUsername"
                      value={newWorker.username}
                      onChange={(e) => setNewWorker({ ...newWorker, username: e.target.value })}
                      placeholder="Username untuk login"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workerPassword">Password</Label>
                    <Input
                      id="workerPassword"
                      type="password"
                      value={newWorker.password}
                      onChange={(e) => setNewWorker({ ...newWorker, password: e.target.value })}
                      placeholder="Password"
                    />
                  </div>
                  <Button onClick={handleAddWorker} className="w-full">
                    Tambah Worker
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {workers.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Belum ada worker</p>
          ) : (
            <div className="space-y-2">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{worker.name}</p>
                    <p className="text-sm text-gray-500">@{worker.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
