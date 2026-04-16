import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Leaf, LogOut } from 'lucide-react';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MasyarakatPage from './pages/MasyarakatPage';
import PetugasPage from './pages/PetugasPage';
import { loginWithCode } from './lib/api';
import { Button } from './components/ui/button';

function RequireRole({ user, role, children }) {
  const fallback = user?.role === 'petugas' ? '/petugas' : '/masyarakat';

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={fallback} replace />;
  return children;
}

function AppLayout({ user, onLogout, children }) {
  return (
    <div className="min-h-full bg-white">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Leaf className="h-5 w-5" />
            </span>
            SIPESAT
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <div className="font-medium text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">Role: {user.role}</div>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

      <footer className="border-t bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500">
          SIPESAT • Pelaporan Sampah Berbasis Lokasi
        </div>
      </footer>
    </div>
  );
}

function AppInner() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // keep access code in storage for API header
    const code = localStorage.getItem('accessCode');
    if (!code && user?.access_code) localStorage.setItem('accessCode', String(user.access_code));
  }, [user]);

  const homePath = useMemo(() => {
    if (!user) return '/';
    return user.role === 'petugas' ? '/petugas' : '/masyarakat';
  }, [user]);

  async function handleLogin(code) {
    const trimmed = String(code || '').trim();
    if (!trimmed) return;

    setIsLoggingIn(true);
    try {
      const data = await loginWithCode({ code: trimmed });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('accessCode', trimmed);
      setUser(data);
      navigate(data.role === 'petugas' ? '/petugas' : '/masyarakat', { replace: true });
    } catch (e) {
      alert(e?.response?.data?.message || 'Kode akses salah!');
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('accessCode');
    setUser(null);
    navigate('/', { replace: true });
  }

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={user ? <Navigate to={homePath} replace /> : <LoginPage onLogin={handleLogin} isLoading={isLoggingIn} />} />
        <Route path="/signup" element={user ? <Navigate to={homePath} replace /> : <SignupPage />} />

        <Route
          path="/masyarakat"
          element={
            <RequireRole user={user} role="masyarakat">
              <MasyarakatPage user={user} />
            </RequireRole>
          }
        />
        <Route
          path="/petugas"
          element={
            <RequireRole user={user} role="petugas">
              <PetugasPage />
            </RequireRole>
          }
        />

        <Route path="*" element={<Navigate to={homePath} replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
