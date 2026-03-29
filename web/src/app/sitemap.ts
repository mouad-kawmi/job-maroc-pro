import { MetadataRoute } from 'next';
import { getDb } from '@/lib/db';
import { listBlogPosts } from '@/lib/content';
import { STATIC_BLOG_CARDS } from '@/lib/blog-static';
import { listJobGuides } from '@/lib/job-guides';
import { siteConfig } from '@/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb();

  const jobs = await db.all('SELECT id, created_at FROM jobs ORDER BY id DESC');
  const jobUrls = jobs.map((job) => ({
    url: `${siteConfig.url}/jobs/${job.id}`,
    lastModified: job.created_at || new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const dynamicBlogArticles = await listBlogPosts();
  const allBlogArticles = [
    ...dynamicBlogArticles.map((post) => ({
      slug: post.slug,
      date: post.date,
    })),
    ...STATIC_BLOG_CARDS.map((article) => ({
      slug: article.slug,
      date: article.date,
    })),
  ].filter(
    (article, index, array) =>
      array.findIndex((candidate) => candidate.slug === article.slug) === index,
  );

  const blogUrls = allBlogArticles.map((article) => ({
    url: `${siteConfig.url}/blog/${article.slug}`,
    lastModified: article.date,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const guideUrls = listJobGuides().map((guide) => ({
    url: `${siteConfig.url}/guides/${guide.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const staticPages = [
    {
      url: siteConfig.url,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/guides`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/faq`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${siteConfig.url}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/privacy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${siteConfig.url}/terms`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${siteConfig.url}/disclaimer`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${siteConfig.url}/editorial-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  return [...staticPages, ...guideUrls, ...jobUrls, ...blogUrls];
}
