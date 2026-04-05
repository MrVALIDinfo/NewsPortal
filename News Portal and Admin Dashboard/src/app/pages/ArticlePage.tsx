import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Clock, Eye, MessageCircle, Share2, Paperclip, Send, X, Image, ThumbsUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NewsCard, CategoryBadge } from '../components/NewsCard';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { articles, comments, addComment, currentUser, fetchCommentsForPost } = useApp();
  
  useEffect(() => {
    if (id) {
      fetchCommentsForPost(id);
    }
  }, [id, fetchCommentsForPost]);

  const article = articles.find(a => a.id === id);
  const articleComments = comments.filter(c => c.articleId === id && c.status === 'approved');
  const relatedArticles = articles.filter(a => a.id !== id && a.category === article?.category).slice(0, 3);

  const [commentText, setCommentText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Статья не найдена</p>
          <Link to="/" className="text-indigo-600 hover:underline">← На главную</Link>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachedImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const author = currentUser
      ? { userId: currentUser.id, userName: currentUser.name, userInitials: currentUser.initials, userColor: currentUser.color }
      : {
        userId: 'guest',
        userName: guestName || 'Гость',
        userInitials: (guestName || 'Г').charAt(0).toUpperCase(),
        userColor: '#9CA3AF',
      };

    await addComment({
      articleId: article.id,
      ...author,
      text: commentText,
      date: new Date().toISOString(),
      image: attachedImage || undefined,
    });

    setCommentText('');
    setAttachedImage(null);
    setGuestName('');
  };

  const paragraphs = article.content.trim().split('\n').filter(p => p.trim());

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Hero Image */}
      <div className="relative w-full bg-black" style={{ height: '520px' }}>
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-xl text-sm hover:bg-white/30 transition-colors"
          style={{ fontWeight: 500 }}
        >
          <ArrowLeft size={15} />
          Назад
        </button>

        {/* Article Meta on image */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-4xl mx-auto px-6 pb-8">
            <CategoryBadge category={article.category} />
            <h1 className="mt-3 text-white leading-tight" style={{ fontWeight: 800, fontSize: '2rem' }}>
              {article.title}
            </h1>
            <div className="mt-4 flex items-center gap-5 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: article.authorColor, fontSize: '11px', fontWeight: 700 }}
                >
                  {article.authorInitials}
                </div>
                <span style={{ fontWeight: 500 }}>{article.author}</span>
              </div>
              <span>{formatDate(article.date)}</span>
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>{article.readTime} мин чтения</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye size={14} />
                <span>{article.views.toLocaleString('ru')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex gap-8">
          {/* Main Article Content */}
          <article className="flex-1 min-w-0">
            {/* Excerpt */}
            <p className="text-gray-600 text-lg mb-8 pb-8 border-b border-gray-200" style={{ lineHeight: 1.7 }}>
              {article.excerpt}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs"
                  style={{ fontWeight: 500 }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Article Text */}
            <div className="prose max-w-none">
              {paragraphs.map((para, idx) => {
                if (para.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="text-gray-900 mt-8 mb-4" style={{ fontWeight: 700, fontSize: '1.3rem' }}>
                      {para.replace('## ', '')}
                    </h2>
                  );
                }
                return (
                  <p key={idx} className="text-gray-700 mb-5" style={{ lineHeight: 1.8, fontWeight: 400 }}>
                    {para}
                  </p>
                );
              })}
            </div>

            {/* Share */}
            <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Поделиться:</span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm hover:bg-indigo-100 transition-colors" style={{ fontWeight: 500 }}>
                  <Share2 size={14} />
                  Поделиться
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition-colors" style={{ fontWeight: 500 }}>
                  <ThumbsUp size={14} />
                  Нравится
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <section className="mt-10" id="comments">
              <div className="flex items-center gap-2 mb-6">
                <MessageCircle size={18} className="text-indigo-600" />
                <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  Комментарии ({articleComments.length})
                </h2>
              </div>

              {/* Comment Form */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
                <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 600 }}>
                  {currentUser ? `Комментировать как ${currentUser.name}` : 'Оставить комментарий'}
                </h3>

                {currentUser ? (
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: currentUser.color, fontSize: '12px', fontWeight: 700 }}
                    >
                      {currentUser.initials}
                    </div>
                    <div className="flex-1">
                      <form onSubmit={handleCommentSubmit}>
                        <textarea
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          placeholder="Напишите ваш комментарий..."
                          rows={3}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all resize-none"
                        />
                        {attachedImage && (
                          <div className="mt-2 relative inline-block">
                            <img src={attachedImage} alt="Прикреплено" className="h-24 rounded-xl object-cover" />
                            <button
                              type="button"
                              onClick={() => setAttachedImage(null)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                            style={{ fontWeight: 500 }}
                          >
                            <Image size={14} />
                            Прикрепить фото
                          </button>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                          <button
                            type="submit"
                            disabled={!commentText.trim()}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                            style={{ fontWeight: 500 }}
                          >
                            <Send size={13} />
                            Отправить
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCommentSubmit}>
                    <input
                      type="text"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="Ваше имя (необязательно)"
                      className="w-full px-4 py-2.5 mb-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                    <textarea
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Напишите ваш комментарий..."
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none"
                    />
                    {attachedImage && (
                      <div className="mt-2 relative inline-block">
                        <img src={attachedImage} alt="Прикреплено" className="h-24 rounded-xl object-cover" />
                        <button
                          type="button"
                          onClick={() => setAttachedImage(null)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                        style={{ fontWeight: 500 }}
                      >
                        <Image size={14} />
                        Прикрепить фото
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-sm disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                        style={{ fontWeight: 500 }}
                      >
                        <Send size={13} />
                        Отправить
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      <Link to="/login" className="text-indigo-600 hover:underline">Войдите</Link>, чтобы комментировать с вашим профилем
                    </p>
                  </form>
                )}
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {articleComments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">Будьте первым, кто оставит комментарий</p>
                  </div>
                ) : (
                  articleComments.map(comment => (
                    <div key={comment.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: comment.userColor, fontSize: '12px', fontWeight: 700 }}
                        >
                          {comment.userInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{comment.userName}</span>
                            <span className="text-xs text-gray-400">{formatDateTime(comment.date)}</span>
                          </div>
                          <p className="mt-1.5 text-sm text-gray-700" style={{ lineHeight: 1.6 }}>{comment.text}</p>
                          {comment.image && (
                            <img
                              src={comment.image}
                              alt="Прикреплённое изображение"
                              className="mt-3 max-h-48 rounded-xl object-cover"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 700 }}>Похожие материалы</h3>
              <div className="space-y-4">
                {relatedArticles.map(a => (
                  <NewsCard key={a.id} article={a} comments={comments} variant="compact" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
