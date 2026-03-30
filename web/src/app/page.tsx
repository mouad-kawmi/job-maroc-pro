import React from 'react';
import Link from 'next/link';
import { getDb, Job } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';
import { isExpired } from '@/lib/date-utils';
import { formatPostsLabel } from '@/lib/job-utils';
import { filterJobsBySector } from '@/lib/job-categories';
import { listJobGuides } from '@/lib/job-guides';
import { getSiteSettings } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';

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
  const settings = await getSiteSettings();
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
  const featuredGuides = listJobGuides().map((guide) => ({
    ...guide,
    activeCount: filterJobsBySector(activeJobs, guide.sector).length,
  }));
  const guidesUi =
    lang === 'fr'
      ? {
          badge: 'Guides pratiques',
          title: 'Mieux organiser votre recherche selon le secteur',
          subtitle:
            'Des pages utiles pour comprendre les differents types d opportunites, verifier les annonces et cibler les offres les plus pertinentes.',
          activeJobs: 'offres actives',
          cta: 'Ouvrir le guide',
        }
      : {
          badge: '\u062f\u0644\u0627\u0626\u0644 \u0639\u0645\u0644\u064a\u0629',
          title: '\u0646\u0638\u0645 \u0628\u062d\u062b\u0643 \u062d\u0633\u0628 \u0646\u0648\u0639 \u0627\u0644\u0642\u0637\u0627\u0639',
          subtitle:
            '\u0635\u0641\u062d\u0627\u062a \u0645\u0641\u064a\u062f\u0629 \u062a\u0633\u0627\u0639\u062f\u0643 \u0639\u0644\u0649 \u0641\u0647\u0645 \u0646\u0648\u0639 \u0627\u0644\u0641\u0631\u0635\u060c \u0648\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a\u060c \u0648\u062a\u0631\u062a\u064a\u0628 \u062a\u0642\u062f\u064a\u0645\u0643 \u0628\u0634\u0643\u0644 \u0623\u0641\u0636\u0644.',
          activeJobs: '\u0641\u0631\u0635 \u0646\u0634\u0637\u0629',
          cta: '\u0627\u0641\u062a\u062d \u0627\u0644\u062f\u0644\u064a\u0644',
        };
  const conversionUi =
    lang === 'fr'
      ? {
          badge: 'Alertes rapides',
          title: 'Recevez les nouvelles offres des leur publication',
          subtitle:
            "Rejoignez notre canal pour suivre les nouvelles opportunites, les concours ajoutes et les rappels utiles sans devoir verifier le site plusieurs fois par jour.",
          points: [
            'Nouvelles offres et concours ajoutes au fil de la journee.',
            'Rappels utiles pour les delais et la verification de la source officielle.',
            'Un moyen simple de rester informe sans rater une opportunite importante.',
          ],
          primaryTelegram: 'Rejoindre Telegram',
          primaryFallback: 'Recevoir les alertes',
          secondaryContact: 'Nous contacter',
          secondaryGuides: 'Voir les guides',
          note: 'Gratuit, sans intermediaire, avec rappel constant vers la source officielle.',
          emailLabel: 'Contact direct',
        }
      : {
          badge: '\u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0645\u0628\u0627\u0634\u0631\u0629',
          title: '\u0645\u0627 \u062a\u0636\u064a\u0639\u0634 \u062d\u062a\u0649 \u0641\u0631\u0635\u0629 \u062c\u062f\u064a\u062f\u0629',
          subtitle:
            '\u0627\u0646\u0636\u0645 \u0644\u0644\u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0628\u0627\u0634 \u064a\u0648\u0635\u0644\u0643 \u0622\u062e\u0631 \u0627\u0644\u0641\u0631\u0635 \u0648\u0627\u0644\u0645\u0628\u0627\u0631\u064a\u0627\u062a \u0648\u0627\u0644\u0622\u062c\u0627\u0644 \u0627\u0644\u0645\u0647\u0645\u0629 \u0628\u062f\u0648\u0646 \u0645\u0627 \u062a\u0628\u0642\u0649 \u062a\u0631\u062c\u0639 \u0644\u0644\u0645\u0648\u0642\u0639 \u0641\u064a \u0643\u0644 \u0645\u0631\u0629.',
          points: [
            '\u0641\u0631\u0635 \u062c\u062f\u064a\u062f\u0629 \u0648\u0645\u0628\u0627\u0631\u064a\u0627\u062a \u0643\u062a\u062a\u0632\u0627\u062f \u0628\u0634\u0643\u0644 \u0645\u0633\u062a\u0645\u0631.',
            '\u062a\u0630\u0643\u064a\u0631 \u0628\u0627\u0644\u0622\u062c\u0627\u0644 \u0648\u0627\u0644\u062a\u0623\u0643\u062f \u0645\u0646 \u0627\u0644\u0645\u0635\u062f\u0631 \u0627\u0644\u0631\u0633\u0645\u064a \u0642\u0628\u0644 \u0627\u0644\u062a\u0642\u062f\u064a\u0645.',
            '\u0637\u0631\u064a\u0642\u0629 \u0628\u0633\u064a\u0637\u0629 \u0628\u0627\u0634 \u062a\u0628\u0642\u0649 \u0645\u062a\u0627\u0628\u0639 \u0643\u0644 \u062c\u062f\u064a\u062f.',
          ],
          primaryTelegram: '\u0627\u0646\u0636\u0645 \u0625\u0644\u0649 Telegram',
          primaryFallback: '\u0627\u0637\u0644\u0628 \u0627\u0644\u062a\u0646\u0628\u064a\u0647\u0627\u062a',
          secondaryContact: '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627',
          secondaryGuides: '\u0627\u0637\u0644\u0639 \u0639\u0644\u0649 \u0627\u0644\u062f\u0644\u0627\u0626\u0644',
          note: '\u0645\u062c\u0627\u0646\u0627\u060c \u0628\u062f\u0648\u0646 \u0648\u0633\u0627\u0637\u0629\u060c \u0648\u0645\u0639 \u062a\u0630\u0643\u064a\u0631 \u062f\u0627\u0626\u0645 \u0628\u0627\u0644\u0645\u0635\u062f\u0631 \u0627\u0644\u0631\u0633\u0645\u064a.',
          emailLabel: '\u0628\u0631\u064a\u062f \u0627\u0644\u062a\u0648\u0627\u0635\u0644',
        };
  const primaryCtaHref = siteConfig.hasTelegram
    ? siteConfig.telegramUrl
    : `/contact?lang=${lang}`;
  const primaryCtaLabel = siteConfig.hasTelegram
    ? conversionUi.primaryTelegram
    : conversionUi.primaryFallback;
  const secondaryCtaHref = siteConfig.hasTelegram
    ? `/contact?lang=${lang}`
    : `/guides?lang=${lang}`;
  const secondaryCtaLabel = siteConfig.hasTelegram
    ? conversionUi.secondaryContact
    : conversionUi.secondaryGuides;

  const totalJobs = jobsToDisplay.length;
  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);
  const paginatedJobs = jobsToDisplay.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE);
  const showConversionSection = page === 1 && status === 'active' && paginatedJobs.length >= 4;

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
        {false && (
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-[#10245c] text-white shadow-sm">
          <div className="grid gap-6 px-5 py-6 md:grid-cols-[1.15fr_0.85fr] md:px-6 md:py-7">
            <div>
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-blue-100">
                {conversionUi.badge}
              </span>
              <h2 className="mt-4 text-2xl font-black leading-tight md:text-3xl">
                {conversionUi.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                {conversionUi.subtitle}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={primaryCtaHref}
                  target={siteConfig.hasTelegram ? '_blank' : undefined}
                  rel={siteConfig.hasTelegram ? 'noreferrer' : undefined}
                  className="inline-flex items-center rounded-full bg-green-500 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition-transform hover:-translate-y-0.5 hover:bg-green-400"
                >
                  {primaryCtaLabel}
                </Link>
                <Link
                  href={secondaryCtaHref}
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/15"
                >
                  {secondaryCtaLabel}
                </Link>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-blue-100/80">
                {conversionUi.note}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <ul className="space-y-3">
                {conversionUi.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-7 text-slate-200">
                    <span className="mt-1 text-green-400">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                  {conversionUi.emailLabel}
                </p>
                <p className="mt-2 break-all text-sm font-black text-white">
                  {settings.contactEmail}
                </p>
              </div>
            </div>
          </div>
        </section>
        )}

        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 md:px-6">
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-blue-700">
              {guidesUi.badge}
            </span>
            <h2 className="mt-3 text-xl font-black text-slate-900 md:text-2xl">
              {guidesUi.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              {guidesUi.subtitle}
            </p>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
            {featuredGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}?lang=${lang}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
                    {guide.sector === 'public'
                      ? lang === 'fr'
                        ? 'Public'
                        : '\u0639\u0627\u0645'
                      : lang === 'fr'
                        ? 'Prive'
                        : '\u062e\u0627\u0635'}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {guide.activeCount}+ {guidesUi.activeJobs}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-black leading-snug text-slate-900 transition-colors group-hover:text-blue-700">
                  {guide.titles[lang]}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {guide.overviews[lang]}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {guide.keyPoints[lang].slice(0, 2).map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-1 text-emerald-500">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-5 inline-flex text-sm font-black uppercase tracking-[0.18em] text-blue-600 group-hover:text-blue-700">
                  {guidesUi.cta} →
                </span>
              </Link>
            ))}
          </div>
        </section>

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
                {index === 7 && (
                  <AdSpot label="In-Feed Native Ad (after 8th job)" height="min-h-[90px]" />
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

                {showConversionSection && index === 3 && (
                  <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-[#12337a] text-white shadow-sm">
                    <div className="flex flex-col gap-5 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-6">
                      <div className="max-w-3xl">
                        <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-blue-100">
                          {conversionUi.badge}
                        </span>
                        <h3 className="mt-3 text-xl font-black leading-tight md:text-2xl">
                          {conversionUi.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-slate-300 md:text-base">
                          {conversionUi.subtitle}
                        </p>
                        <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-200">
                          {conversionUi.points.map((point) => (
                            <li key={point} className="flex gap-3">
                              <span className="mt-1 text-green-400">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-col gap-3 md:min-w-[240px] md:items-end">
                        <Link
                          href={primaryCtaHref}
                          target={siteConfig.hasTelegram ? '_blank' : undefined}
                          rel={siteConfig.hasTelegram ? 'noreferrer' : undefined}
                          className="inline-flex items-center justify-center rounded-full bg-green-500 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition-transform hover:-translate-y-0.5 hover:bg-green-400"
                        >
                          {primaryCtaLabel}
                        </Link>
                        <Link
                          href={secondaryCtaHref}
                          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/15"
                        >
                          {secondaryCtaLabel}
                        </Link>
                        <p className="text-center text-[11px] font-bold uppercase tracking-[0.16em] text-blue-100/80 md:text-right">
                          {conversionUi.note}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

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
