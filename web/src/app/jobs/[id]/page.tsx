import type { Metadata } from 'next';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { AdSlot } from '@/components/AdSlot';
import { getDb, Job } from '@/lib/db';
import { isExpired } from '@/lib/date-utils';
import { formatPostsLabel } from '@/lib/job-utils';
import { siteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

type Lang = 'ar' | 'fr';

type PageSearchParams = {
  [key: string]: string | undefined;
};

type JobPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<PageSearchParams>;
};

type JobRecord = Job & {
  meta_description?: string | null;
  telegram_post?: string | null;
};

const ARABIC_MONTHS: Record<string, number> = {
  يناير: 0,
  فبراير: 1,
  مارس: 2,
  أبريل: 3,
  ابريل: 3,
  ماي: 4,
  يونيو: 5,
  يوليوز: 6,
  غشت: 7,
  شتنبر: 8,
  سبتمبر: 8,
  أكتوبر: 9,
  اكتوبر: 9,
  نونبر: 10,
  نوفمبر: 10,
  دجنبر: 11,
  ديسمبر: 11,
};

const FRENCH_MONTHS: Record<string, number> = {
  janvier: 0,
  fevrier: 1,
  février: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  aout: 7,
  août: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  decembre: 11,
  décembre: 11,
};

function AdSpot({ label, height = 'min-h-[100px]' }: { label: string; height?: string }) {
  return <AdSlot label={label} heightClassName={height} />;
}

function getLang(searchParams: PageSearchParams): Lang {
  return searchParams.lang === 'fr' ? 'fr' : 'ar';
}

async function getJobById(id: string): Promise<JobRecord | undefined> {
  const db = await getDb();
  return db.get('SELECT * FROM jobs WHERE id = ?', [id]);
}

function getLocalizedTitle(job: JobRecord, lang: Lang): string {
  return lang === 'fr' ? job.title_fr?.trim() || job.title : job.title;
}

function getLocalizedOrganization(job: JobRecord, lang: Lang): string {
  return lang === 'fr' ? job.organization_fr?.trim() || job.organization : job.organization;
}

function buildJobPath(id: number | string, lang: Lang): string {
  return lang === 'fr' ? `/jobs/${id}?lang=fr` : `/jobs/${id}`;
}

function buildJobUrl(id: number | string, lang: Lang): string {
  return `${siteConfig.url}${buildJobPath(id, lang)}`;
}

function toPlainText(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\((.*?)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_>~-]/g, ' ')
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateText(value: string, length: number): string {
  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, Math.max(0, length - 1)).trim()}…`;
}

function getJobDescription(job: JobRecord, lang: Lang): string {
  const metaDescription = job.meta_description?.trim();
  if (metaDescription) {
    return truncateText(metaDescription, 160);
  }

  const source = job.content_html?.trim() || job.full_description?.trim() || '';
  const plainText = toPlainText(source);

  if (plainText) {
    return truncateText(plainText, 160);
  }

  if (lang === 'fr') {
    return `Consultez les details de l'offre ${getLocalizedTitle(job, lang)} chez ${getLocalizedOrganization(job, lang)} sur ${siteConfig.name}.`;
  }

  return `اطلع على تفاصيل فرصة ${getLocalizedTitle(job, lang)} لدى ${getLocalizedOrganization(job, lang)} على ${siteConfig.name}.`;
}

