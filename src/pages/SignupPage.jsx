import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronLeft, Copy, User, Leaf } from 'lucide-react';
import { signupMasyarakat } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.access_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-h-screen flex flex-col items-center justify-center bg-linear-to-br from-gray-50 via-white to-gray-50 px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {!result ? (
          <>
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Kembali
              </Button>
            </Link>

            {/* Logo Section */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white">
                  <User className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Daftar Akun</h1>
                <p className="text-sm text-muted-foreground">Masyarakat Bandung</p>
              </div>
            </div>

            {/* Signup Card */}
            <Card className="border-0 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-5 pointer-events-none">
                <Leaf className="h-32 w-32 text-emerald-600 rotate-45" />
              </div>

              <CardHeader className="space-y-2 relative z-10">
                <CardTitle className="text-xl">Buat Akun Baru</CardTitle>
                <CardDescription>Masukkan nama lengkap Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Nama Lengkap</Label>
                  <Input
                    id="name"
                    placeholder="Contoh: Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  className="h-11 w-full gap-2 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSignup}
                  disabled={!canSubmit}
                >
                  {isLoading ? 'Membuat akun...' : 'Buat Akun'}
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Akun Berhasil Dibuat</h1>
                <p className="text-sm text-muted-foreground">Simpan Access Code Anda</p>
              </div>
            </div>

            {/* Code Card */}
            <Card className="border-0 bg-white relative overflow-hidden">
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 opacity-5 pointer-events-none">
                <Leaf className="h-32 w-32 text-emerald-600 -rotate-45" />
              </div>

              <CardHeader className="space-y-2 relative z-10">
                <CardTitle className="text-center text-base">Access Code Anda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="space-y-2 text-sm">
                  <div className="text-muted-foreground">Nama: <span className="font-semibold text-foreground">{result.name}</span></div>
                </div>

                <div className="rounded-lg bg-white p-6 text-center border border-emerald-200 relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
                    <Copy className="h-20 w-20 text-emerald-600" />
                  </div>
                  <div className="text-xs text-muted-foreground mb-2 relative z-10">Kode Akses</div>
                  <div className="font-mono text-3xl font-bold tracking-widest text-emerald-600 relative z-10">
                    {result.access_code}
                  </div>
                </div>

                <Button
                  className="h-11 w-full gap-2 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-5 w-5" />
                  {copied ? 'Tersalin!' : 'Salin Kode'}
                </Button>

                <Card className="border-blue-200 bg-blue-50 relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                    <Copy className="h-20 w-20 text-blue-600" />
                  </div>
                  <CardContent className="p-4 text-center text-xs relative z-10">
                    <div className="font-semibold text-blue-900 mb-1">⚠️ Simpan Dengan Aman</div>
                    <div className="text-blue-700">
                      Gunakan kode ini untuk login. Jangan bagikan ke orang lain.
                    </div>
                  </CardContent>
                </Card>

                <Link to="/" className="block">
                  <Button className="h-11 w-full text-base font-semibold">
                    Masuk dengan Kode Ini
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
