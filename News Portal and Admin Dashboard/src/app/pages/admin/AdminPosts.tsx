import { useState } from 'react';
import { Link } from 'react-router';
import { PlusCircle, Edit2, Trash2, Eye, Search, Filter, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/mockData';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function AdminPosts() {
  const { articles, deleteArticle } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const filtered = articles.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || a.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      await deleteArticle(id);
      toast.success('Статья удалена');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Управление статьями</h1>
          <p className="text-gray-500 text-sm mt-1">Всего {articles.length} материалов</p>
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors min-w-40"
            style={{ fontWeight: 500 }}
          >
            <Filter size={14} className="text-gray-400" />
            <span className="flex-1 text-left">{categoryFilter || 'Все категории'}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {showCategoryFilter && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowCategoryFilter(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20">
                <button
                  onClick={() => { setCategoryFilter(''); setShowCategoryFilter(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${!categoryFilter ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
                  style={{ fontWeight: 500 }}
                >
                  Все категории
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategoryFilter(cat); setShowCategoryFilter(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${categoryFilter === cat ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    style={{ fontWeight: 500 }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs text-gray-400" style={{ fontWeight: 600 }}>МАТЕРИАЛ</th>
                <th className="text-left px-5 py-3.5 text-xs text-gray-400 hidden sm:table-cell" style={{ fontWeight: 600 }}>КАТЕГОРИЯ</th>
                <th className="text-left px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell" style={{ fontWeight: 600 }}>ДАТА</th>
                <th className="text-left px-5 py-3.5 text-xs text-gray-400 hidden md:table-cell" style={{ fontWeight: 600 }}>ПРОСМОТРЫ</th>
                <th className="text-left px-5 py-3.5 text-xs text-gray-400" style={{ fontWeight: 600 }}>ДЕЙСТВИЯ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                    Нет материалов для отображения
                  </td>
                </tr>
              ) : (
                filtered.map(article => (
                  <tr key={article.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-12 h-10 rounded-xl object-cover flex-shrink-0 hidden sm:block"
                        />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-900 line-clamp-1" style={{ fontWeight: 500 }}>{article.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 hidden lg:block">{article.author} · {article.readTime} мин</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span
                        className="inline-block px-2.5 py-1 rounded-lg text-xs"
                        style={{
                          backgroundColor: '#EEF2FF',
                          color: '#4F46E5',
                          fontWeight: 600,
                        }}
                      >
                        {article.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">{formatDate(article.date)}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Eye size={13} className="text-gray-400" />
                        <span>{article.views.toLocaleString('ru')}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/article/${article.id}`}
                          target="_blank"
                          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Просмотр"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          to={`/admin/create/${article.id}`}
                          className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Редактировать"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className={`p-2 rounded-xl transition-colors ${confirmDelete === article.id
                            ? 'bg-red-100 text-red-600'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                          title={confirmDelete === article.id ? 'Нажмите ещё раз для подтверждения' : 'Удалить'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      {confirmDelete === article.id && (
                        <p className="text-xs text-red-500 mt-1 whitespace-nowrap" style={{ fontWeight: 500 }}>
                          Нажмите ещё раз
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-4 px-1">
          Показано {filtered.length} из {articles.length} материалов
        </p>
      )}
    </div>
  );
}
