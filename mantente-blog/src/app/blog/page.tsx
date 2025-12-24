import Link from "next/link";
import { getAllArticles } from "@/lib/articles";

export const metadata = {
  title: "Blog Financiero - Mantente",
  description: "Artículos educativos sobre finanzas personales, presupuestos, ahorro e inversiones. Contenido gratuito para mejorar tus hábitos financieros.",
};

export default function BlogPage() {
  const articles = getAllArticles();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--mantente-bg-light)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <div className="blog-header">
          <h1 className="blog-title">Blog Financiero</h1>
          <p className="blog-subtitle">
            Educación financiera gratuita para mejorar tus hábitos con el dinero
          </p>
        </div>

        {/* Articles Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px',
          padding: '60px 0'
        }}>
          {articles.map((article) => (
            <article key={article.slug} className="article-card">
              <div style={{ padding: '24px' }}>
                <div className="article-meta" style={{ marginBottom: '12px' }}>
                  <time dateTime={article.date}>
                    {new Date(article.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <span style={{ margin: '0 8px' }}>•</span>
                  <span>{article.readTime} min de lectura</span>
                </div>
                <h2 style={{ marginBottom: '12px' }}>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="article-title"
                  >
                    {article.title}
                  </Link>
                </h2>
                <p className="article-excerpt" style={{ marginBottom: '16px' }}>
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
        <div style={{
          marginTop: '40px',
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
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