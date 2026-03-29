import { getDb } from '@/lib/db';

export interface BlogPost {
  id: number;
  slug: string;
  date: string;
  tags: string[];
  titleAr: string;
  titleFr: string;
  excerptAr: string;
  excerptFr: string;
  contentAr: string;
  contentFr: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_SITE_SETTINGS = {
  footerDisclaimerAr:
    'هاد الموقع كيجمع فرص الشغل والمباريات، وما كيقومش بالتوظيف المباشر.',
  footerDisclaimerFr:
    "Ce site regroupe les offres d'emploi et concours, sans recrutement direct.",
  contactEmail: 'contact@jobmarocpro.ma',
  contactSupportAr: 'متاح على مدار الساعة عبر البريد الإلكتروني.',
  contactSupportFr: 'Disponible 24h/24 via e-mail.',
  contactNoteAr: 'نحن نسعى للرد على جميع الاستفسارات في أقرب وقت ممكن.',
  contactNoteFr:
    'Nous nous efforcons de repondre a toutes les demandes le plus rapidement possible.',
  contactSubtitleAr: 'لديك استفسار أو اقتراح؟ نحن هنا للاستماع إليك.',
  contactSubtitleFr:
    'Une question ou une suggestion ? Nous sommes la pour vous ecouter.',
  aboutSubtitleAr:
    'تعرف على JOB MAROC PRO ومهمتنا في تسهيل البحث عن عمل بالمغرب',
  aboutSubtitleFr:
    "Decouvrez JOB MAROC PRO et notre mission pour faciliter la recherche d'emploi au Maroc",
  aboutMissionAr:
    'JOB MAROC PRO هو محرك بحث وموقع إخباري رائد متخصص في تجميع ونشر آخر مباريات التوظيف في القطاع العام والقطاع الخاص بالمغرب. هدفنا هو جعل البحث عن عمل أسهل وأسرع لجميع المغاربة.',
  aboutMissionFr:
    "JOB MAROC PRO est un moteur de recherche et un site d'information leader, specialise dans la collecte et la publication des derniers concours de recrutement dans les secteurs public et prive au Maroc. Notre objectif est de rendre la recherche d'emploi plus facile et plus rapide pour tous les Marocains.",
  aboutOfferAr:
    'نقوم بتحديث موقعنا يوميا وبشكل تلقائي لنضمن وصولكم لأحدث الإعلانات فور صدورها. نوفر تفاصيل دقيقة حول شروط الترشيح، التواريخ الهامة، وروابط التقديم المباشرة.',
  aboutOfferFr:
    "Nous mettons a jour notre site quotidiennement et automatiquement pour vous garantir l'acces aux dernieres annonces des leur publication. Nous fournissons des details precis sur les conditions de candidature, les dates importantes et les liens de postulation directe.",
  aboutCommitmentAr:
    'نلتزم بالشفافية والمصداقية في نقل المعلومات من مصادرها الرسمية، مع الحرص على تجربة مستخدم سلسة واحترافية.',
  aboutCommitmentFr:
    "Nous nous engageons a la transparence et a la credibilite dans la transmission des informations provenant de sources officielles, tout en assurant une experience utilisateur fluide et professionnelle.",
} as const;

type SiteSettingsKey = keyof typeof DEFAULT_SITE_SETTINGS;

export type SiteSettings = Record<SiteSettingsKey, string>;

type BlogPostRow = {
  id: number;
  slug: string;
  date: string;
  tags: string;
  title_ar: string;
  title_fr: string;
  excerpt_ar: string;
  excerpt_fr: string;
  content_ar: string;
  content_fr: string;
  is_published: number;
  created_at: string;
  updated_at: string;
};

let initPromise: Promise<void> | null = null;

function normalizeDateInput(value: string): string {
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? trimmed
    : new Date().toISOString().slice(0, 10);
}

function normalizeTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[-\s]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    date: row.date,
    tags: normalizeTags(row.tags),
    titleAr: row.title_ar,
    titleFr: row.title_fr,
    excerptAr: row.excerpt_ar,
    excerptFr: row.excerpt_fr,
    contentAr: row.content_ar,
    contentFr: row.content_fr,
    isPublished: Boolean(row.is_published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ensureContentTables() {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await getDb();

      await db.exec(`
        CREATE TABLE IF NOT EXISTS blog_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT NOT NULL UNIQUE,
          date TEXT NOT NULL,
          tags TEXT NOT NULL DEFAULT '',
          title_ar TEXT NOT NULL,
          title_fr TEXT NOT NULL,
          excerpt_ar TEXT NOT NULL,
          excerpt_fr TEXT NOT NULL,
          content_ar TEXT NOT NULL,
          content_fr TEXT NOT NULL,
          is_published INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS site_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL DEFAULT ''
        );
      `);

      for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
        await db.run(
          `
            INSERT INTO site_settings (key, value)
            VALUES (?, ?)
            ON CONFLICT(key) DO NOTHING
          `,
          key,
          value,
        );
      }
    })();
  }

  await initPromise;
  return getDb();
}

