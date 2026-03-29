import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardRedirect(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string' && value.trim()) {
      query.set(key, value);
    }
  }

  redirect(query.toString() ? `/admin?${query.toString()}` : '/admin');
}
