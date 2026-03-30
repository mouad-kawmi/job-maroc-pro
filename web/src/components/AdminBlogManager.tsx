import Link from 'next/link';
import {
  approveBlogDraftAction,
  deleteBlogPostAction,
  regenerateBlogDraftAction,
  rejectBlogDraftAction,
  saveBlogPostAction,
} from '@/app/admin/actions';
import { AdminPostEditor } from '@/components/AdminPostEditor';
import type { BlogPost } from '@/lib/content';

type Lang = 'ar' | 'fr';
type AdminPostFilter = 'all' | 'published' | 'draft' | 'rejected';
const POSTS_PER_PAGE = 6;

function getUi(lang: Lang) {
  if (lang === 'fr') {
    return {
      searchLabel: 'Recherche',
      searchPlaceholder: 'Titre, slug ou tag',
      searchAction: 'Filtrer',
      clearFilters: 'Reinitialiser',
      allPosts: 'Tous',
      allStatuses: 'Tous les statuts',
      showingResults: (count: number, total: number) =>
        `${count} resultat${count > 1 ? 's' : ''} sur ${total}`,
      pageLabel: (page: number, totalPages: number) => `Page ${page} sur ${totalPages}`,
      previousPage: 'Precedent',
      nextPage: 'Suivant',
      searchEmpty:
        'Aucun article ne correspond a la recherche ou au filtre actuel.',
      newPost: 'Nouvel article',
      createPost: "Creer l'article",
      noDynamicPosts: 'Aucun article dynamique pour le moment.',
      savePost: "Enregistrer l'article",
      deletePost: "Supprimer l'article",
      viewPost: "Voir l'article",
      updatedAt: 'Derniere mise a jour',
      editZone: 'Edition rapide',
      editHint:
        'Ouvrez la fiche, ajustez le contenu puis enregistrez vos changements.',
      statusPublished: 'Publie',
      statusDraft: 'Brouillon',
      labels: {
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
    searchLabel: 'البحث',
    searchPlaceholder: 'العنوان او المعرف او الوسم',
    searchAction: 'تصفية',
    clearFilters: 'مسح التصفية',
    allPosts: 'الكل',
    allStatuses: 'كل الحالات',
    showingResults: (count: number, total: number) => `${count} من اصل ${total} مقال`,
    pageLabel: (page: number, totalPages: number) => `صفحة ${page} من ${totalPages}`,
    previousPage: 'السابق',
    nextPage: 'التالي',
    searchEmpty: 'لا توجد مقالات مطابقة للبحث او التصفية الحالية.',
    newPost: 'مقال جديد',
    createPost: 'انشاء المقال',
    noDynamicPosts: 'لا توجد مقالات ديناميكية بعد.',
    savePost: 'حفظ المقال',
    deletePost: 'حذف المقال',
    viewPost: 'عرض المقال',
    updatedAt: 'اخر تحديث',
    editZone: 'منطقة التعديل',
    editHint: 'افتح بطاقة المقال ثم عدل المحتوى واحفظ التغييرات مباشرة.',
    statusPublished: 'منشور',
    statusDraft: 'مسودة',
    labels: {
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

function normalizeAdminPostFilter(value: string | undefined): AdminPostFilter {
  return value === 'published' || value === 'draft' || value === 'rejected'
    ? value
    : 'all';
}

function normalizePage(value: string | undefined) {
  const page = Number.parseInt(value || '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function includesQuery(post: BlogPost, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    post.slug,
    post.titleAr,
    post.titleFr,
    post.excerptAr,
    post.excerptFr,
    post.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function matchesStatus(post: BlogPost, status: AdminPostFilter) {
  if (status === 'rejected') return post.generationStatus === 'rejected';
  if (status === 'published') return post.isPublished;
  if (status === 'draft') return !post.isPublished && post.generationStatus !== 'rejected';
  return true;
}

function buildAdminHref(
  lang: Lang,
  params: Record<string, string | undefined>,
  hash?: string,
) {
  const searchParams = new URLSearchParams();
  searchParams.set('lang', lang);
  for (const [key, value] of Object.entries(params)) {
    if (value) searchParams.set(key, value);
  }
  const query = searchParams.toString();
  return `/admin${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
}

function Field({
  label,
  name,
  defaultValue,
  textarea = false,
  rows = 4,
  type = 'text',
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  textarea?: boolean;
  rows?: number;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={rows}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      )}
    </label>
  );
}

export function AdminBlogManager({
  lang,
  posts,
  searchParams,
}: {
  lang: Lang;
  posts: BlogPost[];
  searchParams: { [key: string]: string | undefined };
}) {
  const baseUi = getUi(lang);
  const ui = {
    ...baseUi,
    statusRejected: lang === 'fr' ? 'Rejete' : 'مرفوض',
    sourceBot: lang === 'fr' ? 'Brouillon bot' : 'مسودة البوت',
    sourceManual: lang === 'fr' ? 'Edition manuelle' : 'تعديل يدوي',
    sourcePayloadMissing:
      lang === 'fr'
        ? 'Regeneration indisponible: source du draft absente.'
        : 'اعادة الصياغة غير متاحة لان بيانات المصدر غير موجودة.',
    approveDraft: lang === 'fr' ? 'Approuver et publier' : 'نشر المسودة',
    rejectDraft: lang === 'fr' ? 'Rejeter' : 'رفض المسودة',
    regenerateDraft: lang === 'fr' ? 'Regenerer le draft' : 'اعادة صياغة المسودة',
  };
  const searchQuery = (searchParams.q || '').trim().toLowerCase();
  const selectedStatus = normalizeAdminPostFilter(searchParams.status);
  const editedSlug = (searchParams.edited || '').trim();
  const filteredPosts = posts.filter(
    (post) => includesQuery(post, searchQuery) && matchesStatus(post, selectedStatus),
  );
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(normalizePage(searchParams.page), totalPages);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );
  const hasFilters = Boolean(searchQuery) || selectedStatus !== 'all';
  const defaultPostDate = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <input type="hidden" name="lang" value={lang} />
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <Field
              label={ui.searchLabel}
              name="q"
              defaultValue={searchParams.q}
              placeholder={ui.searchPlaceholder}
            />
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                {ui.allStatuses}
              </span>
              <select
                name="status"
                defaultValue={selectedStatus}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              >
                <option value="all">{ui.allPosts}</option>
                <option value="published">{ui.statusPublished}</option>
                <option value="draft">{ui.statusDraft}</option>
                <option value="rejected">{ui.statusRejected}</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              {ui.searchAction}
            </button>
            {hasFilters && (
              <Link
                href={buildAdminHref(lang, {}, 'blog')}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                {ui.clearFilters}
              </Link>
            )}
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="space-y-1">
            <p className="font-bold text-slate-700">
              {ui.showingResults(filteredPosts.length, posts.length)}
            </p>
            {filteredPosts.length > 0 && (
              <p className="text-xs font-bold text-slate-400">
                {ui.pageLabel(currentPage, totalPages)}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildAdminHref(lang, { q: searchParams.q || undefined }, 'blog')}
              className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${selectedStatus === 'all' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}
            >
              {ui.allPosts}
            </Link>
            <Link
              href={buildAdminHref(lang, { q: searchParams.q || undefined, status: 'published' }, 'blog')}
              className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${selectedStatus === 'published' ? 'bg-emerald-600 text-white' : 'border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'}`}
            >
              {ui.statusPublished}
            </Link>
            <Link
              href={buildAdminHref(lang, { q: searchParams.q || undefined, status: 'draft' }, 'blog')}
              className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${selectedStatus === 'draft' ? 'bg-amber-500 text-white' : 'border border-amber-200 bg-white text-amber-700 hover:bg-amber-50'}`}
            >
              {ui.statusDraft}
            </Link>
            <Link
              href={buildAdminHref(lang, { q: searchParams.q || undefined, status: 'rejected' }, 'blog')}
              className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${selectedStatus === 'rejected' ? 'bg-rose-600 text-white' : 'border border-rose-200 bg-white text-rose-700 hover:bg-rose-50'}`}
            >
              {ui.statusRejected}
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
        <h3 className="text-lg font-black text-slate-900">{ui.newPost}</h3>
        <AdminPostEditor
          lang={lang}
          action={saveBlogPostAction}
          submitLabel={ui.createPost}
          defaultDate={defaultPostDate}
          hiddenFields={{ lang }}
        />
      </div>

      <div className="mt-6 space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
            {ui.noDynamicPosts}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
            {ui.searchEmpty}
          </div>
        ) : (
          paginatedPosts.map((post) => {
            const shouldOpen =
              editedSlug === post.slug || (hasFilters && paginatedPosts.length === 1);

            return (
              <details
                key={post.id}
                id={`post-${post.slug}`}
                open={shouldOpen}
                className={`rounded-3xl border bg-slate-50 p-5 transition ${
                  shouldOpen
                    ? 'border-blue-300 ring-4 ring-blue-100'
                    : 'border-slate-200'
                }`}
              >
                <summary className="flex cursor-pointer list-none flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-black text-slate-900">
                      {lang === 'fr'
                        ? post.titleFr || post.titleAr
                        : post.titleAr || post.titleFr}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{post.slug}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      {ui.updatedAt}: {post.updatedAt.slice(0, 10)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${
                        post.generationStatus === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : post.isPublished
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {post.generationStatus === 'rejected'
                        ? ui.statusRejected
                        : post.isPublished
                          ? ui.statusPublished
                          : ui.statusDraft}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${
                        post.sourceType === 'bot'
                          ? 'bg-violet-100 text-violet-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {post.sourceType === 'bot' ? ui.sourceBot : ui.sourceManual}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-slate-700">
                      {post.date}
                    </span>
                  </div>
                </summary>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4 text-xs font-bold text-slate-600">
                  <span className="rounded-full bg-white px-3 py-2 text-slate-700">
                    {ui.editZone}
                  </span>
                  <span>{ui.editHint}</span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-200 px-3 py-2 text-slate-700"
                    >
                      #{tag}
                    </span>
                  ))}
                  {post.isPublished && (
                    <Link
                      href={`/blog/${post.slug}?lang=${lang}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-blue-100 px-3 py-2 text-blue-700 transition hover:bg-blue-200"
                    >
                      {ui.viewPost}
                    </Link>
                  )}
                  {post.sourceType === 'bot' && !post.isPublished && post.generationStatus !== 'rejected' && (
                    <span className="rounded-full bg-violet-50 px-3 py-2 text-violet-700">
                      {post.sourcePayload ? ui.regenerateDraft : ui.sourcePayloadMissing}
                    </span>
                  )}
                </div>

                {post.sourceType === 'bot' && !post.isPublished && post.generationStatus !== 'rejected' && (
                  <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                    <form action={approveBlogDraftAction}>
                      <input type="hidden" name="lang" value={lang} />
                      <input type="hidden" name="id" value={String(post.id)} />
                      <input type="hidden" name="q" value={searchParams.q || ''} />
                      <input type="hidden" name="status" value={selectedStatus} />
                      <input type="hidden" name="page" value={String(currentPage)} />
                      <button
                        type="submit"
                        className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
                      >
                        {ui.approveDraft}
                      </button>
                    </form>

                    <form action={rejectBlogDraftAction}>
                      <input type="hidden" name="lang" value={lang} />
                      <input type="hidden" name="id" value={String(post.id)} />
                      <input type="hidden" name="q" value={searchParams.q || ''} />
                      <input type="hidden" name="status" value={selectedStatus} />
                      <input type="hidden" name="page" value={String(currentPage)} />
                      <button
                        type="submit"
                        className="rounded-2xl bg-rose-50 px-5 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-100"
                      >
                        {ui.rejectDraft}
                      </button>
                    </form>

                    {post.sourcePayload ? (
                      <form action={regenerateBlogDraftAction}>
                        <input type="hidden" name="lang" value={lang} />
                        <input type="hidden" name="id" value={String(post.id)} />
                        <input type="hidden" name="q" value={searchParams.q || ''} />
                        <input type="hidden" name="status" value={selectedStatus} />
                        <input type="hidden" name="page" value={String(currentPage)} />
                        <button
                          type="submit"
                          className="rounded-2xl bg-violet-50 px-5 py-3 text-sm font-black text-violet-700 transition hover:bg-violet-100"
                        >
                          {ui.regenerateDraft}
                        </button>
                      </form>
                    ) : null}
                  </div>
                )}

                <div className="mt-5 border-t border-slate-200 pt-5">
                  <AdminPostEditor
                    lang={lang}
                    action={saveBlogPostAction}
                    submitLabel={ui.savePost}
                    initialPost={post}
                    defaultDate={defaultPostDate}
                    hiddenFields={{
                      lang,
                      id: String(post.id),
                      q: searchParams.q || '',
                      status: selectedStatus,
                      page: String(currentPage),
                    }}
                  />
                </div>

                <form action={deleteBlogPostAction} className="mt-3">
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="id" value={String(post.id)} />
                  <input type="hidden" name="q" value={searchParams.q || ''} />
                  <input type="hidden" name="status" value={selectedStatus} />
                  <input type="hidden" name="page" value={String(currentPage)} />
                  <button
                    type="submit"
                    className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100"
                  >
                    {ui.deletePost}
                  </button>
                </form>
              </details>
            );
          })
        )}
      </div>

      {filteredPosts.length > POSTS_PER_PAGE && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {currentPage > 1 && (
            <Link
              href={buildAdminHref(
                lang,
                {
                  q: searchParams.q || undefined,
                  status: selectedStatus === 'all' ? undefined : selectedStatus,
                  page: String(currentPage - 1),
                },
                'blog',
              )}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
            >
              {ui.previousPage}
            </Link>
          )}
          <div className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white">
            {ui.pageLabel(currentPage, totalPages)}
          </div>
          {currentPage < totalPages && (
            <Link
              href={buildAdminHref(
                lang,
                {
                  q: searchParams.q || undefined,
                  status: selectedStatus === 'all' ? undefined : selectedStatus,
                  page: String(currentPage + 1),
                },
                'blog',
              )}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
            >
              {ui.nextPage}
            </Link>
          )}
        </div>
      )}
    </>
  );
}
