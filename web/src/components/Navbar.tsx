import Link from 'next/link';

export function Navbar({ lang }: { lang: 'ar' | 'fr' }) {
  const t = {
    ar: { home: 'الرئيسية', public: 'المباريات العمومية', private: 'القطاع الخاص', blog: 'المدونة', toggleLang: 'Français', toggleLink: 'fr' },
    fr: { home: 'Accueil', public: 'Secteur Public', private: 'Secteur Privé', blog: 'Blog', toggleLang: 'العربية', toggleLink: 'ar' }
  }[lang];

  return (
    <nav className="bg-[#1e3a8a] text-white shadow-md border-b-4 border-green-600 relative z-50">
      <div className="container mx-auto px-4 py-3 md:py-4 md:min-h-20 flex flex-wrap md:flex-nowrap items-center justify-between">
        <div className="flex flex-row items-center w-full md:w-auto justify-between md:justify-start gap-4" dir="ltr">
          <Link href={`/?lang=${lang}`} className="text-xl md:text-2xl font-black tracking-tighter hover:opacity-90 shrink-0">
            JOB MAROC <span className="text-green-400">PRO</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`?lang=${t.toggleLink}`} className="md:hidden bg-blue-800/80 hover:bg-blue-700 border border-blue-600 px-2 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm">
              {t.toggleLang}
            </Link>
            <label htmlFor="mobile-menu" className="md:hidden p-1.5 cursor-pointer bg-blue-900/50 hover:bg-blue-800 rounded-md border border-blue-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
          </div>
        </div>
        <input type="checkbox" id="mobile-menu" className="hidden peer" />
        <div className="w-full md:w-auto hidden peer-checked:flex flex-col md:flex md:flex-row items-start md:items-center mt-4 md:mt-0 gap-2 md:gap-8 text-sm font-bold uppercase tracking-wide pb-4 md:pb-0 border-t border-blue-800/50 md:border-0 pt-4 md:pt-0">
          <Link href={`/?lang=${lang}`} className="block w-full md:inline-block whitespace-nowrap py-2 md:py-0 hover:text-green-400 transition-colors">{t.home}</Link>
          <Link href={`/?sector=public&lang=${lang}`} className="block w-full md:inline-block whitespace-nowrap py-2 md:py-0 hover:text-green-400 transition-colors">{t.public}</Link>
          <Link href={`/?sector=private&lang=${lang}`} className="block w-full md:inline-block whitespace-nowrap py-2 md:py-0 hover:text-green-400 transition-colors">{t.private}</Link>
          <Link href={`/blog?lang=${lang}`} className="block w-full md:inline-block whitespace-nowrap py-2 md:py-0 hover:text-green-400 transition-colors">{t.blog}</Link>
          <Link href={`?lang=${t.toggleLink}`} className="hidden md:block bg-blue-900/50 hover:bg-blue-800 border border-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ml-2" dir="ltr">
            {t.toggleLang}
          </Link>
        </div>
      </div>
    </nav>
  );
}
