import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminOverview } from '@/components/AdminOverview';
import { AdminBlogManager } from '@/components/AdminBlogManager';
import {
  logoutAdminAction,
  saveSiteSettingsAction,
} from '@/app/admin/actions';
import { requireAdminAuth } from '@/lib/admin-auth';
import { ensureLegacyBlogPosts } from '@/lib/blog-legacy';
import { getSiteSettings, listBlogPosts } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

type Lang = 'ar' | 'fr';

function getUi(lang: Lang) {
  if (lang === 'fr') {
    return {
      heroBadge: 'Admin Panel V1',
      heroTitle: 'Blog et parametres du site',
      heroText:
        'Gerez les articles, le footer, les pages a propos et contact depuis une seule interface securisee.',
      openBlog: 'Voir le blog',
      openSite: 'Voir le site',
      logout: 'Deconnexion',
      arabic: 'العربية',
      french: 'Francais',
      savedLogin: 'Connexion reussie.',
      savedSettings: 'Les parametres du site ont ete enregistres.',
      savedPost: "L'article du blog a ete enregistre.",
      deletedPost: "L'article du blog a ete supprime.",
      posts: 'Articles',
      published: 'Publies',
      drafts: 'Brouillons',
      noPostYet: 'Aucun article pour le moment.',
      latestPostDate: 'Date du dernier article',
      settingsEyebrow: 'Parametres',
      settingsTitle: 'Footer, a propos, contact',
      settingsText:
        "Modifiez ici le contenu du footer, de la page a propos et de la page contact. Le titre du site, GA4 et Search Console restent geres par les variables d'environnement.",
      saveSettings: 'Enregistrer les parametres',
      blogEyebrow: 'Blog',
      blogTitle: 'Creer et modifier les articles',
      blogText:
        'Les articles statiques existants restent actifs. Cette interface ajoute et modifie les nouveaux articles dynamiques.',
      newPost: 'Nouvel article',
      createPost: "Creer l'article",
      noDynamicPosts: 'Aucun article dynamique pour le moment.',
      savePost: "Enregistrer l'article",
      deletePost: "Supprimer l'article",
      statusPublished: 'Publie',
      statusDraft: 'Brouillon',
      labels: {
        footerDisclaimerAr: 'Description du footer en arabe',
        footerDisclaimerFr: 'Description du footer en francais',
        contactEmail: 'Email de contact',
        contactSubtitleAr: 'Sous-titre contact en arabe',
        contactSubtitleFr: 'Sous-titre contact en francais',
        contactSupportAr: 'Texte support en arabe',
        contactSupportFr: 'Texte support en francais',
        contactNoteAr: 'Note de contact en arabe',
        contactNoteFr: 'Note de contact en francais',
        aboutSubtitleAr: 'Sous-titre a propos en arabe',
        aboutSubtitleFr: 'Sous-titre a propos en francais',
        aboutMissionAr: 'Mission en arabe',
        aboutMissionFr: 'Mission en francais',
        aboutOfferAr: 'Offre en arabe',
        aboutOfferFr: 'Offre en francais',
        aboutCommitmentAr: 'Engagement en arabe',
        aboutCommitmentFr: 'Engagement en francais',
        slug: 'Slug',
        date: 'Date',
        tags: 'Tags separes par des virgules',
        isPublished: 'Publie',
        titleAr: 'Titre en arabe',
        titleFr: 'Titre en francais',
        excerptAr: 'Extrait en arabe',
        excerptFr: 'Extrait en francais',
        contentAr: 'Contenu HTML en arabe',
        contentFr: 'Contenu HTML en francais',
      },
    };
  }

  return {
    heroBadge: 'لوحة الادارة V1',
    heroTitle: 'المدونة واعدادات الموقع',
    heroText:
      'يمكنك من هنا ادارة المقالات وتعديل التذييل وصفحتي من نحن واتصل بنا من خلال واجهة واحدة محمية.',
    openBlog: 'عرض المدونة',
    openSite: 'عرض الموقع',
    logout: 'تسجيل الخروج',
    arabic: 'العربية',
    french: 'Francais',
    savedLogin: 'تم تسجيل الدخول بنجاح.',
    savedSettings: 'تم حفظ اعدادات الموقع.',
    savedPost: 'تم حفظ مقال المدونة.',
    deletedPost: 'تم حذف مقال المدونة.',
    posts: 'المقالات',
    published: 'المنشور',
    drafts: 'المسودات',
    noPostYet: 'لا يوجد اي مقال بعد.',
    latestPostDate: 'تاريخ اخر مقال',
    settingsEyebrow: 'الاعدادات',
    settingsTitle: 'التذييل ومن نحن واتصل بنا',
    settingsText:
      'يمكنك هنا تعديل محتوى التذييل وصفحة من نحن وصفحة اتصل بنا. اما عنوان الموقع وGA4 وSearch Console فما زالت تدار من خلال متغيرات البيئة.',
    saveSettings: 'حفظ الاعدادات',
    blogEyebrow: 'المدونة',
    blogTitle: 'انشاء المقالات وتعديلها',
    blogText:
      'المقالات الثابتة الحالية ستبقى كما هي. هذه الواجهة تضيف المقالات الديناميكية الجديدة وتعدلها.',
    newPost: 'مقال جديد',
    createPost: 'انشاء المقال',
    noDynamicPosts: 'لا توجد مقالات ديناميكية بعد.',
    savePost: 'حفظ المقال',
    deletePost: 'حذف المقال',
    statusPublished: 'منشور',
    statusDraft: 'مسودة',
    labels: {
      footerDisclaimerAr: 'وصف التذييل بالعربية',
      footerDisclaimerFr: 'وصف التذييل بالفرنسية',
      contactEmail: 'بريد التواصل',
      contactSubtitleAr: 'العنوان الفرعي لصفحة الاتصال بالعربية',
      contactSubtitleFr: 'العنوان الفرعي لصفحة الاتصال بالفرنسية',
      contactSupportAr: 'نص الدعم بالعربية',
      contactSupportFr: 'نص الدعم بالفرنسية',
      contactNoteAr: 'ملاحظة الاتصال بالعربية',
      contactNoteFr: 'ملاحظة الاتصال بالفرنسية',
      aboutSubtitleAr: 'العنوان الفرعي لصفحة من نحن بالعربية',
      aboutSubtitleFr: 'العنوان الفرعي لصفحة من نحن بالفرنسية',
      aboutMissionAr: 'الرسالة بالعربية',
      aboutMissionFr: 'الرسالة بالفرنسية',
      aboutOfferAr: 'ما نقدمه بالعربية',
      aboutOfferFr: 'ما نقدمه بالفرنسية',
      aboutCommitmentAr: 'الالتزام بالعربية',
      aboutCommitmentFr: 'الالتزام بالفرنسية',
      slug: 'المعرف المختصر',
      date: 'التاريخ',
      tags: 'الوسوم مفصولة بفواصل',
      isPublished: 'منشور',
      titleAr: 'العنوان بالعربية',
      titleFr: 'العنوان بالفرنسية',
      excerptAr: 'المقتطف بالعربية',
      excerptFr: 'المقتطف بالفرنسية',
      contentAr: 'المحتوى HTML بالعربية',
      contentFr: 'المحتوى HTML بالفرنسية',
    },
  };
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className={`rounded-3xl border p-5 ${tone}`}>
      <p className="text-xs font-black uppercase tracking-[0.2em]">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  textarea = false,
  rows = 4,
  type = 'text',
}: {
  label: string;
  name: string;
  defaultValue?: string;
  textarea?: boolean;
  rows?: number;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={rows}
          defaultValue={defaultValue}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      )}
    </label>
  );
}

