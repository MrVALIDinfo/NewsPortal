import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, FileText, PlusCircle, MessageSquare,
  LogOut, ChevronLeft, Menu, X, Home, Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Обзор', href: '/admin' },
  { icon: FileText, label: 'Материалы', href: '/admin/posts' },
  { icon: PlusCircle, label: 'Новый пост', href: '/admin/create' },
  { icon: MessageSquare, label: 'Модерация', href: '/admin/moderation' },
];

export function AdminLayout() {
  const { currentUser, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
            <Shield size={24} className="text-red-400" />
          </div>
          <h2 className="text-gray-900 mb-2" style={{ fontWeight: 700 }}>Доступ запрещён</h2>
          <p className="text-gray-500 text-sm mb-5">У вас нет прав для просмотра этой страницы</p>
          <Link to="/login" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors" style={{ fontWeight: 500 }}>
            Войти как администратор
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs" style={{ fontWeight: 700 }}>НП</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>НовостиПортал</p>
            <p className="text-gray-400" style={{ fontSize: '11px' }}>Панель администратора</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${collapsed ? 'justify-center' : ''} ${active
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span className="text-sm" style={{ fontWeight: active ? 600 : 500 }}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <Home size={18} />
          {!collapsed && <span className="text-sm" style={{ fontWeight: 500 }}>На сайт</span>}
        </Link>

        {!collapsed && currentUser && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: currentUser.color, fontSize: '11px', fontWeight: 700 }}
            >
              {currentUser.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-900 truncate" style={{ fontWeight: 600 }}>{currentUser.name}</p>
              <p className="text-gray-400" style={{ fontSize: '10px' }}>Администратор</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Выйти"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        {collapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center px-3 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-full w-5 h-10 bg-white border border-gray-200 rounded-r-xl flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          style={{ left: collapsed ? '64px' : '224px' }}
        >
          <ChevronLeft size={12} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-gray-100 z-50 flex flex-col lg:hidden">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>Панель администратора</span>
          <div className="w-8" />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
