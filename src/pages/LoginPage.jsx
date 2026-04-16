import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';

export default function LoginPage({ onLogin, isLoading }) {
  const [code, setCode] = useState('');

  return (
    <div className="min-h-full bg-gradient-to-b from-brand-50 to-white">
      <div className="mx-auto flex min-h-full max-w-6xl items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                <KeyRound className="h-5 w-5" />
              </span>
              SIPESAT
            </CardTitle>
            <CardDescription>Login pakai Access Code (tanpa password).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Access Code</Label>
              <Input
                id="code"
                placeholder="Contoh: 123456 atau 9999 (Petugas)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>

            <Button
              className="w-full"
              onClick={() => onLogin(code)}
              disabled={isLoading || !code.trim()}
            >
              <LogIn className="h-4 w-4" />
              {isLoading ? 'Memproses...' : 'Login'}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Belum punya kode?</span>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 font-medium text-brand-700 hover:text-brand-800"
              >
                <UserPlus className="h-4 w-4" />
                Daftar Masyarakat
              </Link>
            </div>

            <div className="rounded-lg border bg-slate-50 p-3 text-xs text-slate-600">
              <div className="font-medium text-slate-800">Petugas</div>
              <div>Gunakan kode <span className="font-mono">9999</span>.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
