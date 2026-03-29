import { getDb } from '@/lib/db';
import { getContentPool, hasContentDatabaseUrl } from '@/lib/postgres';

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
    'Ù‡Ø§Ø¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙƒÙŠØ¬Ù…Ø¹ ÙØ±Øµ Ø§Ù„Ø´ØºÙ„ ÙˆØ§Ù„Ù…Ø¨Ø§Ø±ÙŠØ§ØªØŒ ÙˆÙ…Ø§ ÙƒÙŠÙ‚ÙˆÙ…Ø´ Ø¨Ø§Ù„ØªÙˆØ¸ÙŠÙ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±.',
  footerDisclaimerFr:
    "Ce site regroupe les offres d'emploi et concours, sans recrutement direct.",
  contactEmail: 'contact@jobmarocpro.ma',
  contactSupportAr: 'Ù…ØªØ§Ø­ Ø¹Ù„Ù‰ Ù…Ø¯Ø§Ø± Ø§Ù„Ø³Ø§Ø¹Ø© Ø¹Ø¨Ø± Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ.',
  contactSupportFr: 'Disponible 24h/24 via e-mail.',
  contactNoteAr: 'Ù†Ø­Ù† Ù†Ø³Ø¹Ù‰ Ù„Ù„Ø±Ø¯ Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø§Ø³ØªÙØ³Ø§Ø±Ø§Øª ÙÙŠ Ø£Ù‚Ø±Ø¨ ÙˆÙ‚Øª Ù…Ù…ÙƒÙ†.',
  contactNoteFr:
    'Nous nous efforcons de repondre a toutes les demandes le plus rapidement possible.',
  contactSubtitleAr: 'Ù„Ø¯ÙŠÙƒ Ø§Ø³ØªÙØ³Ø§Ø± Ø£Ùˆ Ø§Ù‚ØªØ±Ø§Ø­ØŸ Ù†Ø­Ù† Ù‡Ù†Ø§ Ù„Ù„Ø§Ø³ØªÙ…Ø§Ø¹ Ø¥Ù„ÙŠÙƒ.',
  contactSubtitleFr:
    'Une question ou une suggestion ? Nous sommes la pour vous ecouter.',
  aboutSubtitleAr:
    'ØªØ¹Ø±Ù Ø¹Ù„Ù‰ JOB MAROC PRO ÙˆÙ…Ù‡Ù…ØªÙ†Ø§ ÙÙŠ ØªØ³Ù‡ÙŠÙ„ Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø¹Ù…Ù„ Ø¨Ø§Ù„Ù…ØºØ±Ø¨',
  aboutSubtitleFr:
    "Decouvrez JOB MAROC PRO et notre mission pour faciliter la recherche d'emploi au Maroc",
  aboutMissionAr:
    'JOB MAROC PRO Ù‡Ùˆ Ù…Ø­Ø±Ùƒ Ø¨Ø­Ø« ÙˆÙ…ÙˆÙ‚Ø¹ Ø¥Ø®Ø¨Ø§Ø±ÙŠ Ø±Ø§Ø¦Ø¯ Ù…ØªØ®ØµØµ ÙÙŠ ØªØ¬Ù…ÙŠØ¹ ÙˆÙ†Ø´Ø± Ø¢Ø®Ø± Ù…Ø¨Ø§Ø±ÙŠØ§Øª Ø§Ù„ØªÙˆØ¸ÙŠÙ ÙÙŠ Ø§Ù„Ù‚Ø·Ø§Ø¹ Ø§Ù„Ø¹Ø§Ù… ÙˆØ§Ù„Ù‚Ø·Ø§Ø¹ Ø§Ù„Ø®Ø§Øµ Ø¨Ø§Ù„Ù…ØºØ±Ø¨. Ù‡Ø¯ÙÙ†Ø§ Ù‡Ùˆ Ø¬Ø¹Ù„ Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø¹Ù…Ù„ Ø£Ø³Ù‡Ù„ ÙˆØ£Ø³Ø±Ø¹ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…ØºØ§Ø±Ø¨Ø©.',
  aboutMissionFr:
    "JOB MAROC PRO est un moteur de recherche et un site d'information leader, specialise dans la collecte et la publication des derniers concours de recrutement dans les secteurs public et prive au Maroc. Notre objectif est de rendre la recherche d'emploi plus facile et plus rapide pour tous les Marocains.",
  aboutOfferAr:
    'Ù†Ù‚ÙˆÙ… Ø¨ØªØ­Ø¯ÙŠØ« Ù…ÙˆÙ‚Ø¹Ù†Ø§ ÙŠÙˆÙ…ÙŠØ§ ÙˆØ¨Ø´ÙƒÙ„ ØªÙ„Ù‚Ø§Ø¦ÙŠ Ù„Ù†Ø¶Ù…Ù† ÙˆØµÙˆÙ„ÙƒÙ… Ù„Ø£Ø­Ø¯Ø« Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª ÙÙˆØ± ØµØ¯ÙˆØ±Ù‡Ø§. Ù†ÙˆÙØ± ØªÙØ§ØµÙŠÙ„ Ø¯Ù‚ÙŠÙ‚Ø© Ø­ÙˆÙ„ Ø´Ø±ÙˆØ· Ø§Ù„ØªØ±Ø´ÙŠØ­ØŒ Ø§Ù„ØªÙˆØ§Ø±ÙŠØ® Ø§Ù„Ù‡Ø§Ù…Ø©ØŒ ÙˆØ±ÙˆØ§Ø¨Ø· Ø§Ù„ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø©.',
  aboutOfferFr:
    "Nous mettons a jour notre site quotidiennement et automatiquement pour vous garantir l'acces aux dernieres annonces des leur publication. Nous fournissons des details precis sur les conditions de candidature, les dates importantes et les liens de postulation directe.",
  aboutCommitmentAr:
    'Ù†Ù„ØªØ²Ù… Ø¨Ø§Ù„Ø´ÙØ§ÙÙŠØ© ÙˆØ§Ù„Ù…ØµØ¯Ø§Ù‚ÙŠØ© ÙÙŠ Ù†Ù‚Ù„ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ù…Ù† Ù…ØµØ§Ø¯Ø±Ù‡Ø§ Ø§Ù„Ø±Ø³Ù…ÙŠØ©ØŒ Ù…Ø¹ Ø§Ù„Ø­Ø±Øµ Ø¹Ù„Ù‰ ØªØ¬Ø±Ø¨Ø© Ù…Ø³ØªØ®Ø¯Ù… Ø³Ù„Ø³Ø© ÙˆØ§Ø­ØªØ±Ø§ÙÙŠØ©.',
  aboutCommitmentFr:
    "Nous nous engageons a la transparence et a la credibilite dans la transmission des informations provenant de sources officielles, tout en assurant une experience utilisateur fluide et professionnelle.",
} as const;

