const DEFAULT_SITE_NAME = 'JOB MAROC PRO';
const DEFAULT_SITE_DESCRIPTION_AR =
  'بوابتك الأولى لفرص العمل والمباريات في المغرب للقطاع العام والخاص.';
const DEFAULT_SITE_DESCRIPTION_FR =
  "Votre portail pour les offres d'emploi et concours au Maroc dans les secteurs public et prive.";
const DEFAULT_SITE_URL = 'https://example.com';

function readEnv(key: string, fallback = ''): string {
  const value = process.env[key]?.trim();
  return value || fallback;
}

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function splitBrandName(name: string): { leading: string; accent: string } {
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return { leading: trimmed, accent: '' };
  }

  return {
    leading: parts.slice(0, -1).join(' '),
    accent: parts[parts.length - 1],
  };
}

function toPublisherId(clientId: string): string {
  return clientId.replace(/^ca-/, '');
}

function toMetadataBase(url: string): URL {
  try {
    return new URL(url);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

const siteName = readEnv('NEXT_PUBLIC_SITE_NAME', DEFAULT_SITE_NAME);
const siteUrl = normalizeUrl(readEnv('NEXT_PUBLIC_SITE_URL', DEFAULT_SITE_URL));
const adsenseClientId = readEnv('NEXT_PUBLIC_ADSENSE_CLIENT_ID');
const hasAdsense = /^ca-pub-\d+$/.test(adsenseClientId);

export const siteConfig = {
  name: siteName,
  descriptionAr: readEnv('NEXT_PUBLIC_SITE_DESCRIPTION_AR', DEFAULT_SITE_DESCRIPTION_AR),
  descriptionFr: readEnv('NEXT_PUBLIC_SITE_DESCRIPTION_FR', DEFAULT_SITE_DESCRIPTION_FR),
  url: siteUrl,
  metadataBase: toMetadataBase(siteUrl),
  brand: splitBrandName(siteName),
  adsenseClientId,
  adsensePublisherId: hasAdsense ? toPublisherId(adsenseClientId) : '',
  hasAdsense,
};
