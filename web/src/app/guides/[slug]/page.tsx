import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { AdSlot } from '@/components/AdSlot';
import { isExpired } from '@/lib/date-utils';
import { getDb, Job } from '@/lib/db';
import { filterJobsBySector } from '@/lib/job-categories';
import { getJobGuide, listJobGuides } from '@/lib/job-guides';
import { formatPostsLabel } from '@/lib/job-utils';
import { siteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

type Lang = 'ar' | 'fr';

type GuidePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

function AdSpot({
  label,
  height = 'min-h-[90px]',
}: {
  label: string;
  height?: string;
}) {
  return <AdSlot label={label} heightClassName={height} />;
}

function getLang(searchParams: { [key: string]: string | undefined }): Lang {
  return searchParams.lang === 'fr' ? 'fr' : 'ar';
}

function buildGuidePath(slug: string, lang: Lang): string {
  return lang === 'fr' ? `/guides/${slug}?lang=fr` : `/guides/${slug}`;
}

function buildGuideUrl(slug: string, lang: Lang): string {
  return `${siteConfig.url}${buildGuidePath(slug, lang)}`;
}

export async function generateMetadata(
  props: GuidePageProps,
): Promise<Metadata> {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);
  const guide = getJobGuide(params.slug);

  if (!guide) {
    return {
      title: `Guide introuvable | ${siteConfig.name}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = guide.titles[lang];
  const description = guide.overviews[lang];

  return {
    title: `${title} | ${siteConfig.name}`,
    description,
    alternates: {
      canonical: buildGuidePath(guide.slug, lang),
      languages: {
        ar: buildGuidePath(guide.slug, 'ar'),
        fr: buildGuidePath(guide.slug, 'fr'),
        'x-default': buildGuidePath(guide.slug, 'ar'),
      },
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: buildGuideUrl(guide.slug, lang),
      siteName: siteConfig.name,
      locale: lang === 'fr' ? 'fr_FR' : 'ar_MA',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteConfig.name}`,
      description,
    },
  };
}

