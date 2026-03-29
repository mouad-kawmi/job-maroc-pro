import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';
import { listBlogPosts } from '@/lib/content';

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
  tips: 'bg-yellow-50 text-yellow-700',
  default: 'bg-slate-100 text-slate-600',
};
const ARTICLES_PER_PAGE = 9;

type BlogCard = {
  slug: string;
  date: string;
  tags: string[];
  title: { ar: string; fr: string };
  excerpt: { ar: string; fr: string };
};

const STATIC_ARTICLES: BlogCard[] = [
  {
    slug: 'job-search-ads',
    date: '2025-03-22',
    tags: ['search', 'tips'],
    title: {
      ar: 'كيف تجد إعلانات التوظيف - JOB MAROC PRO',
      fr: "Comment trouver les annonces d'emploi",
    },
    excerpt: {
      ar: 'دليل شامل للعثور على أفضل عروض العمل في المغرب',
      fr: "Guide complet pour trouver les meilleures offres d'emploi",
    },
  },
  {
    slug: 'cv-writing',
    date: '2025-03-21',
    tags: ['cv', 'tips'],
    title: {
      ar: 'السيرة الذاتية - CV',
      fr: 'Le Curriculum Vitae',
    },
    excerpt: {
      ar: 'كيف تكتب سيرة ذاتية احترافية تفتح أمامك الأبواب',
      fr: 'Comment rediger un CV professionnel qui ouvre des portes',
    },
  },
  {
    slug: 'interview-tips',
    date: '2025-03-20',
    tags: ['interview'],
    title: {
      ar: 'المقابلة الشفهية',
      fr: "L'entretien d'embauche",
    },
    excerpt: {
      ar: 'نصائح ذهبية للنجاح في مقابلة العمل',
      fr: 'Conseils cles pour reussir votre entretien',
    },
  },
  {
    slug: 'sectors-2025',
    date: '2025-03-19',
    tags: ['search'],
    title: {
      ar: 'قطاعات التشغيل 2025',
      fr: "Secteurs de l'emploi 2025",
    },
    excerpt: {
      ar: 'أهم القطاعات التي توفر فرص عمل في المغرب',
      fr: 'Les secteurs qui recrutent le plus au Maroc',
    },
  },
  {
    slug: 'public-concours',
    date: '2025-03-18',
    tags: ['public'],
    title: {
      ar: 'مباراة الوظيفة العمومية',
      fr: 'Concours de la fonction publique',
    },
    excerpt: {
      ar: 'كل ما تحتاج معرفته عن المباريات العمومية',
      fr: "Tout ce qu'il faut savoir sur les concours publics",
    },
  },
  {
    slug: 'motivation-letter',
    date: '2025-03-17',
    tags: ['cv', 'tips'],
    title: {
      ar: 'رسالة التحفيز',
      fr: 'Lettre de motivation',
    },
    excerpt: {
      ar: 'كيف تكتب رسالة تحفيز تجذب أصحاب العمل',
      fr: "Comment rediger une lettre qui attire l'attention",
    },
  },
  {
    slug: 'linkedin-tips',
    date: '2025-03-16',
    tags: ['linkedin'],
    title: {
      ar: 'نصائح LinkedIn',
      fr: 'Conseils LinkedIn',
    },
    excerpt: {
      ar: 'كيف تبني حضورا قويا على لينكدإن',
      fr: 'Comment batir une presence forte sur LinkedIn',
    },
  },
  {
    slug: 'demand-jobs',
    date: '2025-03-15',
    tags: ['search'],
    title: {
      ar: 'أكثر المناصب طلبا 2025',
      fr: 'Metiers les plus demandes 2025',
    },
    excerpt: {
      ar: 'تعرف على المهن الأكثر طلبا في سوق العمل المغربي',
      fr: 'Decouvrez les metiers en forte demande au Maroc',
    },
  },
  {
    slug: 'employee-rights',
    date: '2025-03-14',
    tags: ['rights'],
    title: {
      ar: 'حقوق الموظف - SMIG/CNSS',
      fr: "Droits de l'employe",
    },
    excerpt: {
      ar: 'حقوقك كموظف وما يجب أن تعرفه قبل التوقيع',
      fr: "Vos droits en tant qu'employe au Maroc",
    },
  },
  {
    slug: 'anapec-services',
    date: '2025-03-13',
    tags: ['search'],
    title: {
      ar: 'خدمات ANAPEC',
      fr: "Services de l'ANAPEC",
    },
    excerpt: {
      ar: 'كيف تستفيد من خدمات وكالة التشغيل ANAPEC',
      fr: "Comment profiter des services de l'ANAPEC",
    },
  },
];

function mergeArticles(dynamicArticles: BlogCard[]): BlogCard[] {
  const merged = new Map<string, BlogCard>();

  [...dynamicArticles, ...STATIC_ARTICLES].forEach((article) => {
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
      subtitle: 'نصائح مهنية، أدلة عملية، وتحليلات سوق الشغل',
      readMore: 'اقرأ المقال',
    },
    fr: {
      title: 'Blog Emploi au Maroc',
      subtitle: 'Conseils pro, guides pratiques et analyses du marche',
      readMore: "Lire l'article",
    },
  }[lang];
  const pagination = lang === 'fr'
    ? {
        pageLabel: `Page ${currentPage} sur ${totalPages}`,
        previousPage: 'Precedent',
        nextPage: 'Suivant',
      }
    : {
        pageLabel: `ØµÙØ­Ø© ${currentPage} Ù…Ù† ${totalPages}`,
        previousPage: 'Ø§Ù„Ø³Ø§Ø¨Ù‚',
        nextPage: 'Ø§Ù„ØªØ§Ù„ÙŠ',
      };
  const safePagination =
    lang === 'fr'
      ? pagination
      : {
          pageLabel: `\u0635\u0641\u062d\u0629 ${currentPage} \u0645\u0646 ${totalPages}`,
          previousPage: '\u0627\u0644\u0633\u0627\u0628\u0642',
          nextPage: '\u0627\u0644\u062a\u0627\u0644\u064a',
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
                {safePagination.previousPage}
              </Link>
            )}
            <div className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white">
              {safePagination.pageLabel}
            </div>
            {currentPage < totalPages && (
              <Link
                href={`/blog?lang=${lang}&page=${currentPage + 1}`}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
              >
                {safePagination.nextPage}
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
