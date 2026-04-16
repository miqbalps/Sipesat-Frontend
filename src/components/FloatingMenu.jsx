import { useState } from 'react';
import { Home, Calendar, Bell, LogOut, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FloatingMenu({ user, onLogout, onNotificationClick, unreadCount }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = user?.role === 'petugas'
    ? [
        { path: '/petugas', label: 'Beranda', icon: Home },
        { path: '/calendar', label: 'Kalender', icon: Calendar },
        { path: '#', label: 'Notifikasi', icon: Bell, onClick: onNotificationClick, badge: unreadCount > 0, count: unreadCount },
        { path: '#', label: 'Logout', icon: LogOut, onClick: onLogout },
      ]
    : [
        { path: '/masyarakat', label: 'Beranda', icon: Home },
        { path: '/calendar', label: 'Kalender', icon: Calendar },
        { path: '#', label: 'Notifikasi', icon: Bell, onClick: onNotificationClick, badge: unreadCount > 0, count: unreadCount },
        { path: '#', label: 'Logout', icon: LogOut, onClick: onLogout },
      ];

  const handleNavClick = (item) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path !== '#') {
      navigate(item.path);
    }
  };

  return (
    <div className="hidden md:flex fixed right-0 top-1/2 z-40 transform -translate-y-1/2">
      {/* Expanded Menu - with slide animation */}
      <div className={`transition-all rounded-l-2xl duration-300 ease-in-out transform overflow-hidden ${
        isExpanded ? 'translate-x-2/3 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
      }`}>
        <div className="bg-white shadow-2xl rounded-l-2xl border border-gray-300 px-4 py-4 flex flex-col items-center gap-3">
          {/* Hide Button - Arrow Right */}
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            title="Sembunyikan menu"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Icons Container */}
          <div className="flex flex-col gap-2">
            {navItems.map((item, idx) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={idx}
                  onClick={() => handleNavClick(item)}
                  className={`p-3 rounded-full transition-all relative flex items-center justify-center ${
                    isActive && item.path !== '#'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                  title={item.label}
                >
                  <IconComponent className="h-5 w-5" />
                  {item.badge && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {item.count || '!'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Collapsed Menu - Show Button at Edge with slide animation */}
      <div className={`transition-all duration-300 ease-in-out transform ${
        !isExpanded ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
      }`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-white shadow-lg border border-gray-300 rounded-l-lg p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
          title="Tampilkan menu"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