export default async function GuidePage(props: GuidePageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const guide = getJobGuide(params.slug);

  if (!guide) {
    notFound();
  }

  const db = await getDb();
  const allJobs: Job[] = await db.all(
    'SELECT * FROM jobs ORDER BY id DESC LIMIT 500',
  );
  const sectorJobs = filterJobsBySector(allJobs, guide.sector);
  const activeJobs = sectorJobs.filter((job) => !isExpired(job.deadline));
  const expiredJobs = sectorJobs.filter((job) => isExpired(job.deadline));
  const relatedGuides = listJobGuides().filter(
    (candidate) => candidate.slug !== guide.slug,
  );

  const t =
    lang === 'fr'
      ? {
          back: 'Retour aux guides',
          activeJobs: 'offres actives',
          expiredJobs: 'offres expirees',
          latestTitle: 'Dernieres opportunites de ce secteur',
          latestSubtitle:
            'Une selection recente pour relier ce guide a des offres deja publiees sur le site.',
          faqTitle: 'Questions frequentes',
          pointsTitle: 'Points a retenir',
          browseSector: 'Voir toutes les offres de ce secteur',
          otherGuides: 'Autres guides utiles',
          empty:
            "Aucune offre recente n'est disponible pour ce secteur pour le moment.",
        }
      : {
          back: '\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u062f\u0644\u0627\u0626\u0644',
          activeJobs: '\u0641\u0631\u0635 \u0646\u0634\u0637\u0629',
          expiredJobs: '\u0641\u0631\u0635 \u0645\u0646\u062a\u0647\u064a\u0629',
          latestTitle:
            '\u0622\u062e\u0631 \u0627\u0644\u0641\u0631\u0635 \u0627\u0644\u0645\u0631\u062a\u0628\u0637\u0629 \u0628\u0647\u0630\u0627 \u0627\u0644\u0642\u0637\u0627\u0639',
          latestSubtitle:
            '\u0639\u064a\u0646\u0629 \u062d\u062f\u064a\u062b\u0629 \u062a\u0631\u0628\u0637 \u0647\u0630\u0627 \u0627\u0644\u062f\u0644\u064a\u0644 \u0628\u0641\u0631\u0635 \u0645\u0646\u0634\u0648\u0631\u0629 \u0641\u0639\u0644\u064a\u0627 \u0641\u064a \u0627\u0644\u0645\u0648\u0642\u0639.',
          faqTitle: '\u0623\u0633\u0626\u0644\u0629 \u0634\u0627\u0626\u0639\u0629',
          pointsTitle: '\u0623\u0647\u0645 \u0627\u0644\u0646\u0642\u0627\u0637',
          browseSector:
            '\u0634\u0627\u0647\u062f \u062c\u0645\u064a\u0639 \u0641\u0631\u0635 \u0647\u0630\u0627 \u0627\u0644\u0642\u0637\u0627\u0639',
          otherGuides: '\u062f\u0644\u0627\u0626\u0644 \u0623\u062e\u0631\u0649 \u0645\u0641\u064a\u062f\u0629',
          empty:
            '\u0644\u0627 \u062a\u0648\u062c\u062f \u0641\u0631\u0635 \u062d\u062f\u064a\u062b\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0642\u0637\u0627\u0639 \u0641\u064a \u0627\u0644\u0648\u0642\u062a \u0627\u0644\u062d\u0627\u0644\u064a.',
        };

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir={dir}>
      <Navbar lang={lang} />

      <div className="bg-gradient-to-br from-[#0f2167] to-[#1a3a8f] px-4 py-12 text-white">
        <div className="container mx-auto max-w-5xl">
          <Link
            href={`/guides?lang=${lang}`}
            className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-100 transition hover:bg-white/15"
          >
            {t.back}
          </Link>
          <h1 className="mt-5 text-3xl font-black md:text-5xl">
            {guide.titles[lang]}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-blue-100">
            {guide.overviews[lang]}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-3xl font-black">{activeJobs.length}+</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                {t.activeJobs}
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-3xl font-black">{expiredJobs.length}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                {t.expiredJobs}
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-3xl font-black">{guide.faqs[lang].length}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                FAQ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-6 max-w-5xl px-4">
        <AdSpot label="728x90 - Guide Detail Top Banner" />
      </div>

      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-black text-slate-900">
              {t.pointsTitle}
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-8 text-slate-600">
              {guide.keyPoints[lang].map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1 text-emerald-500">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <Link
              href={`/?lang=${lang}&sector=${guide.sector}`}
              className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-blue-700"
            >
              {t.browseSector}
            </Link>
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-black text-slate-900">
              {t.faqTitle}
            </h2>
            <div className="mt-5 space-y-4">
              {guide.faqs[lang].map((item) => (
                <div
                  key={item.question}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <h3 className="text-sm font-black leading-6 text-slate-900">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {t.latestTitle}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                {t.latestSubtitle}
              </p>
            </div>
          </div>

          {activeJobs.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-8 text-center text-sm font-semibold text-slate-500">
              {t.empty}
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {activeJobs.slice(0, 8).map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}?lang=${lang}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg"
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-blue-700">
                      {lang === 'fr'
                        ? job.organization_fr || job.organization
                        : job.organization}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
                      {formatPostsLabel(job.posts, lang)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-black leading-snug text-slate-900 transition-colors group-hover:text-blue-700">
                    {lang === 'fr' ? job.title_fr || job.title : job.title}
                  </h3>
                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    {job.deadline}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {relatedGuides.length > 0 && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-black text-slate-900">
              {t.otherGuides}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {relatedGuides.map((relatedGuide) => (
                <Link
                  key={relatedGuide.slug}
                  href={`/guides/${relatedGuide.slug}?lang=${lang}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-400 hover:bg-white"
                >
                  <p className="text-lg font-black text-slate-900">
                    {relatedGuide.titles[lang]}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {relatedGuide.overviews[lang]}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="container mx-auto mb-12 max-w-5xl px-4">
        <AdSpot label="728x90 - Guide Detail Footer Banner" />
      </div>

      <Footer lang={lang} />
    </div>
  );
}
