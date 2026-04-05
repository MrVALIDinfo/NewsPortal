import { useState } from 'react';
import { Link } from 'react-router';
import { Check, X, Trash2, Eye, Filter, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export function AdminModeration() {
  const { comments, articles, updateCommentStatus, deleteComment } = useApp();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = comments.filter(c => statusFilter === 'all' || c.status === statusFilter);

  const counts = {
    all: comments.length,
    pending: comments.filter(c => c.status === 'pending').length,
    approved: comments.filter(c => c.status === 'approved').length,
    rejected: comments.filter(c => c.status === 'rejected').length,
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      await deleteComment(id);
      toast.success('Комментарий удален');
    }
  };

  const filterTabs: { key: StatusFilter; label: string; icon: typeof Clock; color: string }[] = [
    { key: 'all', label: 'Все', icon: MessageSquare, color: '#6B7280' },
    { key: 'pending', label: 'На модерации', icon: Clock, color: '#D97706' },
    { key: 'approved', label: 'Одобренные', icon: CheckCircle, color: '#16A34A' },
    { key: 'rejected', label: 'Отклонённые', icon: XCircle, color: '#DC2626' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Модерация комментариев</h1>
        <p className="text-gray-500 text-sm mt-1">
          {counts.pending > 0 ? (
            <span className="text-amber-600" style={{ fontWeight: 500 }}>{counts.pending} комментариев ожидают проверки</span>
          ) : (
            'Все комментарии проверены'
          )}
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {filterTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${statusFilter === tab.key
                ? 'bg-white border-2 border-indigo-200 text-indigo-600 shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              style={{ fontWeight: 500 }}
            >
              <Icon size={14} style={{ color: statusFilter === tab.key ? '#4F46E5' : tab.color }} />
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded-lg text-xs ${statusFilter === tab.key ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}
                style={{ fontWeight: 600 }}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Comments List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
          <MessageSquare size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500" style={{ fontWeight: 500 }}>Комментариев не найдено</p>
          <p className="text-sm text-gray-400 mt-1">
            {statusFilter !== 'all' ? 'В этой категории нет комментариев' : 'Комментарии ещё не написаны'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(comment => {
            const article = articles.find(a => a.id === comment.articleId);
            return (
              <div
                key={comment.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all ${comment.status === 'pending'
                  ? 'border-amber-200 shadow-sm'
                  : comment.status === 'rejected'
                    ? 'border-red-100 opacity-75'
                    : 'border-gray-100'}`}
              >
                <div className="p-5">
                  {/* Article Reference */}
                  {article && (
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-0.5">{article.category}</p>
                        <Link
                          to={`/article/${article.id}`}
                          target="_blank"
                          className="text-xs text-gray-700 line-clamp-1 hover:text-indigo-600 transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          {article.title}
                        </Link>
                      </div>
                      {comment.status === 'pending' && (
                        <span className="flex-shrink-0 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-lg" style={{ fontWeight: 600 }}>
                          На проверке
                        </span>
                      )}
                    </div>
                  )}

                  {/* Comment Content */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: comment.userColor, fontSize: '12px', fontWeight: 700 }}
                    >
                      {comment.userInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{comment.userName}</span>
                        <span className="text-xs text-gray-400">{formatDateTime(comment.date)}</span>
                      </div>
                      <p className="text-sm text-gray-700" style={{ lineHeight: 1.6 }}>{comment.text}</p>
                      {comment.image && (
                        <img
                          src={comment.image}
                          alt="Прикреплённое"
                          className="mt-3 max-h-32 rounded-xl object-cover"
                        />
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {comment.status !== 'approved' && (
                        <button
                          onClick={() => updateCommentStatus(comment.id, 'approved')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-xl text-xs hover:bg-green-100 transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          <Check size={13} />
                          Одобрить
                        </button>
                      )}
                      {comment.status !== 'rejected' && (
                        <button
                          onClick={() => updateCommentStatus(comment.id, 'rejected')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs hover:bg-red-100 transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          <X size={13} />
                          Отклонить
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {article && (
                        <Link
                          to={`/article/${article.id}#comments`}
                          target="_blank"
                          className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Просмотреть в статье"
                        >
                          <Eye size={14} />
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className={`flex items-center gap-1 p-1.5 rounded-xl text-xs transition-colors ${confirmDelete === comment.id
                          ? 'bg-red-100 text-red-600'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                        title={confirmDelete === comment.id ? 'Нажмите ещё раз' : 'Удалить'}
                      >
                        <Trash2 size={14} />
                        {confirmDelete === comment.id && <span style={{ fontWeight: 500 }}>Удалить?</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
