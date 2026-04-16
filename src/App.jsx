import { useEffect, useMemo, useState, useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Leaf, LogOut } from 'lucide-react';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MasyarakatPage from './pages/MasyarakatPage';
import PetugasPage from './pages/PetugasPage';
import CalendarPage from './pages/CalendarPage';
import { loginWithCode } from './lib/api';
import { Button } from './components/ui/button';
import { NotificationProvider, NotificationContext } from './contexts/NotificationContext';
import { ToastContainer } from './components/ToastContainer';
import MobileNav from './components/MobileNav';
import FloatingMenu from './components/FloatingMenu';
import NotificationDrawer from './components/NotificationDrawer';

function RequireRole({ user, role, children }) {
  const fallback = user?.role === 'petugas' ? '/petugas' : '/masyarakat';

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={fallback} replace />;
  return children;
}

function AppLayout({ user, onLogout, children, onNotificationClick, unreadCount }) {
  return (
    <div className="flex h-full bg-white flex-col">
      {/* Header - Always visible */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 max-w-full mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 font-bold">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-white border border-emerald-200 shadow-md">
              <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
            </div>
            <span className="text-base sm:text-lg text-foreground">SIPESAT</span>
          </div>

          {user ? (
            <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
              <div className="text-right text-xs sm:text-sm">
                <div className="font-semibold text-foreground truncate">{user.name}</div>
                <div className="text-muted-foreground text-xs capitalize">{user.role}</div>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 text-xs sm:text-sm h-8 sm:h-9 hidden sm:flex">
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Logout</span>
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-linear-to-b from-gray-50 to-white pb-20 mb-18 md:mb-0 md:pb-32 relative z-20">
        {/* Centered content wrapper */}
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 px-4 py-4 sm:px-24 sm:py-6 sm:pb-12 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Footer - Hidden on mobile */}
      {user && (
        <footer className="hidden sm:block border-t border-border bg-white/70 text-center text-xs text-muted-foreground z-20">
          <div className="px-4 py-2.5 sm:px-6 sm:py-3">
            SIPESAT • Sistem Informasi Pelaporan Sampah Terpadu
          </div>
        </footer>
      )}

      {/* Floating Menu - Desktop */}
      {user && <FloatingMenu user={user} onLogout={onLogout} onNotificationClick={onNotificationClick} unreadCount={unreadCount} />}

      {/* Mobile Nav */}
      {user && <MobileNav user={user} onLogout={onLogout} onNotificationClick={onNotificationClick} unreadCount={unreadCount} />}
    </div>
  );
}

function AppInner() {
  const navigate = useNavigate();
  const { drawerNotifications } = useContext(NotificationContext);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
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
    <>
      <AppLayout 
        user={user} 
        onLogout={handleLogout} 
        onNotificationClick={() => setIsNotificationDrawerOpen(true)}
        unreadCount={drawerNotifications.length}
      >
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
          <Route
            path="/calendar"
            element={
              user ? (
                <CalendarPage user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to={homePath} replace />} />
        </Routes>
      </AppLayout>
      <NotificationDrawer isOpen={isNotificationDrawerOpen} onClose={() => setIsNotificationDrawerOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <AppInner />
        <ToastContainer />
      </BrowserRouter>
    </NotificationProvider>
  );
}
