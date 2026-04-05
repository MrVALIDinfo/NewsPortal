import { Link } from 'react-router';
import { FileText, MessageSquare, Eye, TrendingUp, PlusCircle, ArrowRight, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function AdminDashboard() {
  const { articles, comments } = useApp();

  const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
  const pendingComments = comments.filter(c => c.status === 'pending').length;
  const recentArticles = [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const stats = [
    {
      label: 'Статьи',
      value: articles.length,
      icon: FileText,
      color: '#4F46E5',
      bg: '#EEF2FF',
      change: '+2 за неделю',
    },
    {
      label: 'Просмотры',
      value: totalViews.toLocaleString('ru'),
      icon: Eye,
      color: '#0284C7',
      bg: '#F0F9FF',
      change: '+12% за месяц',
    },
    {
      label: 'Комментарии',
      value: comments.length,
      icon: MessageSquare,
      color: '#16A34A',
      bg: '#F0FDF4',
      change: `${pendingComments} ожидают`,
    },
    {
      label: 'На модерации',
      value: pendingComments,
      icon: Clock,
      color: '#D97706',
      bg: '#FFFBEB',
      change: 'Требуют внимания',
    },
  ];

  const categoryStats = articles.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(...Object.values(categoryStats));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Обзор</h1>
          <p className="text-gray-500 text-sm mt-1">Добро пожаловать в панель администратора</p>
        </div>
        <Link
          to="/admin/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors"
          style={{ fontWeight: 500 }}
        >
          <PlusCircle size={15} />
          Новая статья
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: stat.bg }}
                >
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.6rem' }}>{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              <p className="text-xs mt-2" style={{ color: stat.color, fontWeight: 500 }}>{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>Последние статьи</h2>
            <Link
              to="/admin/posts"
              className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
              style={{ fontWeight: 500 }}
            >
              Все статьи
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentArticles.map(article => (
              <div key={article.id} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-12 h-10 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 line-clamp-1" style={{ fontWeight: 500 }}>{article.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-indigo-600" style={{ fontWeight: 500 }}>{article.category}</span>
                    <span className="text-gray-300 text-xs">·</span>
                    <span className="text-xs text-gray-400">{formatDate(article.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
                  <Eye size={12} />
                  <span>{(article.views / 1000).toFixed(1)}k</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} className="text-indigo-600" />
            <h2 className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>По категориям</h2>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryStats)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{cat}</span>
                    <span className="text-xs text-gray-400">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <Link to="/admin/create" className="flex items-center gap-3 p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-700 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <PlusCircle size={18} />
          </div>
          <div>
            <p className="text-sm" style={{ fontWeight: 600 }}>Написать статью</p>
            <p className="text-xs text-indigo-200">Создать новый материал</p>
          </div>
        </Link>

        <Link to="/admin/posts" className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl text-gray-700 hover:border-indigo-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <FileText size={18} className="text-gray-500" />
          </div>
          <div>
            <p className="text-sm" style={{ fontWeight: 600 }}>Управление контентом</p>
            <p className="text-xs text-gray-400">{articles.length} материалов</p>
          </div>
        </Link>

        <Link to="/admin/moderation" className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl text-gray-700 hover:border-indigo-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <MessageSquare size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm" style={{ fontWeight: 600 }}>Модерация</p>
            <p className="text-xs text-gray-400">{pendingComments} ожидают проверки</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