type SiteSettingsKey = keyof typeof DEFAULT_SITE_SETTINGS;

export type SiteSettings = Record<SiteSettingsKey, string>;

type BlogPostRow = {
  id: number | string;
  slug: string;
  date: string | Date;
  tags: string;
  title_ar: string;
  title_fr: string;
  excerpt_ar: string;
  excerpt_fr: string;
  content_ar: string;
  content_fr: string;
  is_published: number | boolean;
  created_at: string | Date;
  updated_at: string | Date;
};

let sqliteInitPromise: Promise<void> | null = null;
let postgresInitPromise: Promise<void> | null = null;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function logReadFallback(scope: string, error: unknown): void {
  console.warn(`[content] Falling back for ${scope}: ${getErrorMessage(error)}`);
}

function normalizeDateInput(value: string): string {
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? trimmed
    : new Date().toISOString().slice(0, 10);
}

function normalizeStoredDate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const text = String(value);
  return /^\d{4}-\d{2}-\d{2}/.test(text)
    ? text.slice(0, 10)
    : normalizeDateInput(text);
}

function normalizeStoredTimestamp(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : String(value);
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
    id: Number(row.id),
    slug: row.slug,
    date: normalizeStoredDate(row.date),
    tags: normalizeTags(row.tags),
    titleAr: row.title_ar,
    titleFr: row.title_fr,
    excerptAr: row.excerpt_ar,
    excerptFr: row.excerpt_fr,
    contentAr: row.content_ar,
    contentFr: row.content_fr,
    isPublished:
      typeof row.is_published === 'boolean'
        ? row.is_published
        : Boolean(row.is_published),
    createdAt: normalizeStoredTimestamp(row.created_at),
    updatedAt: normalizeStoredTimestamp(row.updated_at),
  };
}

function usePostgresContentStore(): boolean {
  return hasContentDatabaseUrl();
}