export default async function AdminPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  await requireAdminAuth();
  await ensureLegacyBlogPosts();

  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as Lang;
  const ui = getUi(lang);
  const posts = await listBlogPosts({ includeDrafts: true });
  const settings = await getSiteSettings();
  const publishedPosts = posts.filter((post) => post.isPublished).length;
  const draftPosts = posts.length - publishedPosts;
  const latestPostDate = posts[0]?.date || ui.noPostYet;

  const flashMessage = searchParams.deleted
    ? ui.deletedPost
    : searchParams.saved === 'settings'
      ? ui.savedSettings
      : searchParams.saved === 'post'
        ? searchParams.state === 'draft'
          ? lang === 'fr'
            ? 'Le brouillon est enregistre. Il reste prive dans l administration.'
            : 'تم حفظ المقال كمسودة وهو ظاهر فقط داخل الادارة.'
          : lang === 'fr'
            ? 'L article est enregistre et visible sur le blog public.'
            : 'تم حفظ المقال وهو ظاهر الان في المدونة العامة.'
        : searchParams.saved === 'login'
          ? ui.savedLogin
          : '';

  const flashTone = searchParams.deleted
    ? 'border-amber-200 bg-amber-50 text-amber-900'
    : 'border-emerald-200 bg-emerald-50 text-emerald-800';

  return (
    <main
      className="min-h-screen bg-slate-100 px-4 py-8"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-8 text-white shadow-2xl shadow-slate-300/40">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                {ui.heroBadge}
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                {ui.heroTitle}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                {ui.heroText}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin?lang=ar"
                className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                  lang === 'ar'
                    ? 'bg-white text-slate-950'
                    : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {ui.arabic}
              </Link>
              <Link
                href="/admin?lang=fr"
                className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                  lang === 'fr'
                    ? 'bg-white text-slate-950'
                    : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {ui.french}
              </Link>
              <Link
                href={`/blog?lang=${lang}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                {ui.openBlog}
              </Link>
              <Link
                href={`/?lang=${lang}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                {ui.openSite}
              </Link>
              <form action={logoutAdminAction}>
                <input type="hidden" name="lang" value={lang} />
                <button
                  type="submit"
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-200"
                >
                  {ui.logout}
                </button>
              </form>
            </div>
          </div>
        </div>

        {flashMessage && (
          <div className={`mt-6 rounded-3xl border p-4 text-sm font-bold ${flashTone}`}>
            {flashMessage}
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard
            label={ui.posts}
            value={String(posts.length)}
            tone="border-slate-200 bg-white text-slate-900"
          />
          <StatCard
            label={ui.published}
            value={String(publishedPosts)}
            tone="border-emerald-200 bg-emerald-50 text-emerald-900"
          />
          <StatCard
            label={ui.drafts}
            value={String(draftPosts)}
            tone="border-amber-200 bg-amber-50 text-amber-900"
          />
        </div>

        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          {ui.latestPostDate}:{' '}
          <span className="font-black text-slate-900">{latestPostDate}</span>
        </div>

        <AdminOverview lang={lang} />

        <section
          id="settings"
          className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <SectionTitle
            eyebrow={ui.settingsEyebrow}
            title={ui.settingsTitle}
            text={ui.settingsText}
          />

          <form action={saveSiteSettingsAction} className="space-y-8">
            <input type="hidden" name="lang" value={lang} />
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label={ui.labels.footerDisclaimerAr}
                name="footerDisclaimerAr"
                defaultValue={settings.footerDisclaimerAr}
                textarea
              />
              <Field
                label={ui.labels.footerDisclaimerFr}
                name="footerDisclaimerFr"
                defaultValue={settings.footerDisclaimerFr}
                textarea
              />
              <Field
                label={ui.labels.contactEmail}
                name="contactEmail"
                defaultValue={settings.contactEmail}
                type="email"
              />
              <Field
                label={ui.labels.contactSubtitleAr}
                name="contactSubtitleAr"
                defaultValue={settings.contactSubtitleAr}
                textarea
              />
              <Field
                label={ui.labels.contactSubtitleFr}
                name="contactSubtitleFr"
                defaultValue={settings.contactSubtitleFr}
                textarea
              />
              <Field
                label={ui.labels.contactSupportAr}
                name="contactSupportAr"
                defaultValue={settings.contactSupportAr}
                textarea
              />
              <Field
                label={ui.labels.contactSupportFr}
                name="contactSupportFr"
                defaultValue={settings.contactSupportFr}
                textarea
              />
              <Field
                label={ui.labels.contactNoteAr}
                name="contactNoteAr"
                defaultValue={settings.contactNoteAr}
                textarea
              />
              <Field
                label={ui.labels.contactNoteFr}
                name="contactNoteFr"
                defaultValue={settings.contactNoteFr}
                textarea
              />
              <Field
                label={ui.labels.aboutSubtitleAr}
                name="aboutSubtitleAr"
                defaultValue={settings.aboutSubtitleAr}
                textarea
              />
              <Field
                label={ui.labels.aboutSubtitleFr}
                name="aboutSubtitleFr"
                defaultValue={settings.aboutSubtitleFr}
                textarea
              />
              <Field
                label={ui.labels.aboutMissionAr}
                name="aboutMissionAr"
                defaultValue={settings.aboutMissionAr}
                textarea
                rows={6}
              />
              <Field
                label={ui.labels.aboutMissionFr}
                name="aboutMissionFr"
                defaultValue={settings.aboutMissionFr}
                textarea
                rows={6}
              />
              <Field
                label={ui.labels.aboutOfferAr}
                name="aboutOfferAr"
                defaultValue={settings.aboutOfferAr}
                textarea
                rows={6}
              />
              <Field
                label={ui.labels.aboutOfferFr}
                name="aboutOfferFr"
                defaultValue={settings.aboutOfferFr}
                textarea
                rows={6}
              />
              <Field
                label={ui.labels.aboutCommitmentAr}
                name="aboutCommitmentAr"
                defaultValue={settings.aboutCommitmentAr}
                textarea
                rows={6}
              />
              <Field
                label={ui.labels.aboutCommitmentFr}
                name="aboutCommitmentFr"
                defaultValue={settings.aboutCommitmentFr}
                textarea
                rows={6}
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
            >
              {ui.saveSettings}
            </button>
          </form>
        </section>

        <section
          id="blog"
          className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <SectionTitle
            eyebrow={ui.blogEyebrow}
            title={ui.blogTitle}
            text={ui.blogText}
          />
          <AdminBlogManager lang={lang} posts={posts} searchParams={searchParams} />
        </section>
      </div>
    </main>
  );
}
