import { Home, Calendar, Bell, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MobileNav({ user, onLogout, onNotificationClick, unreadCount }) {
  const navigate = useNavigate();
  const location = useLocation();

  const homePath = user?.role === 'petugas' ? '/petugas' : '/masyarakat';

  const navItems = [
    { path: homePath, label: 'Beranda', icon: Home },
    { path: '/calendar', label: 'Kalender', icon: Calendar },
    { path: '#', label: 'Notif', icon: Bell, badge: unreadCount > 0, count: unreadCount, onClick: onNotificationClick },
    { path: '#', label: 'Keluar', icon: LogOut, onClick: onLogout },
  ];

  const handleNavClick = (item) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path !== '#') {
      navigate(item.path);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item, idx) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={idx}
              onClick={() => handleNavClick(item)}
              className="flex-1 flex flex-col items-center justify-center py-3 px-1 relative text-xs font-medium transition-colors"
            >
              <div className={`relative ${isActive && item.path !== '#' ? 'text-emerald-600' : 'text-gray-600'}`}>
                <IconComponent className="h-5 w-5" />
                {item.badge && (
                  <div className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {item.count || '!'}
                  </div>
                )}
              </div>
              <span className={`mt-1 ${isActive && item.path !== '#' ? 'text-emerald-600' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
