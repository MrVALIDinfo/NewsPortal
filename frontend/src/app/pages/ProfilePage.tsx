import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { MessageCircle, Calendar, ArrowRight, Edit2, LogOut, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function ProfilePage() {
  const { currentUser, logout, comments, articles } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'comments' | 'settings'>('comments');

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Lock size={24} className="text-gray-400" />
          </div>
          <h2 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: '1.2rem' }}>Требуется авторизация</h2>
          <p className="text-gray-500 text-sm mb-6">Для просмотра профиля необходимо войти в систему</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors"
            style={{ fontWeight: 500 }}
          >
            Войти
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const userComments = comments.filter(c => c.userId === currentUser.id);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-6">
          {/* Cover */}
          <div className="h-28 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600" />

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: currentUser.color, fontSize: '24px', fontWeight: 700 }}
              >
                {currentUser.initials}
              </div>

              <div className="flex items-center gap-2 pb-1">
                {currentUser.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs hover:bg-indigo-100 transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    Панель админа
                    <ArrowRight size={12} />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs hover:bg-red-100 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <LogOut size={12} />
                  Выйти
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.3rem' }}>{currentUser.name}</h1>
                {currentUser.role === 'admin' && (
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs" style={{ fontWeight: 600 }}>
                    Администратор
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">{currentUser.email}</p>
              {currentUser.bio && (
                <p className="mt-2 text-gray-700 text-sm">{currentUser.bio}</p>
              )}

              <div className="mt-4 flex items-center gap-5">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar size={14} className="text-gray-400" />
                  <span>С {formatDate(currentUser.joinDate)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MessageCircle size={14} className="text-gray-400" />
                  <span>{userComments.length} комментариев</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-2xl border border-gray-100 p-1 w-fit">
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${activeTab === 'comments' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            style={{ fontWeight: 500 }}
          >
            Мои комментарии
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            style={{ fontWeight: 500 }}
          >
            Настройки
          </button>
        </div>

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-3">
            {userComments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                <MessageCircle size={36} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-500" style={{ fontWeight: 500 }}>Вы ещё не оставили ни одного комментария</p>
                <p className="text-sm text-gray-400 mt-1">Читайте статьи и делитесь мнением</p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm text-indigo-600 hover:underline"
                  style={{ fontWeight: 500 }}
                >
                  Перейти на главную
                  <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              userComments.map(comment => {
                const article = articles.find(a => a.id === comment.articleId);
                return (
                  <div key={comment.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    {article && (
                      <Link
                        to={`/article/${article.id}`}
                        className="flex items-center gap-2 mb-3 group"
                      >
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 mb-0.5">{article.category}</p>
                          <p className="text-sm text-gray-700 line-clamp-1 group-hover:text-indigo-600 transition-colors" style={{ fontWeight: 500 }}>
                            {article.title}
                          </p>
                        </div>
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0 ml-auto" />
                      </Link>
                    )}

                    <div className="pl-1 border-l-2 border-gray-200">
                      <p className="text-sm text-gray-700 pl-3" style={{ lineHeight: 1.6 }}>{comment.text}</p>
                      {comment.image && (
                        <img
                          src={comment.image}
                          alt="Прикреплённое"
                          className="mt-2 ml-3 max-h-32 rounded-xl object-cover"
                        />
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{formatDateTime(comment.date)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-lg ${comment.status === 'approved'
                        ? 'bg-green-50 text-green-600'
                        : comment.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-600'
                          : 'bg-red-50 text-red-600'}`}
                        style={{ fontWeight: 500 }}>
                        {comment.status === 'approved' ? 'Опубликован' : comment.status === 'pending' ? 'На модерации' : 'Отклонён'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-gray-900 mb-5" style={{ fontWeight: 600 }}>Настройки профиля</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>Имя</label>
                <input
                  type="text"
                  defaultValue={currentUser.name}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>Email</label>
                <input
                  type="email"
                  defaultValue={currentUser.email}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>О себе</label>
                <textarea
                  defaultValue={currentUser.bio}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all resize-none"
                  placeholder="Расскажите о себе..."
                />
              </div>
              <button
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors"
                style={{ fontWeight: 500 }}
              >
                <Edit2 size={14} />
                Сохранить изменения
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
