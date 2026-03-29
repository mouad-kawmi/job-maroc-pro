import type { Job } from '@/lib/db';

export type JobSector = 'all' | 'public' | 'private';

const PUBLIC_SECTOR_KEYWORDS = [
  'وزارة',
  'المكتب',
  'المؤسسة',
  'المجلس',
  'الوكالة',
  'الصندوق',
  'الأمانة',
  'جامعة',
  'عمالة',
  'محكمة',
  'ولاية',
  'جماعة',
  'جهة',
  'مندوبية',
  'إدارة',
  'القيادة',
  'القوات',
  'الدرك',
  'الأمن',
];

export function isPublicSectorOrganization(organization: string): boolean {
  return PUBLIC_SECTOR_KEYWORDS.some((keyword) => organization.includes(keyword));
}

export function getJobSector(
  job: Pick<Job, 'organization'>,
): Exclude<JobSector, 'all'> {
  return isPublicSectorOrganization(job.organization) ? 'public' : 'private';
}

export function filterJobsBySector<T extends Pick<Job, 'organization'>>(
  jobs: T[],
  sector: JobSector,
): T[] {
  if (sector === 'all') {
    return jobs;
  }

  return jobs.filter((job) =>
    sector === 'public'
      ? isPublicSectorOrganization(job.organization)
      : !isPublicSectorOrganization(job.organization),
  );
}
