import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Sparkles, Lock, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const user = await login(username, password);
      
      if (user) {
        toast.success(`Selamat datang, ${user.name}!`);
      } else {
        toast.error('Username atau password salah');
        setIsLoading(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Subtle blue glow - LYNX accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 rounded-full filter blur-3xl opacity-10"
          style={{ background: 'var(--lynx-blue)' }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 rounded-full filter blur-3xl opacity-10"
          style={{ background: 'var(--lynx-blue)' }}
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo/Brand - LYNX */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="inline-block mb-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img
              src="/lynx-logo.png"
              alt="LYNX Auto Detailing"
              className="h-24 w-auto mx-auto object-contain drop-shadow-[0_0_20px_rgba(0,191,255,0.2)]"
            />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground tracking-wide">
            Sistem Manajemen Profesional
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-xl border border-border bg-card">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Masuk ke sistem manajemen detailing</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Masukkan username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="pl-10 transition-all focus:ring-2 focus:ring-primary"
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 transition-all focus:ring-2 focus:ring-primary"
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      'Masuk'
                    )}
                  </Button>
                </motion.div>
              </form>
              
              <motion.div 
                className="mt-6 pt-6 border-t border-border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">Demo Akun:</p>
                </div>
                <div className="space-y-2">
                  {[
                    { role: 'Admin', username: 'admin1', password: 'admin123', dotColor: 'bg-primary' },
                    { role: 'Worker', username: 'worker1', password: 'worker123', dotColor: 'bg-amber-500' }
                  ].map((account, idx) => (
                    <motion.div
                      key={account.role}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + idx * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-accent transition-colors cursor-pointer border border-border"
                      onClick={() => {
                        setUsername(account.username);
                        setPassword(account.password);
                      }}
                    >
                      <div className={`w-2 h-2 rounded-full ${account.dotColor}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{account.role}</p>
                        <p className="text-xs text-muted-foreground">{account.username} / {account.password}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};