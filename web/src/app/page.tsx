import React from 'react';
import Link from 'next/link';
import { getDb, Job } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';
import { isExpired } from '@/lib/date-utils';
import { formatPostsLabel } from '@/lib/job-utils';

function AdSpot({ label, height = 'min-h-[100px]' }: { label: string, height?: string }) {
  return <AdSlot label={label} heightClassName={height} />;
}

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as 'ar' | 'fr';
  const sector = searchParams.sector || 'all';
  const status = searchParams.status || 'active'; // 'active' or 'expired'
  const page = parseInt(searchParams.page || '1') || 1;
  const JOBS_PER_PAGE = 12;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const ui = {
    ar: {
      heroTitle: 'بوابتك الأولى للبحث عن عمل في المغرب',
      heroSubtitle: 'أحدث مباريات التوظيف في القطاع العام والخاص — يتجدد يومياً',
      latestJobs: 'أحدث المباريات والعروض',
      noJobs: 'لا توجد مباريات حالياً.',
      badge: 'تحديث يومي تلقائي 🤖',
    },
    fr: {
      heroTitle: 'Votre portail N°1 pour l\'emploi au Maroc',
      heroSubtitle: 'Derniers concours de recrutement, secteur public et privé — mis à jour quotidiennement',
      latestJobs: 'Dernières offres et concours',
      noJobs: 'Aucune offre disponible pour le moment.',
      badge: 'Mise à jour automatique 🤖',
    }
  };

  const t = ui[lang];
  const db = await getDb();
  // Fetch more to ensure we have enough active jobs
  const allJobs: Job[] = await db.all("SELECT * FROM jobs ORDER BY id DESC LIMIT 500");

  const activeJobs = allJobs.filter(j => !isExpired(j.deadline));
  const expiredJobs = allJobs.filter(j => isExpired(j.deadline));

  const baseJobs = status === 'expired' ? expiredJobs : activeJobs;

  const jobsToDisplay = sector === 'all'
    ? baseJobs
    : baseJobs.filter(j => {
        const publicKeywords = [
          'وزارة', 'المكتب', 'المؤسسة', 'المجلس', 'الوكالة', 'الصندوق', 
          'الأمانة', 'جامعة', 'عكالة', 'محكمة', 'ولاية', 'عمالة', 'جماعة', 
          'جهة', 'مندوبية', 'إدارة', 'القيادة', 'القوات', 'الدرك', 'الأمن'
        ];
        const isPublic = publicKeywords.some(keyword => j.organization.includes(keyword));
        return sector === 'public' ? isPublic : !isPublic;
      });

  const totalJobs = jobsToDisplay.length;
  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);
  const paginatedJobs = jobsToDisplay.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE);

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#f1f5f9' }} dir={dir}>
      <Navbar lang={lang} />

      {/* ═══════════════ HERO ═══════════════ */}
      <div className="bg-gradient-to-br from-[#0f2167] via-[#1a3a8f] to-[#1e5799] text-white py-14 px-4 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), 
                           radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)`
        }}></div>
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {t.badge}
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
            {lang === 'ar' ? (
              <>بوابتك الأولى للبحث عن عمل في <span className="text-green-400">المغرب</span></>
            ) : (
              <>Votre portail N°1 pour <span className="text-green-400">l&apos;emploi</span> au Maroc</>
            )}
          </h1>
          <p className="text-blue-200 text-base md:text-lg max-w-2xl mx-auto font-medium">{t.heroSubtitle}</p>
          
          {/* Stats bar */}
          <div className="flex items-center justify-center gap-8 mt-10 pt-8 border-t border-white/10">
            <div className="text-center">
              <p className="text-2xl font-black text-white">{activeJobs.length}+</p>
              <p className="text-blue-300 text-xs font-bold">{lang === 'ar' ? 'عرض شغل' : 'Offres'}</p>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center">
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-blue-300 text-xs font-bold">{lang === 'ar' ? 'مجاني' : 'Gratuit'}</p>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center">
              <p className="text-2xl font-black text-white">24/7</p>
              <p className="text-blue-300 text-xs font-bold">{lang === 'ar' ? 'تحديث' : 'Mis à jour'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ AD SPOT 1 — Below Hero ═══════════════ */}
      <div className="container mx-auto px-4 max-w-5xl mt-6">
        <AdSpot label="728x90 — Leaderboard Ad (Below Hero)" height="min-h-[90px]" />
      </div>

      {/* ═══════════════ JOB LISTINGS ═══════════════ */}
      <main className="container mx-auto px-4 max-w-5xl mt-6 flex-grow">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800">{status === 'expired' ? (lang === 'ar' ? 'مباريات منتهية ونتائج' : 'Concours Expirés et Résultats') : t.latestJobs}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{totalJobs} {lang === 'ar' ? 'نتيجة' : 'résultats'}</p>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <Link
              href={`/?lang=${lang}&sector=${sector}&status=active`}
              className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${status === 'active' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {lang === 'ar' ? 'مباريات نشطة 🟢' : 'Actifs 🟢'}
            </Link>
            <Link
              href={`/?lang=${lang}&sector=${sector}&status=expired`}
              className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${status === 'expired' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {lang === 'ar' ? 'منتهية / نتائج ⏳' : 'Expirés / Résultats ⏳'}
            </Link>
          </div>
        </div>

        {paginatedJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 font-bold text-lg">{t.noJobs}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginatedJobs.map((job: Job, index: number) => (
              <React.Fragment key={job.id}>

                {/* AD SPOT 2 — In-Feed after 4th job */}
                {index === 4 && (
                  <AdSpot label="In-Feed Native Ad (after 4th job)" height="min-h-[90px]" />
                )}
                {/* AD SPOT 3 — In-Feed after 9th job */}
                {index === 9 && (
                  <AdSpot label="In-Feed Native Ad (after 9th job)" height="min-h-[90px]" />
                )}

                <Link
                  href={`/jobs/${job.id}?lang=${lang}`}
                  className={`group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col md:flex-row overflow-hidden ${isExpired(job.deadline) ? 'opacity-70 grayscale-[0.3]' : ''}`}
                >
                  <div className={`w-full md:w-1 h-1 md:h-auto shrink-0 md:rounded-l-2xl rounded-t-2xl ${isExpired(job.deadline) ? 'bg-slate-400' : 'bg-gradient-to-b from-blue-500 to-blue-700'}`}></div>

                  <div className="p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-center w-full">
                    <div className="flex-grow">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide">
                          {lang === 'ar' ? job.organization : job.organization_fr || job.organization}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${isExpired(job.deadline) ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                          ⏳ {isExpired(job.deadline) ? (lang === 'ar' ? 'انتهى الوقت' : 'Expiré') : job.deadline}
                        </span>
                        <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          🎯 {formatPostsLabel(job.posts, lang)}
                        </span>
                      </div>
                      <h3 className={`text-base md:text-lg font-black leading-snug transition-colors ${isExpired(job.deadline) ? 'text-slate-500' : 'text-slate-900 group-hover:text-blue-700'}`}>
                        {lang === 'ar' ? job.title : job.title_fr || job.title}
                      </h3>
                    </div>
                    <div className="shrink-0">
                      <span className={`font-bold text-sm py-2 px-5 rounded-xl transition-colors inline-block ${isExpired(job.deadline) ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 group-hover:bg-blue-700 text-white'}`}>
                        {lang === 'ar' ? 'التفاصيل ←' : 'Voir →'}
                      </span>
                    </div>
                  </div>
                </Link>

              </React.Fragment>
            ))}
          </div>
        )}

        {/* ═══════════════ PAGINATION ═══════════════ */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 mt-8 pb-10">
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/?lang=${lang}&sector=${sector}&status=${status}&page=${page - 1}`}
                  className="bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
                >
                  {lang === 'ar' ? '← السابق' : '← Précédent'}
                </Link>
              )}
              
              <div className="bg-white border border-slate-100 py-2.5 px-6 rounded-2xl font-black text-blue-700 shadow-sm text-sm">
                {lang === 'ar' ? `صفحة ${page} من ${totalPages}` : `Page ${page} sur ${totalPages}`}
              </div>

              {page < totalPages && (
                <Link
                  href={`/?lang=${lang}&sector=${sector}&status=${status}&page=${page + 1}`}
                  className="bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
                >
                  {lang === 'ar' ? 'التالي →' : 'Suivant →'}
                </Link>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ═══════════════ AD SPOT 4 — Before Footer ═══════════════ */}
      <div className="container mx-auto px-4 max-w-5xl mb-12">
        <AdSpot label="728x90 — Horizontal Banner (Before Footer)" height="min-h-[90px]" />
      </div>

      <Footer lang={lang} />
    </div>
  );
}
