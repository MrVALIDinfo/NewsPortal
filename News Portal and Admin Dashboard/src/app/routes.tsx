import { createBrowserRouter } from 'react-router';
import { Outlet } from 'react-router';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminPosts } from './pages/admin/AdminPosts';
import { AdminCreatePost } from './pages/admin/AdminCreatePost';
import { AdminModeration } from './pages/admin/AdminModeration';

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center">
                <span className="text-white" style={{ fontSize: '10px', fontWeight: 700 }}>НП</span>
              </div>
              <span className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>НовостиПортал</span>
            </div>
            <p className="text-gray-400 text-xs">© 2026 НовостиПортал. Все права защищены.</p>
            <div className="flex items-center gap-4">
              {['О нас', 'Редакция', 'Реклама', 'Конфиденциальность'].map(link => (
                <a key={link} href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4" style={{ fontWeight: 800, color: '#E5E7EB' }}>404</p>
        <h2 className="text-gray-900 mb-2" style={{ fontWeight: 600 }}>Страница не найдена</h2>
        <a href="/" className="text-indigo-600 text-sm hover:underline">← На главную</a>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: PublicLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'article/:id', Component: ArticlePage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'profile', Component: ProfilePage },
      { path: '*', Component: NotFound },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'posts', Component: AdminPosts },
      { path: 'create', Component: AdminCreatePost },
      { path: 'create/:id', Component: AdminCreatePost },
      { path: 'moderation', Component: AdminModeration },
    ],
  },
]);
