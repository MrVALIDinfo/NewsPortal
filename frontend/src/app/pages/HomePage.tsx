import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { TrendingUp, Tag, ChevronRight, Search, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NewsCard, CategoryBadge } from '../components/NewsCard';
import { CATEGORIES, TAGS } from '../data/mockData';

export function HomePage() {
  const { articles, comments, searchQuery, setSearchQuery, selectedTag, setSelectedTag } = useApp();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const filteredArticles = useMemo(() => {
    let result = [...articles];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
    if (activeCategory) {
      result = result.filter(a => a.category === activeCategory);
    }
    if (selectedTag) {
      result = result.filter(a => a.tags.includes(selectedTag));
    }
    return result;
  }, [articles, searchQuery, activeCategory, selectedTag]);

  const featuredArticle = articles.find(a => a.featured) || articles[0];
  const popularArticles = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);
  const gridArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
      setActiveCategory(null);
    }
  };

  const handleCategoryClick = (cat: string) => {
    if (activeCategory === cat) {
      setActiveCategory(null);
    } else {
      setActiveCategory(cat);
      setSelectedTag(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Hero / Featured */}
      {!searchQuery && !activeCategory && !selectedTag && featuredArticle && (
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <NewsCard article={featuredArticle} comments={comments} variant="featured" />
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Filters */}
            <div className="mb-6">
              {/* Category Pills */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <button
                  onClick={() => { setActiveCategory(null); setSelectedTag(null); setSearchQuery(''); setLocalSearch(''); }}
                  className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${!activeCategory && !selectedTag && !searchQuery
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                  style={{ fontWeight: 500 }}
                >
                  Все
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${activeCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                    style={{ fontWeight: 500 }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search inline */}
              <form onSubmit={handleSearchSubmit} className="relative sm:w-80">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all"
                />
              </form>
            </div>

            {/* Status line */}
            {(searchQuery || activeCategory || selectedTag) && (
              <div className="mb-4 flex items-center gap-2">
                <p className="text-sm text-gray-500">
                  Найдено: <span className="text-gray-900" style={{ fontWeight: 600 }}>{filteredArticles.length}</span> материалов
                  {searchQuery && <> по запросу «<span className="text-indigo-600">{searchQuery}</span>»</>}
                  {activeCategory && <> в категории «<span className="text-indigo-600">{activeCategory}</span>»</>}
                  {selectedTag && <> с тегом «<span className="text-indigo-600">{selectedTag}</span>»</>}
                </p>
                <button
                  onClick={() => { setActiveCategory(null); setSelectedTag(null); setSearchQuery(''); setLocalSearch(''); }}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Сбросить
                </button>
              </div>
            )}

            {/* Grid Section Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.2rem' }}>
                {activeCategory || selectedTag ? 'Результаты' : 'Последние новости'}
              </h2>
              <span className="text-sm text-gray-400">{gridArticles.length} материалов</span>
            </div>

            {/* Articles Grid */}
            {gridArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {gridArticles.map(article => (
                  <NewsCard key={article.id} article={article} comments={comments} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Search size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500">Ничего не найдено</p>
                <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры поиска</p>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="hidden xl:block w-72 flex-shrink-0">
            {/* Popular */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-indigo-600" />
                <h3 className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>Популярное</h3>
              </div>
              <div className="space-y-4">
                {popularArticles.map((article, idx) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.id}`}
                    className="flex items-start gap-3 group"
                  >
                    <span
                      className="text-2xl flex-shrink-0 leading-none mt-0.5"
                      style={{ fontWeight: 800, color: idx === 0 ? '#4F46E5' : '#E5E7EB' }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors" style={{ fontWeight: 500 }}>
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{(article.views / 1000).toFixed(1)}k просмотров</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={16} className="text-indigo-600" />
                <h3 className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>Теги</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${selectedTag === tag
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
                    style={{ fontWeight: 500 }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-indigo-600 rounded-2xl p-5 text-white">
              <h3 className="text-sm" style={{ fontWeight: 700 }}>Подпишитесь на новости</h3>
              <p className="text-xs text-indigo-200 mt-1 mb-3">Получайте лучшие материалы прямо на почту</p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none"
                  style={{ fontWeight: 400 }}
                />
                <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-indigo-600 rounded-xl text-sm transition-colors hover:bg-indigo-50" style={{ fontWeight: 600 }}>
                  Подписаться
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
