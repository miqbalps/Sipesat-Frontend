import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, UserPlus } from 'lucide-react';
import { signupMasyarakat } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(() => name.trim().length > 0 && !isLoading, [name, isLoading]);

  async function handleSignup() {
    setIsLoading(true);
    try {
      const data = await signupMasyarakat({ name: name.trim() });
      setResult(data);
    } catch (e) {
      alert(e?.response?.data?.message || 'Gagal daftar.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-brand-50 to-white">
      <div className="mx-auto flex min-h-full max-w-6xl items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                <UserPlus className="h-5 w-5" />
              </span>
              Daftar Masyarakat
            </CardTitle>
            <CardDescription>Isi data untuk mendapatkan Access Code unik.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!result ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input id="name" placeholder="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <Button className="w-full" onClick={handleSignup} disabled={!canSubmit}>
                  {isLoading ? 'Memproses...' : 'Buat Access Code'}
                </Button>

                <div className="text-sm text-slate-600">
                  Sudah punya kode?{' '}
                  <Link to="/" className="font-medium text-brand-700 hover:text-brand-800">
                    Login
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border bg-emerald-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
                  <div>
                    <div className="font-semibold text-emerald-900">Pendaftaran berhasil</div>
                    <div className="text-sm text-emerald-800">Simpan kode ini untuk login.</div>
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <div className="text-xs text-slate-500">Access Code</div>
                  <div className="mt-1 font-mono text-2xl font-semibold tracking-wider text-slate-900">
                    {result.access_code}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Nama: {result.name}</div>
                </div>

                <Link to="/" className="block">
                  <Button className="w-full">Kembali ke Login</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
