import Link from 'next/link';
import { getDb, Job } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';
import { isExpired } from '@/lib/date-utils';
import { formatPostsLabel } from '@/lib/job-utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function AdSpot({ label, height = 'min-h-[100px]' }: { label: string, height?: string }) {
  return <AdSlot label={label} heightClassName={height} />;
}

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
      back: '← العودة للقائمة',
      deadline: 'آخر أجل:',
      posts: 'المناصب:',
      apply: '📋 سجّل الآن — الرابط الرسمي',
      share: 'مشاركة',
      relatedTitle: 'مباريات قد تهمك',
    },
    fr: {
      back: '→ Retour à la liste',
      deadline: 'Date limite:',
      posts: 'Postes:',
      apply: '📋 Postuler — Lien officiel',
      share: 'Partager',
      relatedTitle: 'Offres similaires',
    }
  };

  const t = ui[lang];

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#f1f5f9' }} dir={dir}>
      <Navbar lang={lang} />

      {/* ═══════════════ AD SPOT 1 — Top of page under nav ═══════════════ */}
      <div className="container mx-auto px-4 max-w-4xl mt-4">
        <AdSpot label="728x90 — Leaderboard (Top of Job Detail)" height="min-h-[90px]" />
      </div>

      <main className="container mx-auto px-4 max-w-4xl py-6 flex-grow">
        {/* Back button */}
        <Link href={`/?lang=${lang}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 mb-5 transition-colors">
          {t.back}
        </Link>

        {/* Job Card */}
        <article className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0f2167] to-[#1a3a8f] p-6 md:p-8 text-white">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-black px-3 py-1 rounded-full">
                🏛️ {lang === 'ar' ? job.organization : (job.organization_fr || job.organization)}
              </span>
              <span className={`text-white text-xs font-bold px-3 py-1 rounded-full border ${isExpired(job.deadline) ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-red-500/80 border-red-400'}`}>
                ⏳ {t.deadline} {isExpired(job.deadline) ? (lang === 'ar' ? 'انتهى الوقت' : 'Expiré') : job.deadline}
              </span>
              <span className="bg-green-500/80 text-white text-xs font-bold px-3 py-1 rounded-full border border-green-400">
                🎯 {formatPostsLabel(job.posts, lang)}
              </span>
            </div>
            <h1 className="text-xl md:text-3xl font-black leading-tight">
              {lang === 'ar' ? job.title : (job.title_fr || job.title)}
            </h1>
          </div>

          {/* ═══════════════ AD SPOT 2 — Under Header, Above Content ═══════════════ */}
          <div className="px-6 md:px-8 pt-6">
            <AdSpot label="336x280 — Rectangle Ad (Under Header)" height="min-h-[90px]" />
          </div>

          {/* Content */}
          <div className="px-6 md:px-8 py-6">
            <div
              className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-800 prose-h2:text-xl prose-h3:text-base prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-800 prose-a:text-blue-600"
              dir="auto"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {job.content_html || job.full_description}
              </ReactMarkdown>
            </div>
          </div>

          {/* ═══════════════ AD SPOT 3 — Mid Content ═══════════════ */}
          <div className="px-6 md:px-8 pb-6">
            <AdSpot label="728x90 — In-Content Banner (Mid Article)" height="min-h-[90px]" />
          </div>

          {/* Apply CTA */}
          <div className="px-6 md:px-8 pb-8">
            <div className={`rounded-2xl p-6 text-center border ${isExpired(job.deadline) ? 'bg-red-50 border-red-200' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}`}>
              <p className={`text-sm font-bold mb-4 ${isExpired(job.deadline) ? 'text-red-600' : 'text-slate-600'}`}>
                {isExpired(job.deadline) 
                  ? (lang === 'ar' ? '🚫 نأسف، لقد انتهى أجل التقديم لهذه المباراة' : '🚫 Désolé, le délai de candidature est expiré')
                  : (lang === 'ar' ? '⚠️ للتقديم الرسمي توجه إلى الموقع الرسمي لوزارة الوظيفة العمومية' : '⚠️ Pour postuler officiellement, rendez-vous sur le site officiel')}
              </p>
              
              {!isExpired(job.deadline) ? (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 hover:bg-green-700 active:scale-95 text-white font-black py-4 px-10 rounded-2xl shadow-lg transition-all text-base"
                >
                  {t.apply}
                </a>
              ) : (
                <div className="inline-block bg-slate-300 text-slate-500 font-black py-4 px-10 rounded-2xl cursor-not-allowed text-base">
                  {lang === 'ar' ? 'انتهت الصلاحية' : 'Expiré'}
                </div>
              )}
              
              {!isExpired(job.deadline) && <p className="mt-4 text-slate-400 text-xs break-all">{job.url}</p>}
            </div>
          </div>
        </article>

        {/* ═══════════════ AD SPOT 4 — Below Article, Before Related ═══════════════ */}
        <div className="mt-8">
          <AdSpot label="728x90 — Horizontal Banner (Below Article)" height="min-h-[90px]" />
        </div>

      </main>

      <Footer lang={lang} />
    </div>
  );
}
