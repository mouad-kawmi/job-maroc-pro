'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { loginAdmin, logoutAdmin, requireAdminAuth } from '@/lib/admin-auth';
import { deleteBlogPost, saveBlogPost, saveSiteSettings } from '@/lib/content';

type Lang = 'ar' | 'fr';
type AdminPostFilter = 'all' | 'published' | 'draft';

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function readLang(formData: FormData): Lang {
  return formData.get('lang') === 'fr' ? 'fr' : 'ar';
}

function readAdminPostFilter(formData: FormData): AdminPostFilter {
  const value = readString(formData, 'status');
  return value === 'published' || value === 'draft' ? value : 'all';
}

function readPage(formData: FormData): string | undefined {
  const raw = readString(formData, 'page');
  const page = Number.parseInt(raw, 10);
  return Number.isFinite(page) && page > 1 ? String(page) : undefined;
}

function buildRoute(
  pathname: string,
  lang: Lang,
  params: Record<string, string | undefined> = {},
  hash?: string,
): string {
  const searchParams = new URLSearchParams();
  searchParams.set('lang', lang);

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  return `${pathname}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
}

export async function loginAdminAction(formData: FormData) {
  const lang = readLang(formData);
  const result = await loginAdmin(readString(formData, 'password'));

  if (result === 'ok') {
    redirect(buildRoute('/admin', lang, { saved: 'login' }));
  }

  if (result === 'missing') {
    redirect(buildRoute('/admin/login', lang, { error: 'missing' }));
  }

  if (result === 'locked') {
    redirect(buildRoute('/admin/login', lang, { error: 'locked' }));
  }

  redirect(buildRoute('/admin/login', lang, { error: 'invalid' }));
}

export async function logoutAdminAction(formData: FormData) {
  const lang = readLang(formData);
  await logoutAdmin();
  redirect(buildRoute('/admin/login', lang, { loggedOut: '1' }));
}

export async function saveSiteSettingsAction(formData: FormData) {
  await requireAdminAuth();
  const lang = readLang(formData);

  await saveSiteSettings({
    footerDisclaimerAr: readString(formData, 'footerDisclaimerAr'),
    footerDisclaimerFr: readString(formData, 'footerDisclaimerFr'),
    contactEmail: readString(formData, 'contactEmail'),
    contactSupportAr: readString(formData, 'contactSupportAr'),
    contactSupportFr: readString(formData, 'contactSupportFr'),
    contactNoteAr: readString(formData, 'contactNoteAr'),
    contactNoteFr: readString(formData, 'contactNoteFr'),
    contactSubtitleAr: readString(formData, 'contactSubtitleAr'),
    contactSubtitleFr: readString(formData, 'contactSubtitleFr'),
    aboutSubtitleAr: readString(formData, 'aboutSubtitleAr'),
    aboutSubtitleFr: readString(formData, 'aboutSubtitleFr'),
    aboutMissionAr: readString(formData, 'aboutMissionAr'),
    aboutMissionFr: readString(formData, 'aboutMissionFr'),
    aboutOfferAr: readString(formData, 'aboutOfferAr'),
    aboutOfferFr: readString(formData, 'aboutOfferFr'),
    aboutCommitmentAr: readString(formData, 'aboutCommitmentAr'),
    aboutCommitmentFr: readString(formData, 'aboutCommitmentFr'),
  });

  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/contact');
  revalidatePath('/blog');
  redirect(buildRoute('/admin', lang, { saved: 'settings' }, 'settings'));
}

export async function saveBlogPostAction(formData: FormData) {
  await requireAdminAuth();
  const lang = readLang(formData);
  const search = readString(formData, 'q');
  const status = readAdminPostFilter(formData);
  const page = readPage(formData);

  const post = await saveBlogPost({
    id: readString(formData, 'id'),
    slug: readString(formData, 'slug'),
    date: readString(formData, 'date'),
    tags: readString(formData, 'tags'),
    titleAr: readString(formData, 'titleAr'),
    titleFr: readString(formData, 'titleFr'),
    excerptAr: readString(formData, 'excerptAr'),
    excerptFr: readString(formData, 'excerptFr'),
    contentAr: readString(formData, 'contentAr'),
    contentFr: readString(formData, 'contentFr'),
    isPublished: formData.get('isPublished') === 'on',
  });

  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/sitemap.xml');
  redirect(
    buildRoute(
      '/admin',
      lang,
      {
        saved: 'post',
        edited: post.slug,
        state: post.isPublished ? 'published' : 'draft',
        q: search || undefined,
        page,
        status: status === 'all' ? undefined : status,
      },
      `post-${post.slug}`,
    ),
  );
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireAdminAuth();
  const lang = readLang(formData);
  const search = readString(formData, 'q');
  const status = readAdminPostFilter(formData);
  const page = readPage(formData);

  const slug = await deleteBlogPost(readString(formData, 'id'));

  revalidatePath('/blog');

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }

  revalidatePath('/sitemap.xml');
  redirect(
    buildRoute(
      '/admin',
      lang,
      {
        deleted: '1',
        q: search || undefined,
        page,
        status: status === 'all' ? undefined : status,
      },
      'blog',
    ),
  );
}
