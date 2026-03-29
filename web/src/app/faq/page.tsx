import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { AdSlot } from '@/components/AdSlot';
import { SITE_FAQ } from '@/lib/site-faq';
import { siteConfig } from '@/lib/site-config';

type Lang = 'ar' | 'fr';

type FaqPageProps = {
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

function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export async function generateMetadata(
  props: FaqPageProps,
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);

  return {
    title:
      lang === 'fr'
        ? `FAQ emploi au Maroc | ${siteConfig.name}`
        : `\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629 | ${siteConfig.name}`,
    description:
      lang === 'fr'
        ? "Les reponses aux questions les plus frequentes sur le site, la lecture des annonces, la candidature et la verification des offres."
        : '\u0627\u0644\u0623\u062c\u0648\u0628\u0629 \u0639\u0644\u0649 \u0623\u0643\u062b\u0631 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0634\u064a\u0648\u0639\u0627 \u062d\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639\u060c \u0648\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a\u060c \u0648\u0627\u0644\u062a\u0642\u062f\u064a\u0645\u060c \u0648\u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0641\u0631\u0635.',
    alternates: {
      canonical: '/faq',
      languages: {
        ar: '/faq',
        fr: '/faq?lang=fr',
        'x-default': '/faq',
      },
    },
  };
}

export default async function FaqPage(props: FaqPageProps) {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SITE_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question[lang],
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer[lang],
      },
    })),
  };

  const t =
    lang === 'fr'
      ? {
          badge: 'Questions frequentes',
          title: 'Les reponses utiles avant de chercher ou de suivre une offre',
          subtitle:
            "Cette page rassemble les questions les plus frequentes autour du site, de la candidature et de la verification des annonces pour vous aider a avancer avec plus de clarte.",
          trustTitle: 'Pourquoi cette page est utile ?',
          trustPoints: [
            "Elle clarifie le role exact du site par rapport aux organismes qui recrutent.",
            "Elle rappelle les bons reflexes avant d'envoyer un dossier ou des donnees personnelles.",
            "Elle donne un point de repere simple pour mieux comprendre les offres et les liens officiels.",
          ],
        }
      : {
          badge: '\u0623\u0633\u0626\u0644\u0629 \u0634\u0627\u0626\u0639\u0629',
          title:
            '\u0623\u062c\u0648\u0628\u0629 \u0645\u0641\u064a\u062f\u0629 \u0642\u0628\u0644 \u0627\u0644\u0628\u062f\u0621 \u0641\u064a \u0627\u0644\u0628\u062d\u062b \u0623\u0648 \u0627\u0644\u062a\u0642\u062f\u064a\u0645',
          subtitle:
            '\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u062a\u062c\u0645\u0639 \u0623\u0643\u062b\u0631 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0634\u064a\u0648\u0639\u0627 \u062d\u0648\u0644 \u0627\u0644\u0645\u0648\u0642\u0639\u060c \u0648\u0627\u0644\u062a\u0631\u0634\u064a\u062d\u060c \u0648\u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0644\u062a\u0633\u0627\u0639\u062f\u0643 \u0639\u0644\u0649 \u0627\u0644\u062a\u0642\u062f\u0645 \u0628\u0634\u0643\u0644 \u0623\u0648\u0636\u062d.',
          trustTitle:
            '\u0644\u0645\u0627\u0630\u0627 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u0641\u064a\u062f\u0629\u061f',
          trustPoints: [
            '\u062a\u0648\u0636\u062d \u062f\u0648\u0631 \u0627\u0644\u0645\u0648\u0642\u0639 \u0628\u062f\u0642\u0629 \u0628\u0627\u0644\u0646\u0633\u0628\u0629 \u0644\u0644\u062c\u0647\u0627\u062a \u0627\u0644\u062a\u064a \u062a\u0634\u063a\u0644.',
            '\u062a\u0630\u0643\u0631\u0643 \u0628\u0627\u0644\u062e\u0637\u0648\u0627\u062a \u0627\u0644\u0635\u062d\u064a\u062d\u0629 \u0642\u0628\u0644 \u0625\u0631\u0633\u0627\u0644 \u0645\u0644\u0641\u0643 \u0623\u0648 \u0628\u064a\u0627\u0646\u0627\u062a\u0643.',
            '\u062a\u0639\u0637\u064a\u0643 \u0645\u0631\u062c\u0639\u0627 \u0633\u0631\u064a\u0639\u0627 \u0644\u0641\u0647\u0645 \u0627\u0644\u0639\u0631\u0648\u0636 \u0648\u0645\u0635\u0627\u062f\u0631\u0647\u0627 \u0627\u0644\u0631\u0633\u0645\u064a\u0629.',
          ],
        };

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir={dir}>
      <Navbar lang={lang} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />

      <div className="bg-gradient-to-br from-[#0f2167] to-[#1a3a8f] px-4 py-12 text-white">
        <div className="container mx-auto max-w-5xl text-center">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.24em]">
            {t.badge}
          </span>
          <h1 className="mt-4 text-3xl font-black md:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-blue-100">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto mt-6 max-w-5xl px-4">
        <AdSpot label="728x90 - FAQ Top Banner" />
      </div>

      <main className="container mx-auto max-w-5xl px-4 py-8">
        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-4">
            {SITE_FAQ.map((item, index) => (
              <article
                key={item.question.fr}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-700">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-lg font-black leading-8 text-slate-900">
                      {item.question[lang]}
                    </h2>
                    <p className="mt-3 text-sm leading-8 text-slate-600">
                      {item.answer[lang]}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <h2 className="text-2xl font-black text-slate-900">
                {t.trustTitle}
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-8 text-slate-600">
                {t.trustPoints.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-1 text-emerald-500">&bull;</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-blue-100 bg-blue-50/70 p-6 shadow-sm md:p-7">
              <h2 className="text-xl font-black text-slate-900">
                {lang === 'fr'
                  ? 'Besoin de plus de clarte ?'
                  : '\u0628\u063a\u064a\u062a \u062a\u0648\u0636\u064a\u062d\u0627 \u0623\u0643\u062b\u0631\u061f'}
              </h2>
              <p className="mt-3 text-sm leading-8 text-slate-600">
                {lang === 'fr'
                  ? "Vous pouvez continuer avec les guides du site, les articles du blog ou la page de contact si vous voulez verifier un point plus precis."
                  : '\u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0627\u0646\u062a\u0642\u0627\u0644 \u0625\u0644\u0649 \u062f\u0644\u0627\u0626\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0623\u0648 \u0645\u0642\u0627\u0644\u0627\u062a \u0627\u0644\u0645\u062f\u0648\u0646\u0629 \u0623\u0648 \u0635\u0641\u062d\u0629 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0625\u0630\u0627 \u0643\u0646\u062a \u062a\u0631\u064a\u062f \u062a\u0648\u0636\u064a\u062d\u0627 \u0623\u0643\u062b\u0631 \u062d\u0648\u0644 \u0646\u0642\u0637\u0629 \u0645\u0639\u064a\u0646\u0629.'}
              </p>
            </section>
          </aside>
        </section>
      </main>

      <div className="container mx-auto mb-12 max-w-5xl px-4">
        <AdSpot label="728x90 - FAQ Footer Banner" />
      </div>

      <Footer lang={lang} />
    </div>
  );
}
