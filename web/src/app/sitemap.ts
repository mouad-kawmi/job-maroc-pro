import { MetadataRoute } from 'next';
import { getDb } from '@/lib/db';
import { listBlogPosts } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb();
  
  // 1. Fetch all jobs
  const jobs = await db.all("SELECT id, created_at FROM jobs ORDER BY id DESC");
  const jobUrls = jobs.map((job) => ({
    url: `${siteConfig.url}/jobs/${job.id}`,
    lastModified: job.created_at || new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // 2. Blog posts (static + admin managed)
  const staticBlogArticles = [
    { slug: 'job-search-ads', date: '2025-03-22' },
    { slug: 'cv-writing', date: '2025-03-21' },
    { slug: 'interview-tips', date: '2025-03-20' },
    { slug: 'sectors-2025', date: '2025-03-19' },
    { slug: 'public-concours', date: '2025-03-18' },
    { slug: 'motivation-letter', date: '2025-03-17' },
    { slug: 'linkedin-tips', date: '2025-03-16' },
    { slug: 'demand-jobs', date: '2025-03-15' },
    { slug: 'employee-rights', date: '2025-03-14' },
    { slug: 'anapec-services', date: '2025-03-13' },
  ];
  const dynamicBlogArticles = await listBlogPosts();
  const allBlogArticles = [
    ...dynamicBlogArticles.map((post) => ({
      slug: post.slug,
      date: post.date,
    })),
    ...staticBlogArticles,
  ].filter(
    (article, index, array) =>
      array.findIndex((candidate) => candidate.slug === article.slug) === index,
  );

  const blogUrls = allBlogArticles.map((art) => ({
    url: `${siteConfig.url}/blog/${art.slug}`,
    lastModified: art.date,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // 3. Static Pages
  const staticPages = [
    {
      url: siteConfig.url,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
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
  ];

  return [...staticPages, ...jobUrls, ...blogUrls];
}
