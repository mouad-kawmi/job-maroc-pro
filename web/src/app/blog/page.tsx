import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';

function AdSpot({ label, height = 'min-h-[90px]' }: { label: string, height?: string }) {
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

export default async function Blog(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as 'ar' | 'fr';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const articles = [
    { slug: 'job-search-ads', date: '2025-03-22', tags: ['search', 'tips'], title: { ar: 'كيف تجد إعلانات التوظيف - JOB MAROC PRO', fr: 'Comment trouver les annonces d\'emploi' }, excerpt: { ar: 'دليل شامل للعثور على أفضل عروض العمل في المغرب', fr: 'Guide complet pour trouver les meilleures offres d\'emploi' } },
    { slug: 'cv-writing', date: '2025-03-21', tags: ['cv', 'tips'], title: { ar: 'السيرة الذاتية - CV', fr: 'Le Curriculum Vitae' }, excerpt: { ar: 'كيف تكتب سيرة ذاتية احترافية تفتح أمامك الأبواب', fr: 'Comment rédiger un CV professionnel qui ouvre des portes' } },
    { slug: 'interview-tips', date: '2025-03-20', tags: ['interview'], title: { ar: 'المقابلة الشفهية', fr: 'L\'entretien d\'embauche' }, excerpt: { ar: 'نصائح ذهبية للنجاح في مقابلة العمل', fr: 'Conseils clés pour réussir votre entretien' } },
    { slug: 'sectors-2025', date: '2025-03-19', tags: ['search'], title: { ar: 'قطاعات التشغيل 2025', fr: 'Secteurs de l\'emploi 2025' }, excerpt: { ar: 'أهم القطاعات التي توفر فرص عمل في المغرب', fr: 'Les secteurs qui recrutent le plus au Maroc' } },
    { slug: 'public-concours', date: '2025-03-18', tags: ['public'], title: { ar: 'مباراة الوظيفة العمومية', fr: 'Concours de la fonction publique' }, excerpt: { ar: 'كل ما تحتاج معرفته عن المباريات العمومية', fr: 'Tout ce qu\'il faut savoir sur les concours publics' } },
    { slug: 'motivation-letter', date: '2025-03-17', tags: ['cv', 'tips'], title: { ar: 'رسالة التحفيز', fr: 'Lettre de motivation' }, excerpt: { ar: 'كيف تكتب رسالة تحفيز تجذب أصحاب العمل', fr: 'Comment rédiger une lettre qui attire l\'attention' } },
    { slug: 'linkedin-tips', date: '2025-03-16', tags: ['linkedin'], title: { ar: 'نصائح LinkedIn', fr: 'Conseils LinkedIn' }, excerpt: { ar: 'كيف تبني حضوراً قوياً على لينكدإن', fr: 'Comment bâtir une présence forte sur LinkedIn' } },
    { slug: 'demand-jobs', date: '2025-03-15', tags: ['search'], title: { ar: 'أكثر المناصب طلباً 2025', fr: 'Métiers les plus demandés 2025' }, excerpt: { ar: 'تعرف على المهن الأكثر طلباً في سوق العمل المغربي', fr: 'Découvrez les métiers en forte demande au Maroc' } },
    { slug: 'employee-rights', date: '2025-03-14', tags: ['rights'], title: { ar: 'حقوق الموظف - SMIG/CNSS', fr: 'Droits de l\'employé' }, excerpt: { ar: 'حقوقك كموظف وما يجب أن تعرفه قبل التوقيع', fr: 'Vos droits en tant qu\'employé au Maroc' } },
    { slug: 'anapec-services', date: '2025-03-13', tags: ['search'], title: { ar: 'خدمات ANAPEC', fr: 'Services de l\'ANAPEC' }, excerpt: { ar: 'كيف تستفيد من خدمات وكالة التشغيل ANAPEC', fr: 'Comment profiter des services de l\'ANAPEC' } },
  ];

  const t = {
    ar: { title: 'مدونة التوظيف في المغرب', subtitle: 'نصائح مهنية، أدلة عملية، وتحليلات سوق الشغل', back: '← الرئيسية', readMore: 'اقرأ المقال' },
    fr: { title: 'Blog Emploi au Maroc', subtitle: 'Conseils pro, guides pratiques et analyses du marché', back: '→ Accueil', readMore: 'Lire l\'article' }
  }[lang];

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#f1f5f9' }} dir={dir}>
      <Navbar lang={lang} />

      {/* Blog Hero */}
      <div className="bg-gradient-to-br from-[#0f2167] to-[#1a3a8f] text-white py-12 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold mb-4">
            ✍️ {lang === 'ar' ? 'نصائح ومقالات مهنية' : 'Conseils & Articles pro'}
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">{t.title}</h1>
          <p className="text-blue-200 text-base">{t.subtitle}</p>
        </div>
      </div>

      {/* AD SPOT 1 */}
      <div className="container mx-auto px-4 max-w-5xl mt-6">
        <AdSpot label="728x90 — Leaderboard (Top of Blog)" />
      </div>

      <main className="container mx-auto px-4 max-w-5xl py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((art, index) => {
            const tagColor = TAG_COLORS[art.tags[0]] || TAG_COLORS.default;
            return (
              <React.Fragment key={art.slug}>
                {/* AD SPOT 2 — after 6th article */}
                {index === 6 && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <AdSpot label="728x90 — In-Feed Ad (After 6th Article)" />
                  </div>
                )}
                <Link
                  href={`/blog/${art.slug}?lang=${lang}`}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group"
                >
                  {/* Color bar */}
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${tagColor}`}>
                        {art.tags[0]}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">{art.date}</span>
                    </div>
                    <h2 className="text-base font-black text-slate-900 group-hover:text-blue-700 leading-snug mb-2 flex-grow transition-colors">
                      {art.title[lang]}
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{art.excerpt[lang]}</p>
                    <span className="text-blue-600 text-xs font-black uppercase tracking-wider group-hover:underline">
                      {t.readMore} →
                    </span>
                  </div>
                </Link>
              </React.Fragment>
            );
          })}
        </div>
      </main>

      {/* AD SPOT 3 — Before footer */}
      <div className="container mx-auto px-4 max-w-5xl mb-12">
        <AdSpot label="728x90 — Footer Banner (Before Footer)" />
      </div>

      <Footer lang={lang} />
    </div>
  );
}
