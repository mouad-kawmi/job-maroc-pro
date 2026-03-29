import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { AdSlot } from '@/components/AdSlot';
import { isExpired } from '@/lib/date-utils';
import { getDb, Job } from '@/lib/db';
import { filterJobsBySector } from '@/lib/job-categories';
import { listJobGuides } from '@/lib/job-guides';
import { formatPostsLabel } from '@/lib/job-utils';
import { siteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

type Lang = 'ar' | 'fr';

type GuidesPageProps = {
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

export async function generateMetadata(
  props: GuidesPageProps,
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);

  return {
    title:
      lang === 'fr'
        ? `Guides emploi et concours | ${siteConfig.name}`
        : `\u062f\u0644\u0627\u0626\u0644 \u0627\u0644\u0639\u0645\u0644 \u0648\u0627\u0644\u0645\u0628\u0627\u0631\u064a\u0627\u062a | ${siteConfig.name}`,
    description:
      lang === 'fr'
        ? "Des guides utiles pour mieux comprendre les offres du secteur public et prive au Maroc, verifier les annonces et mieux organiser sa candidature."
        : '\u062f\u0644\u0627\u0626\u0644 \u0639\u0645\u0644\u064a\u0629 \u062a\u0633\u0627\u0639\u062f\u0643 \u0639\u0644\u0649 \u0641\u0647\u0645 \u0641\u0631\u0635 \u0627\u0644\u0642\u0637\u0627\u0639 \u0627\u0644\u0639\u0627\u0645 \u0648\u0627\u0644\u062e\u0627\u0635 \u0641\u064a \u0627\u0644\u0645\u063a\u0631\u0628\u060c \u0648\u062a\u062d\u0642\u0642 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a\u060c \u0648\u062a\u0646\u0638\u0645 \u062a\u0642\u062f\u064a\u0645\u0643 \u0628\u0634\u0643\u0644 \u0623\u0641\u0636\u0644.',
    alternates: {
      canonical: '/guides',
      languages: {
        ar: '/guides',
        fr: '/guides?lang=fr',
        'x-default': '/guides',
      },
    },
  };
}

export default async function GuidesPage(props: GuidesPageProps) {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const db = await getDb();
  const allJobs: Job[] = await db.all(
    'SELECT * FROM jobs ORDER BY id DESC LIMIT 500',
  );
  const activeJobs = allJobs.filter((job) => !isExpired(job.deadline));

  const guides = listJobGuides().map((guide) => {
    const sectorJobs = filterJobsBySector(activeJobs, guide.sector);

    return {
      ...guide,
      activeCount: sectorJobs.length,
      latestJobs: sectorJobs.slice(0, 3),
    };
  });

  const t =
    lang === 'fr'
      ? {
          badge: 'Guides emploi',
          title: 'Des pages utiles pour cibler les bonnes opportunites',
          subtitle:
            "Chaque guide rassemble des conseils pratiques, des questions frequentes et une selection recente d'offres pour mieux organiser votre recherche.",
          activeCount: 'offres actives',
          latestJobs: 'Dernieres opportunites liees',
          readGuide: 'Lire le guide',
          whyTitle: 'Pourquoi ces guides sont utiles ?',
          whyPoints: [
            'Ils vous aident a lire une annonce avec plus de recul.',
            'Ils vous donnent des reperes concrets avant de preparer votre dossier.',
            'Ils relient chaque secteur a des offres recentes deja publiees sur le site.',
          ],
        }
      : {
          badge: '\u062f\u0644\u0627\u0626\u0644 \u0627\u0644\u0639\u0645\u0644',
          title:
            '\u0635\u0641\u062d\u0627\u062a \u0645\u0641\u064a\u062f\u0629 \u062a\u0633\u0627\u0639\u062f\u0643 \u0639\u0644\u0649 \u0627\u0633\u062a\u0647\u062f\u0627\u0641 \u0627\u0644\u0641\u0631\u0635 \u0627\u0644\u0623\u0646\u0633\u0628',
          subtitle:
            '\u0643\u0644 \u062f\u0644\u064a\u0644 \u064a\u062c\u0645\u0639 \u0646\u0635\u0627\u0626\u062d \u0639\u0645\u0644\u064a\u0629\u060c \u0648\u0623\u0633\u0626\u0644\u0629 \u0634\u0627\u0626\u0639\u0629\u060c \u0648\u0639\u064a\u0646\u0629 \u062d\u062f\u064a\u062b\u0629 \u0645\u0646 \u0627\u0644\u0641\u0631\u0635 \u0644\u062a\u0646\u0638\u0645 \u0628\u062d\u062b\u0643 \u0628\u0634\u0643\u0644 \u0623\u0641\u0636\u0644.',
          activeCount: '\u0641\u0631\u0635 \u0646\u0634\u0637\u0629',
          latestJobs: '\u0622\u062e\u0631 \u0627\u0644\u0641\u0631\u0635 \u0627\u0644\u0645\u0631\u062a\u0628\u0637\u0629',
          readGuide: '\u0627\u0642\u0631\u0623 \u0627\u0644\u062f\u0644\u064a\u0644',
          whyTitle:
            '\u0644\u0645\u0627\u0630\u0627 \u0647\u0630\u0647 \u0627\u0644\u062f\u0644\u0627\u0626\u0644 \u0645\u0641\u064a\u062f\u0629\u061f',
          whyPoints: [
            '\u062a\u0633\u0627\u0639\u062f\u0643 \u0639\u0644\u0649 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0628\u0634\u0643\u0644 \u0623\u0648\u0636\u062d.',
            '\u062a\u0645\u0646\u062d\u0643 \u0646\u0642\u0627\u0637\u0627 \u0639\u0645\u0644\u064a\u0629 \u0642\u0628\u0644 \u062a\u062d\u0636\u064a\u0631 \u0645\u0644\u0641 \u0627\u0644\u062a\u0631\u0634\u064a\u062d.',
            '\u062a\u0631\u0628\u0637 \u0643\u0644 \u0642\u0637\u0627\u0639 \u0628\u0641\u0631\u0635 \u062d\u062f\u064a\u062b\u0629 \u0645\u0646\u0634\u0648\u0631\u0629 \u0628\u0627\u0644\u0645\u0648\u0642\u0639.',
          ],
        };

  return (
    <div
      className="min-h-screen bg-slate-50 font-sans"
      dir={dir}
    >
      <Navbar lang={lang} />

      <div className="bg-gradient-to-br from-[#0f2167] to-[#1a3a8f] px-4 py-12 text-white">
        <div className="container mx-auto max-w-5xl text-center">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.28em]">
            {t.badge}
          </span>
          <h1 className="mt-4 text-3xl font-black md:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-blue-100">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto mt-6 max-w-5xl px-4">
        <AdSpot label="728x90 - Guides Top Banner" />
      </div>

      <main className="container mx-auto max-w-5xl px-4 py-8">
        <section className="grid gap-5 md:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}?lang=${lang}`}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl"
            >
              <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] px-6 py-5 text-white">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em]">
                    {guide.sector === 'public'
                      ? lang === 'fr'
                        ? 'Public'
                        : '\u0639\u0627\u0645'
                      : lang === 'fr'
                        ? 'Prive'
                        : '\u062e\u0627\u0635'}
                  </span>
                  <span className="text-xs font-bold text-blue-100">
                    {guide.activeCount}+ {t.activeCount}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-black leading-snug">
                  {guide.titles[lang]}
                </h2>
              </div>

              <div className="space-y-5 p-6">
                <p className="text-sm leading-7 text-slate-600">
                  {guide.overviews[lang]}
                </p>

                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.22em] text-slate-400">
                    {t.latestJobs}
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {guide.latestJobs.map((job) => (
                      <li
                        key={job.id}
                        className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <p className="text-sm font-black text-slate-900">
                          {lang === 'fr' ? job.title_fr || job.title : job.title}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {lang === 'fr'
                            ? job.organization_fr || job.organization
                            : job.organization}
                          {' • '}
                          {formatPostsLabel(job.posts, lang)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <ul className="space-y-2 text-sm leading-7 text-slate-600">
                  {guide.keyPoints[lang].slice(0, 3).map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-1 text-emerald-500">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <span className="inline-flex text-sm font-black uppercase tracking-[0.18em] text-blue-600 group-hover:text-blue-700">
                  {t.readGuide} →
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black text-slate-900">{t.whyTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {t.whyPoints.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-7 text-slate-600"
              >
                {point}
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="container mx-auto mb-12 max-w-5xl px-4">
        <AdSpot label="728x90 - Guides Footer Banner" />
      </div>

      <Footer lang={lang} />
    </div>
  );
}
