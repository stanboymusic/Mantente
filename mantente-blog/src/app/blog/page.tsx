import Link from "next/link";
import { getAllArticles } from "@/lib/articles";

export const metadata = {
  title: "Blog Financiero - Mantente",
  description: "Artículos educativos sobre finanzas personales, presupuestos, ahorro e inversiones. Contenido gratuito para mejorar tus hábitos financieros.",
};

export default function BlogPage() {
  const articles = getAllArticles();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Blog Financiero
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:text-2xl">
            Educación financiera gratuita para mejorar tus hábitos con el dinero
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article key={article.slug} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
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
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {article.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4">
                  {article.excerpt}
                </p>
                <Link
                  href={`/blog/${article.slug}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Leer más →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Ad space */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow">
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