async function ensureUniqueSlug(
  baseSlug: string,
  existingId?: number | null,
): Promise<string> {
  const db = await ensureContentTables();
  const safeBaseSlug = baseSlug || `article-${Date.now()}`;
  let candidate = safeBaseSlug;
  let suffix = 2;

  while (true) {
    const row = await db.get<{ id: number }>(
      'SELECT id FROM blog_posts WHERE slug = ? LIMIT 1',
      candidate,
    );

    if (!row || row.id === existingId) {
      return candidate;
    }

    candidate = `${safeBaseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = await ensureContentTables();
  const rows = await db.all<{ key: SiteSettingsKey; value: string }[]>(
    'SELECT key, value FROM site_settings',
  );

  const overrides = Object.fromEntries(
    rows.map((row) => [row.key, row.value]),
  ) as Partial<SiteSettings>;

  return {
    ...DEFAULT_SITE_SETTINGS,
    ...overrides,
  };
}

export async function saveSiteSettings(
  input: Partial<SiteSettings>,
): Promise<void> {
  const db = await ensureContentTables();

  for (const [key, value] of Object.entries(input)) {
    if (!(key in DEFAULT_SITE_SETTINGS)) {
      continue;
    }

    await db.run(
      `
        INSERT INTO site_settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `,
      key,
      value ?? '',
    );
  }
}

export async function listBlogPosts(options?: {
  includeDrafts?: boolean;
}): Promise<BlogPost[]> {
  const db = await ensureContentTables();
  const includeDrafts = options?.includeDrafts ?? false;

  const rows = await db.all<BlogPostRow[]>(
    `
      SELECT *
      FROM blog_posts
      ${includeDrafts ? '' : 'WHERE is_published = 1'}
      ORDER BY date DESC, id DESC
    `,
  );

  return rows.map(mapBlogPost);
}

export async function getBlogPostBySlug(
  slug: string,
  options?: { includeDrafts?: boolean },
): Promise<BlogPost | null> {
  const db = await ensureContentTables();
  const includeDrafts = options?.includeDrafts ?? false;

  const row = await db.get<BlogPostRow>(
    `
      SELECT *
      FROM blog_posts
      WHERE slug = ?
      ${includeDrafts ? '' : 'AND is_published = 1'}
      LIMIT 1
    `,
    slug,
  );

  return row ? mapBlogPost(row) : null;
}

export async function saveBlogPost(input: {
  id?: string;
  slug?: string;
  date?: string;
  tags?: string;
  titleAr?: string;
  titleFr?: string;
  excerptAr?: string;
  excerptFr?: string;
  contentAr?: string;
  contentFr?: string;
  isPublished?: boolean;
}): Promise<BlogPost> {
  const db = await ensureContentTables();
  const id = input.id ? Number(input.id) : null;
  const titleAr = (input.titleAr || '').trim();
  const titleFr = (input.titleFr || '').trim();
  const excerptAr = (input.excerptAr || '').trim();
  const excerptFr = (input.excerptFr || '').trim();
  const contentAr = (input.contentAr || '').trim();
  const contentFr = (input.contentFr || '').trim();

  if (!titleAr || !titleFr || !excerptAr || !excerptFr || !contentAr || !contentFr) {
    throw new Error('Missing required blog fields.');
  }

  const preferredSlug =
    slugify(input.slug || '') ||
    slugify(titleFr) ||
    slugify(titleAr) ||
    `article-${Date.now()}`;
  const slug = await ensureUniqueSlug(preferredSlug, id);
  const date = normalizeDateInput(input.date || '');
  const tags = normalizeTags(input.tags || '').join(',');
  const isPublished = input.isPublished ? 1 : 0;
  const now = new Date().toISOString();

  if (id) {
    await db.run(
      `
        UPDATE blog_posts
        SET slug = ?,
            date = ?,
            tags = ?,
            title_ar = ?,
            title_fr = ?,
            excerpt_ar = ?,
            excerpt_fr = ?,
            content_ar = ?,
            content_fr = ?,
            is_published = ?,
            updated_at = ?
        WHERE id = ?
      `,
      slug,
      date,
      tags,
      titleAr,
      titleFr,
      excerptAr,
      excerptFr,
      contentAr,
      contentFr,
      isPublished,
      now,
      id,
    );
  } else {
    await db.run(
      `
        INSERT INTO blog_posts (
          slug,
          date,
          tags,
          title_ar,
          title_fr,
          excerpt_ar,
          excerpt_fr,
          content_ar,
          content_fr,
          is_published,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      slug,
      date,
      tags,
      titleAr,
      titleFr,
      excerptAr,
      excerptFr,
      contentAr,
      contentFr,
      isPublished,
      now,
      now,
    );
  }

  const saved = await db.get<BlogPostRow>(
    'SELECT * FROM blog_posts WHERE slug = ? LIMIT 1',
    slug,
  );

  if (!saved) {
    throw new Error('Unable to save blog post.');
  }

  return mapBlogPost(saved);
}

export async function deleteBlogPost(id: string): Promise<string | null> {
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return null;
  }

  const db = await ensureContentTables();
  const existing = await db.get<{ slug: string }>(
    'SELECT slug FROM blog_posts WHERE id = ? LIMIT 1',
    numericId,
  );

  if (!existing) {
    return null;
  }

  await db.run('DELETE FROM blog_posts WHERE id = ?', numericId);

  return existing.slug;
}
