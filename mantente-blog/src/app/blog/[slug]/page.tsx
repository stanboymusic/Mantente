import { notFound } from "next/navigation";
import Link from "next/link";
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <article className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8 sm:px-8">
            <div className="mb-6">
              <Link
                href="/blog"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Volver al blog
              </Link>
            </div>

            <header className="mb-8">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <time dateTime={article.date}>
                  {new Date(article.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
                <span className="mx-2">•</span>
                <span>{article.readTime} min de lectura</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
                {article.title}
              </h1>
              <p className="text-xl text-gray-600">
                {article.excerpt}
              </p>
            </header>

            {/* Ad space before content */}
            <div className="mb-8">
              <ins
                className="adsbygoogle"
                style={{ display: 'block', textAlign: 'center' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>

            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: article.content
                  .split('\n')
                  .map(paragraph => paragraph.startsWith('#') ?
                    `<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">${paragraph.replace('#', '').trim()}</h2>` :
                    paragraph.startsWith('##') ?
                    `<h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">${paragraph.replace('##', '').trim()}</h3>` :
                    paragraph.startsWith('###') ?
                    `<h4 class="text-lg font-medium text-gray-900 mt-4 mb-2">${paragraph.replace('###', '').trim()}</h4>` :
                    paragraph.startsWith('-') ?
                    `<ul class="list-disc list-inside mb-4"><li>${paragraph.replace('-', '').trim()}</li></ul>` :
                    paragraph.trim() ? `<p class="mb-4 text-gray-700 leading-relaxed">${paragraph.trim()}</p>` : ''
                  )
                  .join('')
              }}
            />

            {/* Ad space after content */}
            <div className="mt-8">
              <ins
                className="adsbygoogle"
                style={{ display: 'block', textAlign: 'center' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          </div>
        </article>

        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver más artículos →
          </Link>
        </div>
      </div>
    </div>
  );
}