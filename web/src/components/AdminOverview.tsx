import Link from 'next/link';
import { getDb, Job } from '@/lib/db';
import { isExpired } from '@/lib/date-utils';
import { siteConfig } from '@/lib/site-config';

type AdminOverviewJob = Job & {
  meta_description?: string | null;
  telegram_post?: string | null;
};

type Lang = 'ar' | 'fr';

const DEFAULT_SITE_URL = 'https://example.com';

function formatPercent(value: number, total: number): string {
  if (!total) {
    return '0%';
  }

  return `${Math.round((value / total) * 100)}%`;
}

function formatDateTime(
  value: string | undefined,
  lang: Lang,
  fallback: string,
): string {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getTopOrganizations(
  jobs: AdminOverviewJob[],
  emptyLabel: string,
): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();

  for (const job of jobs) {
    const key = (job.organization || emptyLabel).trim() || emptyLabel;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function getUi(lang: Lang) {
  if (lang === 'ar') {
    return {
      title: 'لوحة المتابعة',
      subtitle:
        'نظرة سريعة على الوظائف وتهيئة SEO والمحتوى وحالة تيليغرام وجاهزية الموقع.',
      liveSite: 'رابط الموقع',
      lastUpdate: 'اخر تحديث',
      totalJobs: 'اجمالي الوظائف',
      activeJobs: 'الوظائف النشطة',
      seoCoverage: 'الاوصاف التعريفية',
      monetization: 'الاعلانات وتحقيق الربح',
      topOrganizations: 'اكثر الجهات نشرا',
      latestJobs: 'احدث الوظائف',
      actionList: 'الاولويات القادمة',
      statusBoard: 'لوحة المتابعة',
      openJob: 'فتح',
      viewActive: 'عرض الوظائف النشطة',
      viewExpired: 'عرض الوظائف المنتهية',
      jumpSettings: 'الاعدادات',
      jumpBlog: 'المدونة',
      ready: 'جاهز',
      missing: 'ناقص',
      manual: 'يدوي',
      unavailable: 'غير متاح',
      noData: 'لا توجد بيانات بعد.',
      unknownOrganization: 'جهة غير معروفة',
      adsReady: 'الاعلانات مهيأة',
      adsMissing: 'معرف AdSense غير موجود',
      siteConfig: 'اعدادات الموقع',
      contentReady: 'المحتوى',
      translations: 'الترجمات الفرنسية',
      telegramReady: 'تيليغرام',
      searchConsole: 'Search Console',
      recentHint: (count: number) => `${count} خلال 7 ايام`,
      expiredHint: (count: number) => `${count} منتهية`,
      metaHint: (count: number) => `${count} بدون وصف`,
      trackedShare: (value: string) => `${value} من اجمالي الوظائف`,
      latestMeta: (deadline: string, added: string) =>
        `اخر اجل: ${deadline} | الاضافة: ${added}`,
      actionSiteUrl:
        'اضف NEXT_PUBLIC_SITE_URL بالدومين الصحيح حتى تصبح الروابط القانونية وملف sitemap وSEO مضبوطة.',
      actionMeta:
        'عزز مسار توليد الاوصاف التعريفية اذا بقيت بعض الوظائف بدون snippet مناسب.',
      actionContent:
        'راجع fallback المحتوى و AI rewrite حتى تبقى صفحات الوظائف كاملة وواضحة.',
      actionAds:
        'عندما يبدأ الترافيك بالتحرك اضف NEXT_PUBLIC_ADSENSE_CLIENT_ID لتجهيز تحقيق الربح.',
      actionFreshness:
        'راجع الاوتوميشن و scraper اذا لم تظهر وظائف جديدة هذا الاسبوع.',
      actionNext:
        'الاساس جاهز. يمكنك الان تطوير analytics والبحث ونمو المحتوى.',
    };
  }

  return {
    title: 'Centre admin',
    subtitle:
      'Vue rapide sur les jobs, le SEO, le contenu, Telegram et la readiness du site.',
    liveSite: 'URL du site',
    lastUpdate: 'Derniere mise a jour',
    totalJobs: 'Total jobs',
    activeJobs: 'Jobs actifs',
    seoCoverage: 'Meta descriptions',
    monetization: 'Publicite et monetisation',
    topOrganizations: 'Top organisations',
    latestJobs: 'Derniers jobs',
    actionList: 'Actions prioritaires',
    statusBoard: 'Tableau de suivi',
    openJob: 'Ouvrir',
    viewActive: 'Voir les jobs actifs',
    viewExpired: 'Voir les jobs expires',
    jumpSettings: 'Parametres',
    jumpBlog: 'Blog',
    ready: 'Pret',
    missing: 'Manquant',
    manual: 'Manuel',
    unavailable: 'Non disponible',
    noData: 'Aucune donnee.',
    unknownOrganization: 'Organisation inconnue',
    adsReady: 'Publicite prete',
    adsMissing: 'ID AdSense manquant',
    siteConfig: 'Configuration du site',
    contentReady: 'Contenu',
    translations: 'Traductions FR',
    telegramReady: 'Telegram',
    searchConsole: 'Search Console',
    recentHint: (count: number) => `${count} sur 7 jours`,
    expiredHint: (count: number) => `${count} expires`,
    metaHint: (count: number) => `${count} sans meta`,
    trackedShare: (value: string) => `${value} du total jobs`,
    latestMeta: (deadline: string, added: string) =>
      `Deadline: ${deadline} | Ajoute: ${added}`,
    actionSiteUrl:
      'Definis NEXT_PUBLIC_SITE_URL avec le bon domaine pour un SEO propre.',
    actionMeta:
      'Renforce le pipeline des meta descriptions si certaines offres restent sans snippet.',
    actionContent:
      'Revois le fallback content et AI rewrite pour garder des pages offre completes.',
    actionAds:
      'Quand le trafic bouge, ajoute NEXT_PUBLIC_ADSENSE_CLIENT_ID pour la monetisation.',
    actionFreshness:
      'Controle automation et scraper si aucune offre recente ne remonte.',
    actionNext:
      'La base est bonne. Tu peux pousser analytics, search et content growth.',
  };
}

function buildActions(
  ui: ReturnType<typeof getUi>,
  params: {
    siteUrlReady: boolean;
    missingMeta: number;
    missingContent: number;
    adsReady: boolean;
    noRecentJobs: boolean;
  },
): string[] {
  const actions: string[] = [];

  if (!params.siteUrlReady) {
    actions.push(ui.actionSiteUrl);
  }

  if (params.missingMeta > 0) {
    actions.push(ui.actionMeta);
  }

  if (params.missingContent > 0) {
    actions.push(ui.actionContent);
  }

  if (!params.adsReady) {
    actions.push(ui.actionAds);
  }

  if (params.noRecentJobs) {
    actions.push(ui.actionFreshness);
  }

  if (actions.length === 0) {
    actions.push(ui.actionNext);
  }

  return actions.slice(0, 4);
}

export async function AdminOverview({ lang }: { lang: Lang }) {
  const ui = getUi(lang);
  const db = await getDb();
  const jobs = (await db.all(`
    SELECT
      id,
      organization,
      title,
      posts,
      deadline,
      url,
      content_html,
      full_description,
      title_fr,
      organization_fr,
      meta_description,
      telegram_post,
      created_at
    FROM jobs
    ORDER BY id DESC
    LIMIT 500
  `)) as AdminOverviewJob[];

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => !isExpired(job.deadline));
  const expiredJobs = jobs.filter((job) => isExpired(job.deadline));
  const missingMeta = jobs.filter((job) => !job.meta_description?.trim()).length;
  const missingTranslations = jobs.filter(
    (job) => !job.title_fr?.trim() || !job.organization_fr?.trim(),
  ).length;
  const missingTelegram = jobs.filter((job) => !job.telegram_post?.trim()).length;
  const missingContent = jobs.filter(
    (job) => !job.content_html?.trim() && !job.full_description?.trim(),
  ).length;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentAdds = jobs.filter((job) => {
    const createdAt = new Date(job.created_at);
    return !Number.isNaN(createdAt.getTime()) && createdAt.getTime() >= sevenDaysAgo;
  }).length;

  const seoCoverage = totalJobs - missingMeta;
  const translationCoverage = totalJobs - missingTranslations;
  const telegramCoverage = totalJobs - missingTelegram;
  const contentCoverage = totalJobs - missingContent;
  const siteUrlReady = siteConfig.url !== DEFAULT_SITE_URL;
  const adsReady = siteConfig.hasAdsense;
  const latestUpdate = jobs[0]?.created_at;
  const topOrganizations = getTopOrganizations(jobs, ui.unknownOrganization);
  const actions = buildActions(ui, {
    siteUrlReady,
    missingMeta,
    missingContent,
    adsReady,
    noRecentJobs: recentAdds === 0,
  });

  const scoreCards = [
    {
      label: ui.totalJobs,
      value: String(totalJobs),
      hint: ui.recentHint(recentAdds),
      tone: 'from-slate-900 to-slate-700',
    },
    {
      label: ui.activeJobs,
      value: String(activeJobs.length),
      hint: ui.expiredHint(expiredJobs.length),
      tone: 'from-emerald-600 to-green-500',
    },
    {
      label: ui.seoCoverage,
      value: formatPercent(seoCoverage, totalJobs),
      hint: ui.metaHint(missingMeta),
      tone: 'from-blue-700 to-cyan-500',
    },
    {
      label: ui.monetization,
      value: adsReady ? ui.ready : ui.missing,
      hint: adsReady ? ui.adsReady : ui.adsMissing,
      tone: 'from-amber-500 to-orange-500',
    },
  ];

  const statusItems = [
    {
      label: ui.siteConfig,
      value: siteUrlReady ? ui.ready : ui.missing,
      ok: siteUrlReady,
    },
    {
      label: ui.contentReady,
      value: `${formatPercent(contentCoverage, totalJobs)}`,
      ok: missingContent === 0,
    },
    {
      label: ui.translations,
      value: `${formatPercent(translationCoverage, totalJobs)}`,
      ok: missingTranslations === 0,
    },
    {
      label: ui.telegramReady,
      value: `${formatPercent(telegramCoverage, totalJobs)}`,
      ok: missingTelegram === 0,
    },
    {
      label: ui.searchConsole,
      value: siteUrlReady ? ui.manual : ui.missing,
      ok: false,
    },
  ];

  return (
    <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.28),_transparent_30%),linear-gradient(135deg,#0f172a,#1d4ed8_55%,#0f766e)] px-6 py-8 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold tracking-[0.25em]">
              {ui.title}
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              {ui.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium text-cyan-50/90 md:text-base">
              {ui.subtitle}
            </p>
          </div>

          <div className="grid min-w-[260px] grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-[11px] tracking-[0.2em] text-cyan-100">
                {ui.liveSite}
              </p>
              <p className="mt-2 break-all text-sm font-black">{siteConfig.url}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-[11px] tracking-[0.2em] text-cyan-100">
                {ui.lastUpdate}
              </p>
              <p className="mt-2 text-sm font-black">
                {formatDateTime(latestUpdate, lang, ui.unavailable)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scoreCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-3xl bg-gradient-to-br ${card.tone} p-5 text-white shadow-lg shadow-slate-200`}
          >
            <p className="text-xs tracking-[0.2em] text-white/80">{card.label}</p>
            <p className="mt-4 text-3xl font-black">{card.value}</p>
            <p className="mt-2 text-sm font-semibold text-white/80">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/?lang=${lang}&status=active`}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-slate-800"
        >
          {ui.viewActive}
        </Link>
        <Link
          href={`/?lang=${lang}&status=expired`}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-colors hover:bg-slate-100"
        >
          {ui.viewExpired}
        </Link>
        <a
          href="#settings"
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-blue-700"
        >
          {ui.jumpSettings}
        </a>
        <a
          href="#blog"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-colors hover:bg-slate-100"
        >
          {ui.jumpBlog}
        </a>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-2xl font-black text-slate-900">{ui.statusBoard}</h3>
            <div className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-700">
              {ui.recentHint(recentAdds)}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {statusItems.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-900">{item.label}</p>
                    <p className="mt-2 text-sm font-medium text-slate-600">
                      {item.value}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black tracking-[0.18em] ${
                      item.ok
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.ok
                      ? ui.ready
                      : item.label === ui.searchConsole
                        ? ui.manual
                        : ui.missing}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900">{ui.actionList}</h3>
          <div className="mt-5 space-y-3">
            {actions.map((action) => (
              <div key={action} className="rounded-2xl bg-slate-950 p-4 text-white">
                <p className="text-sm font-medium leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900">{ui.topOrganizations}</h3>
          <div className="mt-6 space-y-3">
            {topOrganizations.length === 0 ? (
              <p className="text-sm font-medium text-slate-500">{ui.noData}</p>
            ) : (
              topOrganizations.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-slate-900">{item.name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {ui.trackedShare(formatPercent(item.count, totalJobs))}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white">
                      {item.count}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900">{ui.latestJobs}</h3>
          <div className="mt-6 space-y-3">
            {jobs.slice(0, 8).map((job) => {
              const deadline = job.deadline || ui.unavailable;
              const createdAt = formatDateTime(job.created_at, lang, ui.unavailable);

              return (
                <div
                  key={job.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-300"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-black tracking-[0.18em] text-slate-400">
                        {lang === 'fr'
                          ? job.organization_fr || job.organization
                          : job.organization}
                      </p>
                      <p className="mt-2 text-base font-black leading-snug text-slate-900">
                        {lang === 'fr' ? job.title_fr || job.title : job.title}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        {ui.latestMeta(deadline, createdAt)}
                      </p>
                    </div>
                    <Link
                      href={`/jobs/${job.id}?lang=${lang}`}
                      className="shrink-0 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-blue-700"
                    >
                      {ui.openJob}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
