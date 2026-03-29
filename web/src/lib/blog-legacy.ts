import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { listBlogPosts, saveBlogPost } from '@/lib/content';

type LegacyCard = {
  slug: string;
  date: string;
  tags: string[];
  title: { ar: string; fr: string };
  excerpt: { ar: string; fr: string };
};

type LegacyDetails = Record<
  string,
  {
    title: { ar: string; fr: string };
    content: { ar: string; fr: string };
  }
>;

let legacyCache:
  | Promise<{
      cards: LegacyCard[];
      details: LegacyDetails;
    }>
  | null = null;

function sliceBetween(source: string, startMarker: string, endMarker: string): string {
  const startIndex = source.indexOf(startMarker);

  if (startIndex === -1) {
    throw new Error(`Unable to find start marker: ${startMarker}`);
  }

  const contentStart = startIndex + startMarker.length;
  const endIndex = source.indexOf(endMarker, contentStart);

  if (endIndex === -1) {
    throw new Error(`Unable to find end marker: ${endMarker}`);
  }

  return source.slice(contentStart, endIndex).trim();
}

function evaluateLiteral<T>(literalSource: string): T {
  const sanitizedSource = literalSource.trim().replace(/;\s*$/, '');
  return vm.runInNewContext(`(${sanitizedSource})`) as T;
}

async function loadLegacyBlogData(): Promise<{
  cards: LegacyCard[];
  details: LegacyDetails;
}> {
  if (!legacyCache) {
    legacyCache = (async () => {
      const pagePath = path.join(process.cwd(), 'src', 'app', 'blog', 'page.tsx');
      const detailPath = path.join(
        process.cwd(),
        'src',
        'app',
        'blog',
        '[slug]',
        'page.tsx',
      );

      const [pageSourceRaw, detailSourceRaw] = await Promise.all([
        readFile(pagePath, 'utf8'),
        readFile(detailPath, 'utf8'),
      ]);
      const pageSource = pageSourceRaw.replace(/\r\n/g, '\n');
      const detailSource = detailSourceRaw.replace(/\r\n/g, '\n');

      const cardsLiteral = sliceBetween(
        pageSource,
        'const STATIC_ARTICLES: BlogCard[] = ',
        '\n\nfunction mergeArticles',
      );
      const detailsLiteral = sliceBetween(
        detailSource,
        "const articles: Record<string, { title: { ar: string, fr: string }, content: { ar: string, fr: string } }> = ",
        '\n\n  return articles[slug] ?? null;',
      );

      return {
        cards: evaluateLiteral<LegacyCard[]>(cardsLiteral),
        details: evaluateLiteral<LegacyDetails>(detailsLiteral),
      };
    })().catch((error) => {
      legacyCache = null;
      throw error;
    });
  }

  return legacyCache;
}

export async function ensureLegacyBlogPosts(): Promise<number> {
  const [{ cards, details }, existingPosts] = await Promise.all([
    loadLegacyBlogData(),
    listBlogPosts({ includeDrafts: true }),
  ]);

  const existingSlugs = new Set(existingPosts.map((post) => post.slug));
  let insertedCount = 0;

  for (const article of cards) {
    if (existingSlugs.has(article.slug)) {
      continue;
    }

    const detailsEntry = details[article.slug];

    if (!detailsEntry) {
      continue;
    }

    await saveBlogPost({
      slug: article.slug,
      date: article.date,
      tags: article.tags.join(','),
      titleAr: detailsEntry.title.ar,
      titleFr: detailsEntry.title.fr,
      excerptAr: article.excerpt.ar,
      excerptFr: article.excerpt.fr,
      contentAr: detailsEntry.content.ar,
      contentFr: detailsEntry.content.fr,
      isPublished: true,
    });

    existingSlugs.add(article.slug);
    insertedCount += 1;
  }

  return insertedCount;
}
