import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export function Footer({ lang }: { lang: 'ar' | 'fr' }) {
  const year = new Date().getFullYear();
  const { leading, accent } = siteConfig.brand;

  const t = {
    ar: {
      blog: 'المدونة',
      about: 'من نحن',
      privacy: 'سياسة الخصوصية',
      contact: 'اتصل بنا',
      footerDisclaimer: 'موقعنا محرك بحث وإخبار، لا نقوم بالتوظيف المباشر.',
      footerRights: `جميع الحقوق محفوظة © ${year} ${siteConfig.name}`,
    },
    fr: {
      blog: 'Blog',
      about: 'À propos',
      privacy: 'Confidentialité',
      contact: 'Contact',
      footerDisclaimer: 'Notre site est un moteur de recherche, nous ne recrutons pas directement.',
      footerRights: `Tous droits réservés © ${year} ${siteConfig.name}`,
    },
  }[lang];

  return (
    <footer className="footer bg-white border-t border-slate-200 py-12 px-4 mt-auto">
      <div className="container mx-auto max-w-4xl text-center flex flex-col items-center">
        <div className="text-2xl font-black mb-6 tracking-tighter" dir="ltr">
          {leading}
          {accent ? ' ' : ''}
          {accent && <span className="text-green-500">{accent}</span>}
        </div>
        <div className="flex justify-center gap-4 flex-wrap mb-8">
          <Link href={`/blog?lang=${lang}`} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
            {t.blog}
          </Link>
          <Link href={`/about?lang=${lang}`} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
            {t.about}
          </Link>
          <Link href={`/privacy?lang=${lang}`} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
            {t.privacy}
          </Link>
          <Link href={`/contact?lang=${lang}`} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
            {t.contact}
          </Link>
        </div>
        <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto mb-4 leading-relaxed font-bold">{t.footerDisclaimer}</p>
        <p className="text-slate-300 text-[10px] md:text-xs tracking-widest font-black">{t.footerRights}</p>
      </div>
    </footer>
  );
}
