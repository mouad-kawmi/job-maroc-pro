import React from 'react';
import Link from 'next/link';
import { getDb, Job } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

// AdSense placeholder component
function AdSpot({ label, height = 'min-h-[100px]' }: { label: string, height?: string }) {
  return (
    <div className={`w-full ${height} bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 text-xs font-medium`}>
      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300">Advertisement</span>
      {/* Replace the div below with your real AdSense <ins> tag */}
      <span className="text-slate-300 text-[10px]">{label}</span>
    </div>
  );
}

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as 'ar' | 'fr';
  const sector = searchParams.sector || 'all';
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
  const jobs: Job[] = await db.all("SELECT * FROM jobs ORDER BY created_at DESC LIMIT 50");

  const filteredJobs = sector === 'all'
    ? jobs
    : jobs.filter(j => {
        const isPublic = j.organization.includes('وزارة') || j.organization.includes('المكتب') || j.organization.includes('المؤسسة');
        return sector === 'public' ? isPublic : !isPublic;
      });

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
              <p className="text-2xl font-black text-white">{jobs.length}+</p>
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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-800">{t.latestJobs}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{filteredJobs.length} {lang === 'ar' ? 'نتيجة' : 'résultats'}</p>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 font-bold text-lg">{t.noJobs}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-10">
            {filteredJobs.map((job, index) => (
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
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col md:flex-row overflow-hidden"
                >
                  {/* Color strip */}
                  <div className="w-full md:w-1 h-1 md:h-auto bg-gradient-to-b from-blue-500 to-blue-700 shrink-0 md:rounded-l-2xl rounded-t-2xl"></div>

                  <div className="p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-center w-full">
                    <div className="flex-grow">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide">
                          {lang === 'ar' ? job.organization : job.organization_fr || job.organization}
                        </span>
                        <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          ⏳ {job.deadline}
                        </span>
                        <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          🎯 {job.posts} {lang === 'ar' ? 'منصب' : 'postes'}
                        </span>
                      </div>
                      <h3 className="text-base md:text-lg font-black text-slate-900 group-hover:text-blue-700 leading-snug transition-colors">
                        {lang === 'ar' ? job.title : job.title_fr || job.title}
                      </h3>
                    </div>
                    <div className="shrink-0">
                      <span className="bg-blue-600 group-hover:bg-blue-700 text-white font-bold text-sm py-2 px-5 rounded-xl transition-colors inline-block">
                        {lang === 'ar' ? 'التفاصيل ←' : 'Voir →'}
                      </span>
                    </div>
                  </div>
                </Link>

              </React.Fragment>
            ))}
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
