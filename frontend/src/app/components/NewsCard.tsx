import { Link } from 'react-router';
import { Clock, Eye, MessageCircle } from 'lucide-react';
import { Article, Comment } from '../data/mockData';

interface NewsCardProps {
  article: Article;
  comments: Comment[];
  variant?: 'default' | 'featured' | 'compact';
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatViews(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Технологии': { bg: '#EEF2FF', text: '#4F46E5' },
  'Бизнес': { bg: '#FFF7ED', text: '#EA580C' },
  'Наука': { bg: '#F0FDF4', text: '#16A34A' },
  'Экология': { bg: '#ECFDF5', text: '#059669' },
  'Здоровье': { bg: '#FFF1F2', text: '#E11D48' },
  'Спорт': { bg: '#F0F9FF', text: '#0284C7' },
  'Кибербезопасность': { bg: '#FDF4FF', text: '#9333EA' },
  'Транспорт': { bg: '#FFFBEB', text: '#D97706' },
};

export function CategoryBadge({ category }: { category: string }) {
  const colors = CATEGORY_COLORS[category] || { bg: '#F3F4F6', text: '#6B7280' };
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-lg text-xs"
      style={{ backgroundColor: colors.bg, color: colors.text, fontWeight: 600 }}
    >
      {category}
    </span>
  );
}

export function NewsCard({ article, comments, variant = 'default' }: NewsCardProps) {
  const articleComments = comments.filter(c => c.articleId === article.id && c.status === 'approved');

  if (variant === 'featured') {
    return (
      <Link to={`/article/${article.id}`} className="group block">
        <div className="relative rounded-2xl overflow-hidden" style={{ height: '480px' }}>
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <CategoryBadge category={article.category} />
            <h2 className="mt-3 text-white text-3xl leading-tight group-hover:text-indigo-200 transition-colors" style={{ fontWeight: 700 }}>
              {article.title}
            </h2>
            <p className="mt-2 text-gray-300 text-sm line-clamp-2" style={{ fontWeight: 400 }}>
              {article.excerpt}
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: article.authorColor, fontSize: '9px', fontWeight: 700 }}
                >
                  {article.authorInitials}
                </div>
                <span>{article.author}</span>
              </div>
              <span>{formatDate(article.date)}</span>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{article.readTime} мин</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={12} />
                <span>{formatViews(article.views)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/article/${article.id}`} className="group flex items-start gap-3">
        <img
          src={article.image}
          alt={article.title}
          className="w-20 h-16 rounded-xl object-cover flex-shrink-0 group-hover:opacity-90 transition-opacity"
        />
        <div className="flex-1 min-w-0">
          <CategoryBadge category={article.category} />
          <h4 className="mt-1 text-gray-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors" style={{ fontWeight: 600 }}>
            {article.title}
          </h4>
          <p className="mt-1 text-xs text-gray-400">{formatDate(article.date)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.id}`} className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300">
      <div className="relative overflow-hidden" style={{ height: '200px' }}>
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <CategoryBadge category={article.category} />
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors" style={{ fontWeight: 600 }}>
          {article.title}
        </h3>
        <p className="mt-2 text-gray-500 text-sm line-clamp-2" style={{ fontWeight: 400 }}>
          {article.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: article.authorColor, fontSize: '10px', fontWeight: 700 }}
            >
              {article.authorInitials}
            </div>
            <span className="text-xs text-gray-500">{formatDate(article.date)}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{article.readTime} мин</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={12} />
              <span>{articleComments.length}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
