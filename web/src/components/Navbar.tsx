import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export function Navbar({ lang }: { lang: 'ar' | 'fr' }) {
  const t = {
    ar: {
      home: 'الرئيسية',
      public: 'القطاع العام',
      private: 'القطاع الخاص',
      blog: 'المدونة',
      toggleLang: 'Francais',
      toggleLink: 'fr',
    },
    fr: {
      home: 'Accueil',
      public: 'Secteur public',
      private: 'Secteur prive',
      blog: 'Blog',
      toggleLang: 'العربية',
      toggleLink: 'ar',
    },
  }[lang];

  const { leading, accent } = siteConfig.brand;

  return (
    <nav className="relative z-50 border-b-4 border-green-600 bg-[#1e3a8a] text-white shadow-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between px-4 py-3 md:min-h-20 md:flex-nowrap md:py-4">
        <div
          className="flex w-full flex-row items-center justify-between gap-4 md:w-auto md:justify-start"
          dir="ltr"
        >
          <Link
            href={`/?lang=${lang}`}
            className="shrink-0 text-xl font-black tracking-tighter hover:opacity-90 md:text-2xl"
          >
            {leading}
            {accent ? ' ' : ''}
            {accent && <span className="text-green-400">{accent}</span>}
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`?lang=${t.toggleLink}`}
              className="rounded-md border border-blue-600 bg-blue-800/80 px-2 py-1.5 text-xs font-bold shadow-sm transition-all hover:bg-blue-700 md:hidden"
            >
              {t.toggleLang}
            </Link>
            <label
              htmlFor="mobile-menu"
              className="cursor-pointer rounded-md border border-blue-700 bg-blue-900/50 p-1.5 hover:bg-blue-800 md:hidden"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>
        </div>

        <input type="checkbox" id="mobile-menu" className="peer hidden" />

        <div className="mt-4 hidden w-full flex-col items-start gap-2 border-t border-blue-800/50 pt-4 pb-4 text-sm font-bold uppercase tracking-wide peer-checked:flex md:mt-0 md:flex md:w-auto md:flex-row md:items-center md:gap-8 md:border-0 md:pt-0 md:pb-0">
          <Link
            href={`/?lang=${lang}`}
            className="block w-full whitespace-nowrap py-2 transition-colors hover:text-green-400 md:inline-block md:w-auto md:py-0"
          >
            {t.home}
          </Link>
          <Link
            href={`/?sector=public&lang=${lang}`}
            className="block w-full whitespace-nowrap py-2 transition-colors hover:text-green-400 md:inline-block md:w-auto md:py-0"
          >
            {t.public}
          </Link>
          <Link
            href={`/?sector=private&lang=${lang}`}
            className="block w-full whitespace-nowrap py-2 transition-colors hover:text-green-400 md:inline-block md:w-auto md:py-0"
          >
            {t.private}
          </Link>
          <Link
            href={`/blog?lang=${lang}`}
            className="block w-full whitespace-nowrap py-2 transition-colors hover:text-green-400 md:inline-block md:w-auto md:py-0"
          >
            {t.blog}
          </Link>
          <Link
            href={`?lang=${t.toggleLink}`}
            className="ml-2 hidden rounded-lg border border-blue-700 bg-blue-900/50 px-4 py-2 text-sm font-bold shadow-sm transition-all hover:bg-blue-800 md:block"
            dir="ltr"
          >
            {t.toggleLang}
          </Link>
        </div>
      </div>
    </nav>
  );
}
