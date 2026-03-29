import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { loginAdminAction } from '@/app/admin/actions';
import {
  isAdminAuthenticated,
  isAdminPasswordConfigured,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: {
    index: false,
    follow: false,
  },
};

type Lang = 'ar' | 'fr';

function getUi(lang: Lang) {
  if (lang === 'fr') {
    return {
      backToSite: 'Retour au site',
      backArrow: '<-',
      badge: 'Admin V1',
      title: 'Connexion administrateur',
      text:
        'Cette page protege le panneau du blog et les parametres du site avec un acces reserve.',
      missingConfig:
        "Configurez ADMIN_PASSWORD dans les variables d'environnement du projet puis redemarrez le serveur.",
      invalidPassword: 'Mot de passe incorrect. Veuillez reessayer.',
      locked: 'Trop de tentatives. Reessayez dans quelques minutes.',
      notConfigured: "Le mot de passe admin n'est pas encore configure.",
      loggedOut: 'Deconnexion effectuee avec succes.',
      passwordLabel: 'Mot de passe admin',
      submit: 'Acceder au panneau',
      arabic: 'Arabe',
      french: 'Francais',
    };
  }

  return {
    backToSite: '\u0627\u0644\u0639\u0648\u062f\u0629 \u0627\u0644\u0649 \u0627\u0644\u0645\u0648\u0642\u0639',
    backArrow: '->',
    badge: 'Admin V1',
    title: '\u062a\u0633\u062c\u064a\u0644 \u062f\u062e\u0648\u0644 \u0627\u0644\u0627\u062f\u0627\u0631\u0629',
    text:
      '\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u062a\u062d\u0645\u064a \u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645 \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0627\u0644\u0645\u062f\u0648\u0646\u0629 \u0648\u0627\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u0648\u0642\u0639 \u0628\u0648\u0627\u0633\u0637\u0629 \u062f\u062e\u0648\u0644 \u0645\u062d\u0645\u064a.',
    missingConfig:
      '\u0642\u0645 \u0628\u062a\u062c\u0647\u064a\u0632 ADMIN_PASSWORD \u0641\u064a \u0645\u062a\u063a\u064a\u0631\u0627\u062a \u0628\u064a\u0626\u0629 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u062b\u0645 \u0627\u0639\u062f \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u062e\u0627\u062f\u0645.',
    invalidPassword:
      '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629. \u064a\u0631\u062c\u0649 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u0646 \u062c\u062f\u064a\u062f.',
    locked:
      '\u0643\u062b\u0631\u062a \u0645\u062d\u0627\u0648\u0644\u0627\u062a \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644. \u062d\u0627\u0648\u0644 \u0645\u0646 \u062c\u062f\u064a\u062f \u0628\u0639\u062f \u0628\u0636\u0639 \u062f\u0642\u0627\u0626\u0642.',
    notConfigured:
      '\u0644\u0645 \u064a\u062a\u0645 \u0628\u0639\u062f \u0636\u0628\u0637 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0627\u0644\u0627\u062f\u0627\u0631\u0629.',
    loggedOut:
      '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c \u0628\u0646\u062c\u0627\u062d.',
    passwordLabel: '\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0627\u0644\u0627\u062f\u0627\u0631\u0629',
    submit: '\u0627\u0644\u062f\u062e\u0648\u0644 \u0627\u0644\u0649 \u0627\u0644\u0644\u0648\u062d\u0629',
    arabic: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629',
    french: 'Francais',
  };
}

export default async function AdminLoginPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as Lang;

  if (await isAdminAuthenticated()) {
    redirect(`/admin?lang=${lang}`);
  }

  const error = searchParams.error;
  const loggedOut = searchParams.loggedOut === '1';
  const isConfigured = isAdminPasswordConfigured();
  const ui = getUi(lang);

  return (
    <main
      className="min-h-screen bg-slate-950 px-4 py-10 text-white"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/?lang=${lang}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition-colors hover:text-white"
          >
            {ui.backArrow} {ui.backToSite}
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/login?lang=ar"
              className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                lang === 'ar'
                  ? 'bg-white text-slate-950'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {ui.arabic}
            </Link>
            <Link
              href="/admin/login?lang=fr"
              className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                lang === 'fr'
                  ? 'bg-white text-slate-950'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {ui.french}
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
            {ui.badge}
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight">{ui.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">{ui.text}</p>

          {!isConfigured && (
            <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              {ui.missingConfig}
            </div>
          )}

          {error === 'invalid' && (
            <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
              {ui.invalidPassword}
            </div>
          )}

          {error === 'locked' && (
            <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
              {ui.locked}
            </div>
          )}

          {error === 'missing' && (
            <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              {ui.notConfigured}
            </div>
          )}

          {loggedOut && (
            <div className="mt-6 rounded-2xl border border-sky-400/30 bg-sky-400/10 p-4 text-sm text-sky-100">
              {ui.loggedOut}
            </div>
          )}

          <form action={loginAdminAction} className="mt-8 space-y-5">
            <input type="hidden" name="lang" value={lang} />
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-slate-200"
              >
                {ui.passwordLabel}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-400/15"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={!isConfigured}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {ui.submit}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
