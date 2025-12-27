import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from 'react-markdown';
import { getArticleBySlug, getAllArticles } from "@/lib/articles";
import './ArticlePage.css';

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
  const { slug } = await params;
  const article = getArticleBySlug(slug);

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

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="article-page-container">
      {/* Header with Logo */}
      <header className="article-page-header">
        <div className="article-page-header-content">
          <div className="article-page-header-flex">
            <Link href="/" className="article-page-logo-link">
              <Image
                src="/logo.png"
                alt="Mantente"
                width={120}
                height={40}
                className="article-page-logo"
              />
            </Link>
            <Link
              href="/blog"
              className="btn-outline-mantente article-page-back-link"
            >
              ← Volver al Blog
            </Link>
          </div>
        </div>
      </header>

      <div className="article-page-main">
        <article className="article-container">
          <div className="article-content">
            <div className="article-back-link">
              <Link
                href="/blog"
                className="article-link"
              >
                ← Volver al blog
              </Link>
            </div>

            <header className="article-header">
              <div className="article-meta">
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
              <h1 className="article-title">
                {article.title}
              </h1>
              <p className="article-excerpt">
                {article.excerpt}
              </p>
            </header>

            {/* Ad space before content */}
            <div className="article-ad-space">
              <ins
                className="adsbygoogle article-ad-ins"
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>

            <div className="article-body">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="article-body h1">{children}</h1>,
                  h2: ({ children }) => <h2 className="article-body h2">{children}</h2>,
                  h3: ({ children }) => <h3 className="article-body h3">{children}</h3>,
                  h4: ({ children }) => <h4 className="article-body h4">{children}</h4>,
                  p: ({ children }) => <p className="article-body p">{children}</p>,
                  ul: ({ children }) => <ul className="article-body ul">{children}</ul>,
                  li: ({ children }) => <li className="article-body li">{children}</li>,
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>

            {/* Ad space after content */}
            <div className="article-ad-after">
              <ins
                className="adsbygoogle article-ad-ins"
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          </div>
        </article>

        <div className="article-footer">
          <Link
            href="/blog"
            className="article-link article-footer-link"
          >
            Ver más artículos →
          </Link>
        </div>
      </div>
    </div>
  );
}