import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Article, Comment, mockArticles, mockUsers, mockComments } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;

  articles: Article[];
  addArticle: (article: Omit<Article, 'id' | 'views'>) => Promise<boolean>;
  updateArticle: (id: string, article: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;

  comments: Comment[];
  addComment: (comment: Omit<Comment, 'id' | 'status'>, postId?: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  updateCommentStatus: (id: string, status: 'approved' | 'pending' | 'rejected') => Promise<void>;

  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  fetchCommentsForPost: (postId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const API_BASE = 'http://localhost:5000/api';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    // Получаем текущего пользователя при загрузке
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) setCurrentUser(data.user);
        } catch (err) {
          console.error('Failed to fetch user', err);
        }
      }
    };
    fetchMe();
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      let url = `${API_BASE}/posts?page=1&limit=50`;
      if (searchQuery) url += `&search=${searchQuery}`;
      if (selectedTag) url += `&tag=${selectedTag}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        const formattedArticles = data.data.map((p: any) => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt || p.content.slice(0, 100) + '...',
          content: p.content,
          image: p.imageUrl || '',
          category: p.category,
          tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
          date: p.createdAt,
          author: p.author?.name || 'Админ',
          authorInitials: p.author?.initials || 'АД',
          authorColor: p.author?.color || '#4F46E5',
          views: p.views,
          readTime: p.readTime || 5,
          featured: p.featured || false,
        }));
        setArticles(formattedArticles);
      }
    } catch (err) {
      console.error('Failed to fetch posts, using mock fallback', err);
      setArticles(mockArticles);
    }
  }, [searchQuery, selectedTag]);

  const fetchComments = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const formatted = data.data.map((c: any) => ({
          id: c.id,
          articleId: c.postId,
          userId: c.authorId || 'guest',
          userName: c.author?.name || c.guestName || 'Гость',
          userInitials: c.author?.initials || c.guestInitials || 'Г',
          userColor: c.author?.color || c.guestColor || '#9CA3AF',
          text: c.content,
          date: c.createdAt,
          image: c.imageUrl,
          status: c.status,
        }));
        setComments(formatted);
      }
    } catch (err) { console.error('Failed to fetch comments', err); }
  }, []);

  useEffect(() => {
    fetchPosts();
    // Fetch comments if user is admin
    if (currentUser?.role === 'admin') {
      fetchComments();
    }
  }, [fetchPosts, fetchComments, currentUser]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('token', data.token);
        return true;
      }
    } catch (err) { console.error(err); }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    setComments([]);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('token', data.token);
        return true;
      }
    } catch (err) { console.error(err); }
    return false;
  }, []);

  const getToken = () => localStorage.getItem('token');

  const addArticle = useCallback(async (article: Omit<Article, 'id' | 'views'>) => {
    try {
      const res = await fetch(`${API_BASE}/admin/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          imageUrl: article.image,
          category: article.category,
          tags: article.tags,
          readTime: article.readTime,
          featured: article.featured,
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchPosts();
        return true;
      } else {
        console.error('Validation errors:', data.errors || data.message);
      }
    } catch (err) { console.error(err); }
    return false;
  }, [fetchPosts]);

  const updateArticle = useCallback(async (id: string, updates: Partial<Article>) => {
    try {
      await fetch(`${API_BASE}/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          ...updates,
          imageUrl: updates.image, // Map image to imageUrl
          tags: updates.tags
        })
      });
      await fetchPosts();
    } catch (err) { console.error(err); }
  }, [fetchPosts]);

  const deleteArticle = useCallback(async (id: string) => {
    try {
      await fetch(`${API_BASE}/admin/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) { console.error(err); }
  }, []);

  const addComment = useCallback(async (comment: Omit<Comment, 'id' | 'status'>, postId?: string) => {
    const pId = postId || comment.articleId;
    if (!pId) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/posts/${pId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          content: comment.text,
          imageUrl: comment.image,
          guestName: comment.userName,
          guestInitials: comment.userInitials,
          guestColor: comment.userColor
        })
      });
      const data = await res.json();
      if (data.success) {
        if (currentUser?.role === 'admin') fetchComments();
        await fetchCommentsForPost(pId);
        await fetchPosts();
      }
    } catch (err) { console.error(err); }
  }, [fetchPosts, fetchComments, currentUser]);

  const deleteComment = useCallback(async (id: string) => {
    try {
      await fetch(`${API_BASE}/admin/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error(err); }
  }, []);

  const updateCommentStatus = useCallback(async (id: string, status: 'approved' | 'pending' | 'rejected') => {
    try {
      await fetch(`${API_BASE}/admin/comments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ status })
      });
      setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch (err) { console.error(err); }
  }, []);

  const fetchCommentsForPost = useCallback(async (postId: string) => {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`);
      const data = await res.json();
      if (data.success && data.data.comments) {
        const formatted = data.data.comments.map((c: any) => ({
          id: c.id,
          articleId: c.postId,
          userId: c.authorId || 'guest',
          userName: c.author?.name || c.guestName || 'Гость',
          userInitials: c.author?.initials || c.guestInitials || 'Г',
          userColor: c.author?.color || c.guestColor || '#9CA3AF',
          text: c.content,
          date: c.createdAt,
          image: c.imageUrl,
          status: c.status,
        }));
        setComments(prev => {
          const others = prev.filter(pc => pc.articleId !== postId);
          return [...others, ...formatted];
        });
      }
    } catch (err) { console.error('Failed to fetch comments for post', err); }
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, login, logout, register,
      articles, addArticle, updateArticle, deleteArticle,
      comments, addComment, deleteComment, updateCommentStatus,
      searchQuery, setSearchQuery,
      selectedTag, setSelectedTag,
      fetchCommentsForPost,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
