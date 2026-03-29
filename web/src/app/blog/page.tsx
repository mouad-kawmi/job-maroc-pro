import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';
import { listBlogPosts } from '@/lib/content';
import { STATIC_BLOG_CARDS, type StaticBlogCard } from '@/lib/blog-static';

function AdSpot({
  label,
  height = 'min-h-[90px]',
}: {
  label: string;
  height?: string;
}) {
  return <AdSlot label={label} heightClassName={height} />;
}

const TAG_COLORS: Record<string, string> = {
  cv: 'bg-purple-50 text-purple-700',
  interview: 'bg-orange-50 text-orange-700',
  public: 'bg-blue-50 text-blue-700',
  search: 'bg-green-50 text-green-700',
  linkedin: 'bg-sky-50 text-sky-700',
  rights: 'bg-red-50 text-red-700',
  safety: 'bg-rose-50 text-rose-700',
  contract: 'bg-indigo-50 text-indigo-700',
  tips: 'bg-yellow-50 text-yellow-700',
  default: 'bg-slate-100 text-slate-600',
};

const ARTICLES_PER_PAGE = 9;

type BlogCard = StaticBlogCard;

function mergeArticles(dynamicArticles: BlogCard[]): BlogCard[] {
  const merged = new Map<string, BlogCard>();

  [...dynamicArticles, ...STATIC_BLOG_CARDS].forEach((article) => {
    if (!merged.has(article.slug)) {
      merged.set(article.slug, article);
    }
  });

  return [...merged.values()].sort((left, right) =>
    right.date.localeCompare(left.date),
  );
}

export default async function Blog(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as 'ar' | 'fr';
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const dynamicArticles = (await listBlogPosts()).map<BlogCard>((post) => ({
    slug: post.slug,
    date: post.date,
    tags: post.tags.length > 0 ? post.tags : ['default'],
    title: {
      ar: post.titleAr,
      fr: post.titleFr,
    },
    excerpt: {
      ar: post.excerptAr,
      fr: post.excerptFr,
    },
  }));

  const articles = mergeArticles(dynamicArticles);
  const totalPages = Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedArticles = articles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE,
  );

  const t = {
    ar: {
      title: 'مدونة التوظيف في المغرب',
      subtitle: 'نصائح مهنية، دلائل عملية، ومقالات أصلية تساعدك في البحث عن العمل',
      readMore: 'اقرأ المقال',
    },
    fr: {
      title: 'Blog Emploi au Maroc',
      subtitle:
        'Conseils pro, guides pratiques et articles originaux pour mieux chercher un emploi',
      readMore: "Lire l'article",
    },
  }[lang];

  const pagination =
    lang === 'fr'
      ? {
          pageLabel: `Page ${currentPage} sur ${totalPages}`,
          previousPage: 'Precedent',
          nextPage: 'Suivant',
        }
      : {
          pageLabel: `صفحة ${currentPage} من ${totalPages}`,
          previousPage: 'السابق',
          nextPage: 'التالي',
        };

  return (
    <div
      className="min-h-screen font-sans flex flex-col"
      style={{ background: '#f1f5f9' }}
      dir={dir}
    >
      <Navbar lang={lang} />

      <div className="bg-gradient-to-br from-[#0f2167] to-[#1a3a8f] px-4 py-12 text-white">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold">
            {lang === 'ar' ? 'نصائح ومقالات مهنية' : 'Conseils et articles pro'}
          </div>
          <h1 className="mb-3 text-3xl font-black md:text-4xl">{t.title}</h1>
          <p className="text-base text-blue-200">{t.subtitle}</p>
        </div>
      </div>

      <div className="container mx-auto mt-6 max-w-5xl px-4">
        <AdSpot label="728x90 - Leaderboard (Top of Blog)" />
      </div>

      <main className="container mx-auto max-w-5xl flex-grow px-4 py-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {paginatedArticles.map((article, index) => {
            const firstTag = article.tags[0] || 'default';
            const tagColor = TAG_COLORS[firstTag] || TAG_COLORS.default;

            return (
              <React.Fragment key={article.slug}>
                {index === 6 && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <AdSpot label="728x90 - In-Feed Ad (After 6th Article)" />
                  </div>
                )}
                <Link
                  href={`/blog/${article.slug}?lang=${lang}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:border-blue-400 hover:shadow-lg"
                >
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-green-500" />
                  <div className="flex flex-grow flex-col p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${tagColor}`}
                      >
                        {firstTag}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {article.date}
                      </span>
                    </div>
                    <h2 className="mb-2 flex-grow text-base font-black leading-snug text-slate-900 transition-colors group-hover:text-blue-700">
                      {article.title[lang]}
                    </h2>
                    <p className="mb-4 text-xs leading-relaxed text-slate-500">
                      {article.excerpt[lang]}
                    </p>
                    <span className="text-xs font-black uppercase tracking-wider text-blue-600 group-hover:underline">
                      {t.readMore} →
                    </span>
                  </div>
                </Link>
              </React.Fragment>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {currentPage > 1 && (
              <Link
                href={`/blog?lang=${lang}&page=${currentPage - 1}`}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
              >
                {pagination.previousPage}
              </Link>
            )}
            <div className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white">
              {pagination.pageLabel}
            </div>
            {currentPage < totalPages && (
              <Link
                href={`/blog?lang=${lang}&page=${currentPage + 1}`}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
              >
                {pagination.nextPage}
              </Link>
            )}
          </div>
        )}
      </main>

      <div className="container mx-auto mb-12 max-w-5xl px-4">
        <AdSpot label="728x90 - Footer Banner (Before Footer)" />
      </div>

      <Footer lang={lang} />
    </div>
  );
}
