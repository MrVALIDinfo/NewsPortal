import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Save, X, Upload, Bold, Italic, List, Heading2,
  Eye, ArrowLeft, Image, Link2, Quote
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, TAGS } from '../../data/mockData';

export function AdminCreatePost() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { articles, addArticle, updateArticle, currentUser } = useApp();
  const isEditing = Boolean(id);
  const existingArticle = id ? articles.find(a => a.id === id) : null;

  const [title, setTitle] = useState(existingArticle?.title || '');
  const [excerpt, setExcerpt] = useState(existingArticle?.excerpt || '');
  const [content, setContent] = useState(existingArticle?.content || '');
  const [category, setCategory] = useState(existingArticle?.category || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(existingArticle?.tags || []);
  const [imageUrl, setImageUrl] = useState(existingArticle?.image || '');
  const [readTime, setReadTime] = useState(existingArticle?.readTime || 5);
  const [featured, setFeatured] = useState(existingArticle?.featured || false);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);
    const newContent = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**'), title: 'Жирный' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), title: 'Курсив' },
    { icon: Heading2, action: () => insertMarkdown('\n## '), title: 'Заголовок' },
    { icon: List, action: () => insertMarkdown('\n- '), title: 'Список' },
    { icon: Quote, action: () => insertMarkdown('\n> '), title: 'Цитата' },
    { icon: Link2, action: () => insertMarkdown('[текст](', ')'), title: 'Ссылка' },
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!title || title.length < 5) {
      alert('Заголовок статьи должен содержать минимум 5 символов');
      return;
    }
    if (!content || content.length < 10) {
      alert('Текст статьи должен содержать минимум 10 символов');
      return;
    }
    if (!category) {
      alert('Пожалуйста, выберите категорию для статьи');
      return;
    }

    const articleData = {
      title,
      excerpt: excerpt || content.slice(0, 200).trim() + '...',
      content,
      category,
      tags: selectedTags,
      image: imageUrl,
      readTime: Math.ceil(content.length / 1500) || 5,
      featured,
      date: new Date().toISOString(),
      author: currentUser.name,
      authorInitials: currentUser.initials,
      authorColor: currentUser.color,
    };

    let success = false;
    if (isEditing && id) {
      await updateArticle(id, articleData);
      success = true; // updateArticle currently doesn't return boolean, assuming success for now
    } else {
      success = await addArticle(articleData);
    }

    if (success) {
      setSaved(true);
      setTimeout(() => {
        navigate('/admin/posts');
      }, 800);
    } else {
      alert('Ошибка при создании статьи. Проверьте консоль браузера или бэкенда.');
    }
  };

  const renderPreview = () => {
    return content.split('\n').filter(p => p.trim()).map((para, idx) => {
      if (para.startsWith('## ')) {
        return <h2 key={idx} style={{ fontWeight: 700, fontSize: '1.2rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#111827' }}>{para.replace('## ', '')}</h2>;
      }
      if (para.startsWith('> ')) {
        return <blockquote key={idx} style={{ borderLeft: '3px solid #4F46E5', paddingLeft: '1rem', color: '#6B7280', fontStyle: 'italic', margin: '1rem 0' }}>{para.replace('> ', '')}</blockquote>;
      }
      if (para.startsWith('- ')) {
        return <li key={idx} style={{ color: '#374151', marginLeft: '1rem', marginBottom: '0.25rem' }}>{para.replace('- ', '')}</li>;
      }
      return <p key={idx} style={{ color: '#374151', lineHeight: 1.8, marginBottom: '1rem', fontWeight: 400 }}>{para}</p>;
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/posts')}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.5rem' }}>
              {isEditing ? 'Редактировать статью' : 'Новая статья'}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isEditing ? existingArticle?.title : 'Создайте новый материал'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${preview
              ? 'bg-indigo-50 text-indigo-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            style={{ fontWeight: 500 }}
          >
            <Eye size={14} />
            {preview ? 'Редактор' : 'Предпросмотр'}
          </button>
          <button
            form="post-form"
            type="submit"
            disabled={saved}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${saved
              ? 'bg-green-500 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            style={{ fontWeight: 500 }}
          >
            <Save size={14} />
            {saved ? 'Сохранено!' : isEditing ? 'Обновить' : 'Опубликовать'}
          </button>
        </div>
      </div>

      <form id="post-form" onSubmit={handleSubmit}>
        <div className="flex gap-6">
          {/* Left: Editor */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Title */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Заголовок статьи..."
                required
                className="w-full text-gray-900 bg-transparent outline-none placeholder-gray-300"
                style={{ fontWeight: 700, fontSize: '1.4rem', fontFamily: "'Inter', sans-serif" }}
              />

              <textarea
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="Краткое описание / подзаголовок (необязательно)..."
                rows={2}
                className="w-full mt-3 text-gray-500 bg-transparent outline-none resize-none placeholder-gray-300 text-sm"
                style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}
              />
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Toolbar */}
              {!preview && (
                <div className="flex items-center gap-1 px-4 py-2.5 border-b border-gray-100">
                  {toolbarButtons.map((btn, idx) => {
                    const Icon = btn.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={btn.action}
                        title={btn.title}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        <Icon size={15} />
                      </button>
                    );
                  })}
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
                    <span>{content.length} символов</span>
                  </div>
                </div>
              )}

              {preview ? (
                <div className="p-6 min-h-96">
                  {title && <h1 style={{ fontWeight: 800, fontSize: '1.8rem', color: '#111827', marginBottom: '1rem' }}>{title}</h1>}
                  {excerpt && <p style={{ color: '#6B7280', fontSize: '1.05rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>{excerpt}</p>}
                  <div>{renderPreview()}</div>
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Начните писать статью...&#10;&#10;Используйте ## для заголовков&#10;Используйте ** текст ** для жирного&#10;Используйте - для списков"
                  required
                  className="w-full p-5 text-gray-700 bg-transparent outline-none resize-none placeholder-gray-300 text-sm"
                  style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.8, minHeight: '400px' }}
                />
              )}
            </div>
          </div>

          {/* Right: Settings Panel */}
          <div className="w-72 flex-shrink-0 space-y-4">
            {/* Cover Image */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-gray-900 text-sm mb-3" style={{ fontWeight: 600 }}>Обложка статьи</h3>
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Обложка"
                    className="w-full h-36 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-lg flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                  <Image size={20} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400 mb-2">Вставьте URL изображения</p>
                </div>
              )}
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                required
                className="w-full mt-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {/* Category */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-gray-900 text-sm mb-3" style={{ fontWeight: 600 }}>Категория</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2 py-1.5 rounded-xl text-xs transition-colors ${category === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    style={{ fontWeight: 500 }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {!category && (
                <p className="text-xs text-red-500 mt-2">Выберите категорию</p>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-gray-900 text-sm mb-3" style={{ fontWeight: 600 }}>Теги</h3>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-2 py-1 rounded-lg text-xs transition-colors ${selectedTags.includes(tag)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    style={{ fontWeight: 500 }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-gray-900 text-sm mb-3" style={{ fontWeight: 600 }}>Настройки</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5" style={{ fontWeight: 500 }}>
                    Время чтения (мин)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={readTime}
                    onChange={e => setReadTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-700" style={{ fontWeight: 500 }}>Главная новость</p>
                    <p className="text-xs text-gray-400">Отображать первой на главной</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeatured(!featured)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${featured ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${featured ? 'translate-x-5' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