async function sqliteTableExists(tableName: string): Promise<boolean> {
  const db = await getDb();
  const row = await db.get<{ name: string }>(
    `
      SELECT name
      FROM sqlite_master
      WHERE type = ? AND name = ?
      LIMIT 1
    `,
    'table',
    tableName,
  );

  return Boolean(row);
}

async function bootstrapPostgresFromSqlite(): Promise<void> {
  try {
    const sqliteDb = await getDb();
    const [hasBlogPostsTable, hasSiteSettingsTable] = await Promise.all([
      sqliteTableExists('blog_posts'),
      sqliteTableExists('site_settings'),
    ]);
    const pool = getContentPool();

    if (hasSiteSettingsTable) {
      const rows = await sqliteDb.all<{ key: SiteSettingsKey; value: string }[]>(
        'SELECT key, value FROM site_settings',
      );

      for (const row of rows) {
        await pool.query(
          `
            INSERT INTO site_settings (key, value)
            VALUES ($1, $2)
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
          `,
          [row.key, row.value],
        );
      }
    }

    if (!hasBlogPostsTable) {
      return;
    }

    const blogRows = await sqliteDb.all<BlogPostRow[]>(
      `
        SELECT *
        FROM blog_posts
        ORDER BY id ASC
      `,
    );

    for (const row of blogRows) {
      await pool.query(
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
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (slug) DO NOTHING
        `,
        [
          row.slug,
          normalizeStoredDate(row.date),
          row.tags,
          row.title_ar,
          row.title_fr,
          row.excerpt_ar,
          row.excerpt_fr,
          row.content_ar,
          row.content_fr,
          typeof row.is_published === 'boolean'
            ? row.is_published
            : Boolean(row.is_published),
          normalizeStoredTimestamp(row.created_at),
          normalizeStoredTimestamp(row.updated_at),
        ],
      );
    }
  } catch (error) {
    logReadFallback('postgres bootstrap from sqlite', error);
  }
}

async function ensureSqliteContentTables() {
  if (!sqliteInitPromise) {
    sqliteInitPromise = (async () => {
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
    })().catch((error) => {
      sqliteInitPromise = null;
      throw error;
    });
  }

  await sqliteInitPromise;
  return getDb();
}

async function ensurePostgresContentTables() {
  if (!postgresInitPromise) {
    postgresInitPromise = (async () => {
      const pool = getContentPool();

      await pool.query(`
        CREATE TABLE IF NOT EXISTS blog_posts (
          id BIGSERIAL PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          date DATE NOT NULL,
          tags TEXT NOT NULL DEFAULT '',
          title_ar TEXT NOT NULL,
          title_fr TEXT NOT NULL,
          excerpt_ar TEXT NOT NULL,
          excerpt_fr TEXT NOT NULL,
          content_ar TEXT NOT NULL,
          content_fr TEXT NOT NULL,
          is_published BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS site_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL DEFAULT ''
        );
      `);

      for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
        await pool.query(
          `
            INSERT INTO site_settings (key, value)
            VALUES ($1, $2)
            ON CONFLICT (key) DO NOTHING
          `,
          [key, value],
        );
      }

      const result = await pool.query<{ count: number }>(
        'SELECT COUNT(*)::int AS count FROM blog_posts',
      );

      if ((result.rows[0]?.count ?? 0) === 0) {
        await bootstrapPostgresFromSqlite();
      }
    })().catch((error) => {
      postgresInitPromise = null;
      throw error;
    });
  }

  await postgresInitPromise;
  return getContentPool();
}

async function ensureUniqueSlug(
  baseSlug: string,
  existingId?: number | null,
): Promise<string> {
  const safeBaseSlug = baseSlug || `article-${Date.now()}`;
  let candidate = safeBaseSlug;
  let suffix = 2;

  while (true) {
    if (usePostgresContentStore()) {
      const pool = await ensurePostgresContentTables();
      const result = await pool.query<{ id: number }>(
        'SELECT id FROM blog_posts WHERE slug = $1 LIMIT 1',
        [candidate],
      );
      const row = result.rows[0];

      if (!row || row.id === existingId) {
        return candidate;
      }
    } else {
      const db = await ensureSqliteContentTables();
      const row = await db.get<{ id: number }>(
        'SELECT id FROM blog_posts WHERE slug = ? LIMIT 1',
        candidate,
      );

      if (!row || row.id === existingId) {
        return candidate;
      }
    }

    candidate = `${safeBaseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    if (usePostgresContentStore()) {
      const pool = await ensurePostgresContentTables();
      const result = await pool.query<{ key: SiteSettingsKey; value: string }>(
        'SELECT key, value FROM site_settings',
      );

      const overrides = Object.fromEntries(
        result.rows.map((row) => [row.key, row.value]),
      ) as Partial<SiteSettings>;

      return {
        ...DEFAULT_SITE_SETTINGS,
        ...overrides,
      };
    }

    const db = await getDb();
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
  } catch (error) {
    logReadFallback('site settings', error);
    return {
      ...DEFAULT_SITE_SETTINGS,
    };
  }
}

export async function saveSiteSettings(
  input: Partial<SiteSettings>,
): Promise<void> {
  if (usePostgresContentStore()) {
    const pool = await ensurePostgresContentTables();

    for (const [key, value] of Object.entries(input)) {
      if (!(key in DEFAULT_SITE_SETTINGS)) {
        continue;
      }

      await pool.query(
        `
          INSERT INTO site_settings (key, value)
          VALUES ($1, $2)
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `,
        [key, value ?? ''],
      );
    }

    return;
  }

  const db = await ensureSqliteContentTables();

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
  try {
    const includeDrafts = options?.includeDrafts ?? false;

    if (usePostgresContentStore()) {
      const pool = await ensurePostgresContentTables();
      const result = await pool.query<BlogPostRow>(
        `
          SELECT *
          FROM blog_posts
          ${includeDrafts ? '' : 'WHERE is_published = TRUE'}
          ORDER BY date DESC, id DESC
        `,
      );

      return result.rows.map(mapBlogPost);
    }

    const db = await getDb();
    const rows = await db.all<BlogPostRow[]>(
      `
        SELECT *
        FROM blog_posts
        ${includeDrafts ? '' : 'WHERE is_published = 1'}
        ORDER BY date DESC, id DESC
      `,
    );

    return rows.map(mapBlogPost);
  } catch (error) {
    logReadFallback('blog posts list', error);
    return [];
  }
}

export async function getBlogPostBySlug(
  slug: string,
  options?: { includeDrafts?: boolean },
): Promise<BlogPost | null> {
  try {
    const includeDrafts = options?.includeDrafts ?? false;

    if (usePostgresContentStore()) {
      const pool = await ensurePostgresContentTables();
      const result = await pool.query<BlogPostRow>(
        `
          SELECT *
          FROM blog_posts
          WHERE slug = $1
          ${includeDrafts ? '' : 'AND is_published = TRUE'}
          LIMIT 1
        `,
        [slug],
      );

      const row = result.rows[0];
      return row ? mapBlogPost(row) : null;
    }

    const db = await getDb();
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
  } catch (error) {
    logReadFallback(`blog post "${slug}"`, error);
    return null;
  }
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
  const isPublished = input.isPublished ?? false;
  const now = new Date().toISOString();

  if (usePostgresContentStore()) {
    const pool = await ensurePostgresContentTables();

    if (id) {
      const result = await pool.query<BlogPostRow>(
        `
          UPDATE blog_posts
          SET slug = $1,
              date = $2,
              tags = $3,
              title_ar = $4,
              title_fr = $5,
              excerpt_ar = $6,
              excerpt_fr = $7,
              content_ar = $8,
              content_fr = $9,
              is_published = $10,
              updated_at = $11
          WHERE id = $12
          RETURNING *
        `,
        [
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
        ],
      );

      const updated = result.rows[0];

      if (!updated) {
        throw new Error('Unable to save blog post.');
      }

      return mapBlogPost(updated);
    }

    const result = await pool.query<BlogPostRow>(
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `,
      [
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
      ],
    );

    const created = result.rows[0];

    if (!created) {
      throw new Error('Unable to save blog post.');
    }

    return mapBlogPost(created);
  }

  const db = await ensureSqliteContentTables();
  const sqliteIsPublished = isPublished ? 1 : 0;

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
      sqliteIsPublished,
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
      sqliteIsPublished,
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

  if (usePostgresContentStore()) {
    const pool = await ensurePostgresContentTables();
    const result = await pool.query<{ slug: string }>(
      `
        DELETE FROM blog_posts
        WHERE id = $1
        RETURNING slug
      `,
      [numericId],
    );

    return result.rows[0]?.slug ?? null;
  }

  const db = await ensureSqliteContentTables();
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
