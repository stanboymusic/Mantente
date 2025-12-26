'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';
import './AdminDashboard.css';

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: number;
}

// Dynamically import the editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    date: '',
    readTime: 0
  });
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    // Load articles on client side
    const loadArticles = async () => {
      try {
        const response = await fetch('/api/admin/get-articles');
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles);
        }
      } catch (error) {
        console.error('Error loading articles:', error);
      }
    };
    loadArticles();
  }, []);

  const handleNewArticle = () => {
    setSelectedArticle(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      readTime: 5
    });
    setIsEditing(true);
  };

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      date: article.date,
      readTime: article.readTime
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const saveResponse = await fetch('/api/admin/save-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          slug: selectedArticle?.slug
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save article');
      }

      // Reload articles
      const getResponse = await fetch('/api/admin/get-articles');
      if (getResponse.ok) {
        const data = await getResponse.json();
        setArticles(data.articles);
      }

      setIsEditing(false);
      setSelectedArticle(null);
      alert('Artículo guardado exitosamente');
    } catch (error) {
      alert('Error al guardar el artículo');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedArticle(null);
  };

  if (isEditing) {
    return (
      <div className="admin-container">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-content">
            <div className="admin-header-flex">
              <Link href="/" className="admin-logo-link">
                <Image
                  src="/logo.png"
                  alt="Mantente"
                  width={120}
                  height={40}
                  className="admin-logo"
                />
              </Link>
              <div className="admin-buttons">
                <button
                  onClick={() => setPreview(!preview)}
                  className="btn-preview"
                >
                  {preview ? 'Editar' : 'Vista Previa'}
                </button>
                <button
                  onClick={handleSave}
                  className="btn-save"
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-main">
          {preview ? (
            <div className="preview-container">
              <h1 className="preview-title">
                {formData.title}
              </h1>
              <p className="preview-excerpt">
                {formData.excerpt}
              </p>
              <div className="preview-content">
                <ReactMarkdown>{formData.content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="edit-form">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Título
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Ingresa el título del artículo"
                  title="Título del artículo"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="excerpt" className="form-label">
                  Extracto
                </label>
                <textarea
                  id="excerpt"
                  placeholder="Ingresa un breve resumen del artículo"
                  title="Extracto del artículo"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date" className="form-label">
                  Fecha
                </label>
                <input
                  id="date"
                  type="date"
                  placeholder="Selecciona la fecha de publicación"
                  title="Fecha de publicación del artículo"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="form-input-small"
                />
              </div>

              <div className="form-group">
                <label htmlFor="readTime" className="form-label">
                  Tiempo de lectura (minutos)
                </label>
                <input
                  id="readTime"
                  type="number"
                  placeholder="Ingresa el tiempo estimado de lectura"
                  title="Tiempo de lectura en minutos"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 0 })}
                  className="form-input-small"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Contenido (Markdown)
                </label>
                <MDEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value || '' })}
                  preview="edit"
                  hideToolbar={false}
                  height={400}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-flex">
            <Link href="/" className="admin-logo-link">
              <Image
                src="/logo.png"
                alt="Mantente"
                width={120}
                height={40}
                className="admin-logo"
              />
            </Link>
            <div className="admin-buttons">
              <button
                onClick={handleNewArticle}
                className="btn-new-article"
              >
                Nuevo Artículo
              </button>
              <Link
                href="/blog"
                className="btn-view-blog"
              >
                Ver Blog
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-main">
        <h1 className="admin-title">
          Panel de Administración - Artículos
        </h1>

        <div className="articles-grid">
          {articles.map((article) => (
            <div
              key={article.slug}
              className="article-card"
              onClick={() => handleEditArticle(article)}
            >
              <h3 className="article-card-title">
                {article.title}
              </h3>
              <p className="article-card-excerpt">
                {article.excerpt}
              </p>
              <div className="article-card-meta">
                {new Date(article.date).toLocaleDateString('es-ES')} • {article.readTime} min
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}