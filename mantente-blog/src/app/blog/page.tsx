import Link from "next/link";
import Image from "next/image";
import { getAllArticles } from "@/lib/articles";
import './BlogPage.css';

export const metadata = {
  title: "Blog Financiero - Mantente",
  description: "Artículos educativos sobre finanzas personales, presupuestos, ahorro e inversiones. Contenido gratuito para mejorar tus hábitos financieros.",
};

export default function BlogPage() {
  const articles = getAllArticles();

  return (
    <div className="blog-page-container">
      {/* Header with Logo */}
      <header className="blog-page-header">
        <div className="blog-page-header-content">
          <div className="blog-page-header-flex">
            <Link href="/" className="blog-page-logo-link">
              <Image
                src="/logo.png"
                alt="Mantente"
                width={120}
                height={40}
                className="blog-page-logo"
              />
            </Link>
            <Link
              href="/"
              className="btn-outline-mantente blog-page-back-link"
            >
              ← Volver al Inicio
            </Link>
          </div>
        </div>
      </header>

      <div className="blog-page-main">
        {/* Header */}
        <div className="blog-header">
          <h1 className="blog-title">Blog Financiero</h1>
          <p className="blog-subtitle">
            Educación financiera gratuita para mejorar tus hábitos con el dinero
          </p>
        </div>

        {/* Articles Grid */}
        <div className="blog-articles-grid">
          {articles.map((article) => (
            <article key={article.slug} className="article-card">
              <div className="blog-article-content">
                <div className="blog-article-meta">
                  <time dateTime={article.date}>
                    {new Date(article.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <span>•</span>
                  <span>{article.readTime} min de lectura</span>
                </div>
                <h2 className="blog-article-title">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="article-title"
                  >
                    {article.title}
                  </Link>
                </h2>
                <p className="article-excerpt blog-article-excerpt">
                  {article.excerpt}
                </p>
                <Link
                  href={`/blog/${article.slug}`}
                  className="article-link"
                >
                  Leer más →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Ad space */}
        <div className="blog-ad-space">
          <ins
            className="adsbygoogle blog-ad-ins"
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
            data-ad-slot="XXXXXXXXXX"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  );
}