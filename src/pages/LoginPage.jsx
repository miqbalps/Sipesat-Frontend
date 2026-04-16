import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Leaf, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function LoginPage({ onLogin, isLoading }) {
  const [code, setCode] = useState('');

  return (
    <div className="max-h-screen flex flex-col items-center justify-center bg-linear-to-b from-gray-50 via-white to-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Section */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white">
              <Leaf className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">SIPESAT</h1>
            <p className="text-sm text-muted-foreground">Sistem Informasi Pelaporan Sampah Terpadu</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-0 bg-white relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-5 pointer-events-none">
            <Leaf className="h-32 w-32 text-emerald-600 rotate-45" />
          </div>

          <CardHeader className="space-y-2 relative z-10">
            <CardTitle className="text-xl">Masuk</CardTitle>
            <CardDescription>Gunakan Access Code untuk melanjutkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">Access Code</Label>
              <Input
                id="code"
                placeholder="Contoh: 123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="h-11"
              />
            </div>

            <Button
              className="h-11 w-full gap-2 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onLogin(code)}
              disabled={isLoading || !code.trim()}
            >
              <LogIn className="h-5 w-5" />
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-muted-foreground">atau</span>
              </div>
            </div>

            <Link to="/signup">
              <Button variant="outline" className="h-11 w-full gap-2 text-base">
                <UserPlus className="h-5 w-5" />
                Daftar Akun Baru
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-0 bg-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
            <KeyRound className="h-24 w-24 text-emerald-600" />
          </div>
          <CardContent className="p-4 relative z-10">
            <div className="font-semibold text-foreground flex items-center gap-2 mb-1">
              <KeyRound className="h-5 w-5 text-emerald-600" />
              Petugas?
            </div>
            <div className="text-sm text-muted-foreground">
              Gunakan kode <span className="font-mono font-bold text-emerald-700">999999</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
