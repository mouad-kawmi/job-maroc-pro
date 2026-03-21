import Link from 'next/link';
import { getDb, Job } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default async function JobDetail(props: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as 'ar' | 'fr';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const db = await getDb();
  const job: Job | undefined = await db.get("SELECT * FROM jobs WHERE id = ?", [params.id]);

  if (!job) return notFound();

  const ui = {
    ar: { 
      back: 'الرجوع', deadline: 'آخر أجل للتسجيل:', 
      share: 'مشاركة المباراة', apply: 'رابط التسجيل الأصلي',
      source: 'المصدر:', website: 'JOB MAROC PRO'
    },
    fr: { 
      back: 'Retour', deadline: 'Dernier délai:', 
      share: 'Partager l\'offre', apply: 'Lien d\'inscription original',
      source: 'Source:', website: 'JOB MAROC PRO'
    }
  };

  const t = ui[lang];

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans flex flex-col" dir={dir}>
      <Navbar lang={lang} />
      
      <main className="container mx-auto px-4 max-w-4xl py-12 flex-grow">
        <Link href={`/?lang=${lang}`} className="text-sm font-bold text-slate-500 hover:text-blue-600 mb-6 inline-block">
             {lang === 'ar' ? '←' : '→'} {t.back}
        </Link>
        <article className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <header className="mb-8 border-b border-slate-50 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-slate-100 text-slate-600 text-xs font-black px-3 py-1.5 rounded-full uppercase">
                {lang === 'ar' ? job.organization : (job.organization_fr || job.organization)}
              </span>
              <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                {t.deadline} {job.deadline}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-6 mt-2">
              {lang === 'ar' ? job.title : (job.title_fr || job.title)}
            </h1>
          </header>

          {/* Fixed Markdown Rendering */}
          <div className="prose prose-slate max-w-none prose-headings:font-black prose-p:font-medium prose-p:leading-relaxed text-slate-700 pb-10" dir="auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {job.content_html || job.full_description}
            </ReactMarkdown>
          </div>
          
          <div className="mt-12 pt-8 border-t-2 border-slate-50 flex flex-col items-center">
            <a 
              href={job.url} 
              target="_blank" 
              className="bg-green-600 hover:bg-green-700 text-white font-black py-4 px-10 rounded-2xl shadow-lg transition-all scale-100 active:scale-95 inline-block text-center w-full md:w-auto"
            >
               {t.apply}
            </a>
            <p className="mt-6 text-slate-400 text-xs font-bold italic">{t.source} {job.url}</p>
          </div>
        </article>
      </main>
      
      <Footer lang={lang} />
    </div>
  );
}
