import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default async function Blog(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as 'ar' | 'fr';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Simplified array of articles from previous session to restore site quickly
  const articles = [
    { slug: 'job-search-ads', date: '2025-03-22', tags: ['search', 'tips'], title: { ar: 'كيف تجد إعلانات التوظيف - JOB MAROC PRO', fr: 'Comment trouver les annonces d\'emploi' } },
    { slug: 'cv-writing', date: '2025-03-21', tags: ['cv', 'jobs'], title: { ar: 'السيرة الذاتية - CV', fr: 'Le Curriculum Vitae' } },
    { slug: 'interview-tips', date: '2025-03-20', tags: ['interview', 'career'], title: { ar: 'المقابلة الشفهية', fr: 'L\'entretien d\'embauche' } },
    { slug: 'sectors-2025', date: '2025-03-19', tags: ['sectors', 'market'], title: { ar: 'قطاعات التشغيل 2025', fr: 'Secteurs de l\'emploi 2025' } },
    { slug: 'public-concours', date: '2025-03-18', tags: ['public', 'concours'], title: { ar: 'مباراة الوظيفة العمومية', fr: 'Concours de la fonction publique' } },
    { slug: 'motivation-letter', date: '2025-03-17', tags: ['letter', 'apply'], title: { ar: 'رسالة التحفيز', fr: 'Lettre de motivation' } },
    { slug: 'linkedin-tips', date: '2025-03-16', tags: ['linkedin', 'digital'], title: { ar: 'نصائح LinkedIn', fr: 'Conseils LinkedIn' } },
    { slug: 'demand-jobs', date: '2025-03-15', tags: ['demand', 'future'], title: { ar: 'أكثر المناصب طلباً 2025', fr: 'Métiers les plus demandés 2025' } },
    { slug: 'employee-rights', date: '2025-03-14', tags: ['rights', 'smig'], title: { ar: 'حقوق الموظف - SMIG/CNSS', fr: 'Droits de l\'employé' } },
    { slug: 'anapec-services', date: '2025-03-13', tags: ['anapec', 'services'], title: { ar: 'خدمات ANAPEC', fr: 'Services de l\'ANAPEC' } },
  ];

  const t = {
    ar: { title: 'مدونة التوظيف في المغرب', back: 'الرجوع للرئيسية' },
    fr: { title: 'Blog de l\'emploi au Maroc', back: 'Retour à l\'accueil' }
  }[lang];

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans flex flex-col" dir={dir}>
      <Navbar lang={lang} />
      <main className="container mx-auto max-w-4xl px-4 py-12 flex-grow">
        <Link href={`/?lang=${lang}`} className="text-sm font-bold text-slate-500 hover:text-blue-600 mb-6 inline-block">
             {lang === 'ar' ? '←' : '→'} {t.back}
        </Link>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-12 border-b-4 border-green-500 inline-block pb-2">
            {t.title}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((art) => (
                <Link key={art.slug} href={`/blog/${art.slug}?lang=${lang}`} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border border-slate-100 transition-all">
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">{art.date}</div>
                    <h2 className="text-lg md:text-xl font-bold text-slate-800 leading-snug">{art.title[lang]}</h2>
                </Link>
            ))}
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
