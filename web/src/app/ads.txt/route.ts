import { NextResponse } from 'next/server';
import { siteConfig } from '@/lib/site-config';

export const dynamic = 'force-static';

export function GET() {
  const body = siteConfig.hasAdsense
    ? `google.com, ${siteConfig.adsensePublisherId}, DIRECT, f08c47fec0942fa0\n`
    : '# Set NEXT_PUBLIC_ADSENSE_CLIENT_ID to publish your Google AdSense ads.txt entry.\n';

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
