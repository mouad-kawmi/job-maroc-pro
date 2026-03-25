import { getDb } from '@/lib/db';
import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://job-maroc.pro';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb();
  
  // 1. Fetch all jobs
  const jobs = await db.all("SELECT id, created_at FROM jobs ORDER BY id DESC");
  const jobUrls = jobs.map((job) => ({
    url: `${SITE_URL}/jobs/${job.id}`,
    lastModified: job.created_at || new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // 2. Blog posts (Hardcoded as seen in blog/page.tsx)
  const blogArticles = [
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
  
  const blogUrls = blogArticles.map((art) => ({
    url: `${SITE_URL}/blog/${art.slug}`,
    lastModified: art.date,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // 3. Static Pages
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ];

  return [...staticPages, ...jobUrls, ...blogUrls];
}