function toIsoDate(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function parseDeadlineToIso(deadline?: string): string | undefined {
  if (!deadline) {
    return undefined;
  }

  const normalized = deadline.replace(/\s+/g, ' ').trim();
  const dateMatch = normalized.match(/^(\d{1,2})\s+([^\s]+)\s+(\d{4})(?:\s*[-/]\s*(\d{1,2})[:h](\d{1,2}))?$/i);

  if (!dateMatch) {
    return undefined;
  }

  const day = Number(dateMatch[1]);
  const monthName = dateMatch[2].toLowerCase();
  const year = Number(dateMatch[3]);
  const hours = Number(dateMatch[4] || 23);
  const minutes = Number(dateMatch[5] || 59);

  const monthIndex =
    ARABIC_MONTHS[dateMatch[2]] ??
    FRENCH_MONTHS[monthName] ??
    FRENCH_MONTHS[monthName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')];

  if (monthIndex === undefined) {
    return undefined;
  }

  const parsedDate = new Date(Date.UTC(year, monthIndex, day, hours, minutes));
  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toISOString();
}

function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function getOpportunitySummary(job: JobRecord, lang: Lang): string {
  const title = getLocalizedTitle(job, lang);
  const organization = getLocalizedOrganization(job, lang);
  const description = getJobDescription(job, lang);

  if (lang === 'fr') {
    return `${description} Cette page vous aide a comprendre rapidement le poste ${title}, l'organisme ${organization}, le delai de candidature et les points a verifier avant d'envoyer votre dossier.`;
  }

  return `${description} هذه الصفحة تساعدك على فهم فرصة ${title} لدى ${organization} بسرعة، مع أهم النقاط التي يجب مراجعتها قبل إرسال ملف الترشيح.`;
}

function getBestFitSignals(job: JobRecord, lang: Lang): string[] {
  const title = getLocalizedTitle(job, lang);
  const organization = getLocalizedOrganization(job, lang);

  if (lang === 'fr') {
    return [
      `Ce poste peut vous convenir si vous ciblez activement le role "${title}".`,
      `Il est utile si vous cherchez une opportunite liee a ${organization} ou a son secteur.`,
      "Il est pertinent pour les candidats qui prennent le temps de lire l'annonce officielle en detail avant de postuler.",
    ];
  }

  return [
    `هذه الفرصة مناسبة لك إذا كنت تستهدف منصب "${title}" بشكل مباشر.`,
    `وهي مفيدة أيضا إذا كنت تبحث عن فرصة مرتبطة بـ ${organization} أو بالقطاع الذي تنتمي إليه.`,
    'كما تناسب المترشحين الذين يراجعون الإعلان الرسمي بتفصيل قبل تجهيز ملفهم.',
  ];
}

function getApplicationChecklist(job: JobRecord, lang: Lang): string[] {
  const deadline = isExpired(job.deadline)
    ? lang === 'fr'
      ? 'Le delai est deja expire, verifiez d abord si une prolongation officielle a ete annoncee.'
      : 'الأجل انتهى بالفعل، لذلك تحقق أولا هل تم الإعلان عن تمديد رسمي.'
    : lang === 'fr'
      ? `Verifiez la date limite (${job.deadline}) et ne laissez pas votre dossier pour la derniere minute.`
      : `راجع آخر أجل (${job.deadline}) ولا تؤجل إرسال الملف حتى آخر لحظة.`;

  if (lang === 'fr') {
    return [
      deadline,
      "Lisez toujours l'annonce officielle complete pour confirmer les conditions, les pieces demandees et la methode de candidature.",
      'Preparez un dossier propre: CV a jour, documents demandes, et informations identiques sur tous vos fichiers.',
      'Conservez le lien source officiel et une copie de votre candidature pour pouvoir la suivre ensuite.',
    ];
  }

  return [
    deadline,
    'اقرأ الإعلان الرسمي كاملا لتتأكد من الشروط والوثائق المطلوبة وطريقة التقديم.',
    'جهز ملفا منظما: سيرة ذاتية محينة، الوثائق المطلوبة، ومعلومات متطابقة في جميع الملفات.',
    'احتفظ بالرابط الرسمي ونسخة من ترشيحك حتى تتمكن من المتابعة بعد ذلك.',
  ];
}

function getApplicationTips(lang: Lang): string[] {
  if (lang === 'fr') {
    return [
      'Adaptez votre CV au poste vise au lieu d envoyer le meme document pour toutes les offres.',
      "Verifiez l'orthographe de votre nom, email et numero de telephone avant validation.",
      "Si l'annonce cite des criteres precis, reprenez-les clairement dans votre dossier quand c'est pertinent.",
    ];
  }

  return [
    'عدل السيرة الذاتية حسب المنصب المستهدف بدل إرسال نفس الملف لجميع العروض.',
    'تأكد من صحة الاسم والبريد الإلكتروني ورقم الهاتف قبل تأكيد الترشيح.',
    'إذا كان الإعلان يذكر شروطا دقيقة، فحاول إبراز ما يوافقها بوضوح داخل ملفك.',
  ];
}

function buildJobPostingSchema(job: JobRecord, lang: Lang) {
  const title = getLocalizedTitle(job, lang);
  const organization = getLocalizedOrganization(job, lang);

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description: getJobDescription(job, lang),
    url: buildJobUrl(job.id, lang),
    datePosted: toIsoDate(job.created_at),
    validThrough: parseDeadlineToIso(job.deadline),
    inLanguage: lang === 'fr' ? 'fr' : 'ar',
    hiringOrganization: {
      '@type': 'Organization',
      name: organization,
      sameAs: job.url,
    },
    identifier: {
      '@type': 'PropertyValue',
      name: siteConfig.name,
      value: `job-${job.id}`,
    },
  };
}

function getUi(lang: Lang) {
  return {
    ar: {
      back: '← العودة الى القائمة',
      deadline: 'آخر أجل:',
      apply: 'التسجيل الآن - الرابط الرسمي',
      expired: 'انتهى الوقت',
      expiredCta: 'انتهت الصلاحية',
      expiredNote: 'نأسف، لقد انتهى أجل التقديم لهذه المباراة.',
      activeNote: 'للتقديم الرسمي، توجه مباشرة الى الموقع الرسمي المعلن في الرابط التالي.',
    },
    fr: {
      back: '← Retour a la liste',
      deadline: 'Date limite :',
      apply: 'Postuler maintenant - lien officiel',
      expired: 'Expiree',
      expiredCta: 'Expiree',
      expiredNote: 'Desole, le delai de candidature pour cette offre est expire.',
      activeNote: 'Pour postuler officiellement, consultez le lien source ci-dessous.',
    },
  }[lang];
}

export async function generateMetadata(props: JobPageProps): Promise<Metadata> {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);
  const job = await getJobById(params.id);

  if (!job) {
    return {
      title: `Offre introuvable | ${siteConfig.name}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const localizedTitle = getLocalizedTitle(job, lang);
  const localizedOrganization = getLocalizedOrganization(job, lang);
  const description = getJobDescription(job, lang);
  const canonical = buildJobPath(job.id, lang);
  const canonicalUrl = buildJobUrl(job.id, lang);

  return {
    title: `${localizedTitle} - ${localizedOrganization}`,
    description,
    alternates: {
      canonical,
      languages: {
        ar: buildJobPath(job.id, 'ar'),
        fr: buildJobPath(job.id, 'fr'),
        'x-default': buildJobPath(job.id, 'ar'),
      },
    },
    openGraph: {
      title: `${localizedTitle} - ${localizedOrganization}`,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: lang === 'fr' ? 'fr_FR' : 'ar_MA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${localizedTitle} - ${localizedOrganization}`,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function JobDetail(props: JobPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const job = await getJobById(params.id);

  if (!job) {
    return notFound();
  }

  const t = getUi(lang);
  const jobPostingSchema = buildJobPostingSchema(job, lang);
  const valueCopy =
    lang === 'fr'
      ? {
          summaryTitle: 'Resume utile de cette offre',
          fitTitle: 'Pour quel profil cette offre peut convenir ?',
          checklistTitle: 'Que verifier avant de postuler ?',
          tipsTitle: 'Conseils pour mieux candidater',
        }
      : {
          summaryTitle: 'ملخص مفيد حول هذه الفرصة',
          fitTitle: 'لمن قد تناسب هذه الفرصة؟',
          checklistTitle: 'ماذا تفعل قبل التقديم؟',
          tipsTitle: 'نصائح تزيد حظوظك',
        };
  const opportunitySummary = getOpportunitySummary(job, lang);
  const bestFitSignals = getBestFitSignals(job, lang);
  const applicationChecklist = getApplicationChecklist(job, lang);
  const applicationTips = getApplicationTips(lang);

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#f1f5f9' }} dir={dir}>
      <Navbar lang={lang} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jobPostingSchema) }}
      />

      <div className="container mx-auto px-4 max-w-4xl mt-4">
        <AdSpot label="728x90 - Leaderboard (Top of Job Detail)" height="min-h-[90px]" />
      </div>

      <main className="container mx-auto px-4 max-w-4xl py-6 flex-grow">
        <Link
          href={`/?lang=${lang}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 mb-5 transition-colors"
        >
          {t.back}
        </Link>

        <article className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#0f2167] to-[#1a3a8f] p-6 md:p-8 text-white">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-black px-3 py-1 rounded-full">
                {getLocalizedOrganization(job, lang)}
              </span>
              <span
                className={`text-white text-xs font-bold px-3 py-1 rounded-full border ${
                  isExpired(job.deadline) ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-red-500/80 border-red-400'
                }`}
              >
                {t.deadline} {isExpired(job.deadline) ? t.expired : job.deadline}
              </span>
              <span className="bg-green-500/80 text-white text-xs font-bold px-3 py-1 rounded-full border border-green-400">
                {formatPostsLabel(job.posts, lang)}
              </span>
            </div>
            <h1 className="text-xl md:text-3xl font-black leading-tight">
              {getLocalizedTitle(job, lang)}
            </h1>
          </div>

          <div className="px-6 md:px-8 pt-6">
            <AdSpot label="336x280 - Rectangle Ad (Under Header)" height="min-h-[90px]" />
          </div>

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

          <div className="px-6 md:px-8 pb-8">
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                <h2 className="text-lg font-black text-slate-900">{valueCopy.summaryTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">{opportunitySummary}</p>
              </section>

              <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                <h2 className="text-lg font-black text-slate-900">{valueCopy.fitTitle}</h2>
                <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
                  {bestFitSignals.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 text-emerald-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
                <h2 className="text-lg font-black text-slate-900">{valueCopy.checklistTitle}</h2>
                <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
                  {applicationChecklist.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 text-amber-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-black text-slate-900">{valueCopy.tipsTitle}</h2>
                <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
                  {applicationTips.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 text-slate-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <div className="px-6 md:px-8 pb-6">
            <AdSpot label="728x90 - In-Content Banner (Mid Article)" height="min-h-[90px]" />
          </div>

          <div className="px-6 md:px-8 pb-8">
            <div
              className={`rounded-2xl p-6 text-center border ${
                isExpired(job.deadline)
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              }`}
            >
              <p
                className={`text-sm font-bold mb-4 ${
                  isExpired(job.deadline) ? 'text-red-600' : 'text-slate-600'
                }`}
              >
                {isExpired(job.deadline) ? t.expiredNote : t.activeNote}
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
                  {t.expiredCta}
                </div>
              )}

              {!isExpired(job.deadline) && (
                <p className="mt-4 text-slate-400 text-xs break-all">{job.url}</p>
              )}
            </div>
          </div>
        </article>

        <div className="mt-8">
          <AdSpot label="728x90 - Horizontal Banner (Below Article)" height="min-h-[90px]" />
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
