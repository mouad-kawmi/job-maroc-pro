import React from 'react';
import Link from 'next/link';
import { getDb, Job } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as 'ar' | 'fr';
  const sector = searchParams.sector || 'all';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const ui = {
    ar: { 
      heroTitle: 'بوابتك الأولى للبحث عن عمل في المغرب',
      heroSubtitle: 'أحدث عروض العمل في القطاع العام والخاص، مباريات التوظيف، ونصائح مهنية يومية.',
      latestJobs: 'أحدث عروض العمل والمباريات ✨',
      noJobs: 'لا توجد مباريات حالياً في هذا القسم.'
    },
    fr: { 
      heroTitle: 'Votre première destination pour l\'emploi au Maroc',
      heroSubtitle: 'Dernières offres d\'emploi (public/privé), concours de recrutement et conseils carrière.',
      latestJobs: 'Dernières offres et concours ✨',
      noJobs: 'Aucune offre disponible pour le moment.'
    }
  };

  const t = ui[lang];
  const db = await getDb();
  
  // Logic to filter by sector based on keywords in title or organization
  let query = "SELECT * FROM jobs ORDER BY created_at DESC LIMIT 50";
  const jobs: Job[] = await db.all(query);
  
  // Basic filtering logic by sector (just keyword search for this simple site)
  const filteredJobs = sector === 'all' 
    ? jobs 
    : jobs.filter(j => {
        const isPublic = j.organization.includes('وزارة') || j.organization.includes('المكتب') || j.organization.includes('المؤسسة');
        return sector === 'public' ? isPublic : !isPublic;
      });

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans flex flex-col" dir={dir}>
      <Navbar lang={lang} />

      {/* Modern Professional Hero */}
      <div className="bg-white border-b border-slate-200 py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1e3a8a 1px, transparent 1px), linear-gradient(to bottom, #1e3a8a 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="container mx-auto max-w-4xl relative z-10">
          <span className="inline-block py-1.5 px-4 rounded-full bg-blue-50 text-blue-600 font-bold text-xs md:text-sm mb-6 uppercase tracking-widest border border-blue-100">🇲🇦 {t.latestJobs}</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight text-slate-900 tracking-tight">
            {lang === 'ar' ? 'بوابتك الأولى للبحث عن عمل في ' : 'Votre première destination pour l\'emploi au '} 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">{lang === 'ar' ? 'المغرب' : 'Maroc'}</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">{t.heroSubtitle}</p>
        </div>
      </div>

      {/* ADSENSE SPOT 1: Below Hero (Header Ad) */}
      <div className="container mx-auto px-4 mt-8 max-w-4xl">
        <div className="w-full bg-slate-100/50 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center p-4 min-h-[120px] text-slate-400 font-bold text-sm text-center">
             GOOGLE ADSENSE <br /> (Banner Ad - Header) <br /> <span className="text-xs font-normal">Place your script in layout.tsx and add the &lt;ins&gt; tag here</span>
        </div>
      </div>

      {/* Jobs Feed (List View) */}
      <main className="container mx-auto px-4 mt-10 max-w-4xl flex-grow">
        <div className="flex items-center justify-between mb-8 border-b-2 border-slate-200 pb-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-800">
                {sector === 'public' ? (lang === 'ar' ? 'المباريات العمومية' : 'Secteur Public') : 
                 sector === 'private' ? (lang === 'ar' ? 'القطاع الخاص' : 'Secteur Privé') : 
                 t.latestJobs}
            </h2>
            <span className="text-sm font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full">{filteredJobs.length} {lang === 'ar' ? 'عرض' : 'offres'}</span>
        </div>
        
        {filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-400 font-bold text-lg">{t.noJobs}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-12">
            {filteredJobs.map((job, index) => (
              <React.Fragment key={job.id}>
                {/* Insert an Ad after the 3rd job */}
                {index === 3 && (
                  <div className="w-full bg-slate-100/50 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center p-4 min-h-[120px] text-slate-400 font-bold text-sm text-center my-4 opacity-80">
                      GOOGLE ADSENSE <br /> (In-feed Ad) <br /> <span className="text-xs font-normal">Native Ad unit format works best here</span>
                  </div>
                )}
                
                <Link
                  href={`/jobs/${job.id}?lang=${lang}`}
                  className="group bg-white p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-blue-400 flex flex-col md:flex-row gap-4 md:items-center justify-between"
                >
                  <div className="flex flex-col flex-grow">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="bg-blue-50 text-blue-700 text-[10px] md:text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider shrink-0">
                        {lang === 'ar' ? job.organization : job.organization_fr || job.organization}
                      </span>
                      <span className="text-[10px] md:text-xs text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                        ⏳ {job.deadline}
                      </span>
                      <span className="text-[10px] md:text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                        🎯 {job.posts} {lang === 'ar' ? 'منصب' : 'postes'}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-blue-700 leading-snug">
                      {lang === 'ar' ? job.title : job.title_fr || job.title}
                    </h3>
                  </div>
                  
                  <div className="md:border-l md:border-slate-100 md:pl-6 md:ml-2 flex items-center justify-end md:justify-center shrink-0">
                     <span className="bg-slate-900 text-white group-hover:bg-blue-600 font-bold text-sm py-2 px-6 rounded-xl transition-colors hidden md:block">
                         {lang === 'ar' ? 'التفاصيل' : 'Postuler'}
                     </span>
                     <span className="text-blue-600 font-black text-sm group-hover:underline uppercase tracking-widest md:hidden">
                         {lang === 'ar' ? 'التفاصيل ←' : 'Voir Plus →'}
                     </span>
                  </div>
                </Link>
              </React.Fragment>
            ))}
          </div>
        )}
      </main>

      {/* ADSENSE SPOT 3: Above Footer */}
      <div className="container mx-auto px-4 mb-16 max-w-4xl">
        <div className="w-full bg-slate-100/50 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center p-4 min-h-[90px] text-slate-400 font-bold text-sm text-center">
             GOOGLE ADSENSE <br /> (Horizontal Banner - Footer Ad)
        </div>
      </div>

      <Footer lang={lang} />
    </div>
  );
}
