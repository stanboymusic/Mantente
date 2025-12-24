import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getArticleBySlug, getAllArticles } from "@/lib/articles";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Artículo no encontrado",
    };
  }

  return {
    title: `${article.title} - Blog Financiero Mantente`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.date,
    },
  };
}

export default function ArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--mantente-bg-light)' }}>
      {/* Header with Logo */}
      <header style={{
        backgroundColor: 'var(--mantente-white)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Image
                src="/logo.png"
                alt="Mantente"
                width={120}
                height={40}
                style={{ objectFit: 'contain' }}
              />
            </Link>
            <Link
              href="/blog"
              className="btn-outline-mantente"
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
              ← Volver al Blog
            </Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <article style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          marginTop: '40px'
        }}>
          <div style={{ padding: '40px' }}>
            <div style={{ marginBottom: '24px' }}>
              <Link
                href="/blog"
                style={{
                  color: 'var(--mantente-primary)',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                ← Volver al blog
              </Link>
            </div>

            <header style={{ marginBottom: '32px' }}>
              <div className="article-meta" style={{ marginBottom: '16px' }}>
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
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: 'var(--mantente-dark-gray)',
                marginBottom: '16px',
                fontFamily: "'Montserrat', sans-serif",
                lineHeight: '1.2'
              }}>
                {article.title}
              </h1>
              <p style={{
                fontSize: '1.25rem',
                color: 'var(--mantente-gray)',
                lineHeight: '1.6'
              }}>
                {article.excerpt}
              </p>
            </header>

            {/* Ad space before content */}
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>

            <div
              style={{
                fontFamily: "'Open Sans', sans-serif",
                lineHeight: '1.8',
                color: 'var(--mantente-dark-gray)'
              }}
              dangerouslySetInnerHTML={{
                __html: article.content
                  .split('\n')
                  .map(paragraph => paragraph.startsWith('#') ?
                    `<h2 style="font-size: 1.875rem; font-weight: bold; color: var(--mantente-dark-gray); margin-top: 2rem; margin-bottom: 1rem; font-family: 'Montserrat', sans-serif;">${paragraph.replace('#', '').trim()}</h2>` :
                    paragraph.startsWith('##') ?
                    `<h3 style="font-size: 1.5rem; font-weight: 600; color: var(--mantente-dark-gray); margin-top: 1.5rem; margin-bottom: 0.75rem; font-family: 'Montserrat', sans-serif;">${paragraph.replace('##', '').trim()}</h3>` :
                    paragraph.startsWith('###') ?
                    `<h4 style="font-size: 1.25rem; font-weight: 500; color: var(--mantente-dark-gray); margin-top: 1rem; margin-bottom: 0.5rem; font-family: 'Montserrat', sans-serif;">${paragraph.replace('###', '').trim()}</h4>` :
                    paragraph.startsWith('-') ?
                    `<ul style="list-style-type: disc; list-style-position: inside; margin-bottom: 1rem;"><li>${paragraph.replace('-', '').trim()}</li></ul>` :
                    paragraph.trim() ? `<p style="margin-bottom: 1rem; color: var(--mantente-gray); line-height: 1.7;">${paragraph.trim()}</p>` : ''
                  )
                  .join('')
              }}
            />

            {/* Ad space after content */}
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
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
        </article>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link
            href="/blog"
            className="article-link"
            style={{ fontSize: '1.125rem' }}
          >
            Ver más artículos →
          </Link>
        </div>
      </div>
    </div>
  );
}