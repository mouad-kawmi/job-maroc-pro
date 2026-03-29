import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { getSiteSettings } from '@/lib/content';

export async function Footer({ lang }: { lang: 'ar' | 'fr' }) {
  const year = new Date().getFullYear();
  const { leading, accent } = siteConfig.brand;
  const settings = await getSiteSettings();

  const t = {
    ar: {
      blog: 'المدونة',
      about: 'من نحن',
      privacy: 'سياسة الخصوصية',
      contact: 'اتصل بنا',
      contactUs: 'راسلنا',
      adminLabel: 'ولوج الادارة',
      adminHint: 'هذا المسار مخصص فقط لمسؤولي الموقع.',
      footerDisclaimer: settings.footerDisclaimerAr,
      footerRights: `جميع الحقوق محفوظة © ${year} ${siteConfig.name}`,
    },
    fr: {
      blog: 'Blog',
      about: 'A propos',
      privacy: 'Confidentialite',
      contact: 'Contact',
      contactUs: 'Nous ecrire',
      adminLabel: 'Espace admin',
      adminHint: "Acces reserve a l'administration du site.",
      footerDisclaimer: settings.footerDisclaimerFr,
      footerRights: `Tous droits reserves © ${year} ${siteConfig.name}`,
    },
  }[lang];

  return (
    <footer className="footer mt-auto border-t border-slate-200 bg-white px-4 py-12">
      <div className="container mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-6 text-2xl font-black tracking-tighter" dir="ltr">
          {leading}
          {accent ? ' ' : ''}
          {accent && <span className="text-green-500">{accent}</span>}
        </div>
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <Link
            href={`/blog?lang=${lang}`}
            className="text-sm font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-blue-600"
          >
            {t.blog}
          </Link>
          <Link
            href={`/about?lang=${lang}`}
            className="text-sm font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-blue-600"
          >
            {t.about}
          </Link>
          <Link
            href={`/privacy?lang=${lang}`}
            className="text-sm font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-blue-600"
          >
            {t.privacy}
          </Link>
          <Link
            href={`/contact?lang=${lang}`}
            className="text-sm font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-blue-600"
          >
            {t.contact}
          </Link>
        </div>
        <p className="mb-4 max-w-md text-xs font-bold leading-relaxed text-slate-400 md:text-sm">
          {t.footerDisclaimer}
        </p>
        <a
          href={`mailto:${settings.contactEmail}`}
          className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-blue-600 transition-colors hover:text-blue-800"
        >
          {t.contactUs}: {settings.contactEmail}
        </a>
        <div className="mb-4 flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {t.adminHint}
          </p>
          <Link
            href={`/admin/login?lang=${lang}`}
            className="rounded-full border border-slate-300 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-slate-600 transition-colors hover:border-blue-600 hover:text-blue-600"
          >
            {t.adminLabel}
          </Link>
        </div>
        <p className="text-[10px] font-black tracking-widest text-slate-300 md:text-xs">
          {t.footerRights}
        </p>
      </div>
    </footer>
  );
}
