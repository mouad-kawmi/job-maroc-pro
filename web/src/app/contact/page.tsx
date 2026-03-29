import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { getSiteSettings } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';

type ContactPageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

function getLang(searchParams: { [key: string]: string | undefined }) {
  return searchParams.lang === 'fr' ? 'fr' : 'ar';
}

export async function generateMetadata(
  props: ContactPageProps,
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);

  return {
    title:
      lang === 'fr'
        ? `Contact | ${siteConfig.name}`
        : `اتصل بنا | ${siteConfig.name}`,
    description:
      lang === 'fr'
        ? "Contacter l'equipe du site pour signaler une correction, un lien casse, une question ou un retour utile."
        : 'التواصل مع فريق الموقع من أجل تصحيح معلومة أو التبليغ عن رابط أو طرح سؤال مفيد.',
    alternates: {
      canonical: '/contact',
      languages: {
        ar: '/contact',
        fr: '/contact?lang=fr',
        'x-default': '/contact',
      },
    },
  };
}

export default async function ContactPage(props: ContactPageProps) {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const settings = await getSiteSettings();

  const t =
    lang === 'fr'
      ? {
          badge: 'Contact',
          title: 'Une page de contact claire pour les demandes utiles',
          subtitle:
            "Vous pouvez nous ecrire pour signaler un lien casse, corriger une information, poser une question generale sur le site ou remonter un point editorial a reverifier.",
          emailLabel: 'E-mail principal',
          supportLabel: 'Demandes traitees',
          timingLabel: 'Delai indicatif',
          supportText:
            'Corrections, problemes de lien, retours sur le contenu, questions generales et signaux utiles sur la qualite des pages.',
          timingText:
            'Nous essayons de repondre dans un delai raisonnable selon le volume de messages recus.',
          directTitle: 'Le moyen le plus simple',
          directText:
            "Le contact par e-mail reste le canal principal. Merci d'expliquer clairement votre demande et d'ajouter le lien de la page concernee si possible.",
          cta: 'Envoyer un e-mail',
          usefulTitle: 'Ce que vous pouvez nous envoyer',
          usefulItems: [
            'Un lien qui ne fonctionne plus.',
            'Une correction sur une date, une condition ou un titre.',
            'Un retour sur un guide, une FAQ ou un article.',
          ],
          avoidTitle: 'Ce que le site ne traite pas directement',
          avoidItems: [
            "Les candidatures a la place de l'organisme recruteur.",
            'Les paiements, frais de dossier ou intermediation de recrutement.',
            'Les demandes bancaires ou administratives sensibles.',
          ],
          noteTitle: 'Rappel important',
          noteText:
            "Le site n'embauche pas directement. Pour postuler, il faut toujours passer par la source officielle de l'offre.",
        }
      : {
          badge: 'اتصل بنا',
          title: 'صفحة تواصل واضحة للطلبات والملاحظات المفيدة',
          subtitle:
            'يمكنك مراسلتنا للتبليغ عن رابط لا يعمل، أو تصحيح معلومة، أو طرح سؤال عام حول الموقع، أو الإشارة إلى نقطة تحريرية تحتاج مراجعة.',
          emailLabel: 'البريد الرئيسي',
          supportLabel: 'نوع الطلبات التي نعالجها',
          timingLabel: 'مدة الرد التقريبية',
          supportText:
            'تصحيحات، روابط لا تعمل، ملاحظات حول المحتوى، أسئلة عامة، أو إشارات مفيدة حول جودة الصفحات.',
          timingText:
            'نحاول الرد داخل أجل معقول حسب عدد الرسائل التي نتوصل بها.',
          directTitle: 'الطريقة الأبسط للتواصل',
          directText:
            'البريد الإلكتروني يبقى هو القناة الأساسية للتواصل معنا. من الأفضل شرح طلبك بشكل واضح وإضافة رابط الصفحة المعنية إن أمكن.',
          cta: 'إرسال بريد إلكتروني',
          usefulTitle: 'ما الذي يمكنك مراسلتنا به',
          usefulItems: [
            'رابط لم يعد يشتغل.',
            'تصحيح في تاريخ أو شرط أو عنوان عرض.',
            'ملاحظة حول دليل أو FAQ أو مقال.',
          ],
          avoidTitle: 'ما الذي لا يعالجه الموقع مباشرة',
          avoidItems: [
            'الترشح نيابة عن الجهة المشغلة.',
            'الأداءات أو الوساطة في التوظيف.',
            'الطلبات البنكية أو المعطيات الإدارية الحساسة.',
          ],
          noteTitle: 'تذكير مهم',
          noteText:
            'الموقع لا يشغل بشكل مباشر. أي ترشح يجب أن يتم دائما من خلال المصدر الرسمي للعرض.',
        };

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir={dir}>
      <Navbar lang={lang} />

      <main className="container mx-auto max-w-6xl px-4 py-10 md:py-12">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-[#0f2167] to-[#1a3a8f] px-6 py-10 text-white md:px-10 md:py-12">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.24em]">
              {t.badge}
            </span>
            <h1 className="mt-4 max-w-4xl text-3xl font-black md:text-5xl">
              {t.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-blue-100 md:text-lg">
              {t.subtitle}
            </p>
          </div>

          <div className="grid gap-8 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
                <h2 className="text-2xl font-black text-slate-900">
                  {t.directTitle}
                </h2>
                <p className="mt-4 text-sm leading-8 text-slate-600 md:text-base">
                  {t.directText}
                </p>
                <a
                  href={`mailto:${settings.contactEmail}?subject=JOB%20MAROC%20PRO`}
                  className="mt-5 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-blue-700"
                >
                  {t.cta}
                </a>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    {t.emailLabel}
                  </p>
                  <p className="mt-3 break-all text-lg font-black text-slate-900">
                    {settings.contactEmail}
                  </p>
                </article>
                <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    {t.supportLabel}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {t.supportText}
                  </p>
                </article>
                <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    {t.timingLabel}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {t.timingText}
                  </p>
                </article>
              </div>
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900">
                  {t.usefulTitle}
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-8 text-slate-600">
                  {t.usefulItems.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 text-emerald-600">&bull;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-3xl border border-amber-100 bg-amber-50/80 p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900">
                  {t.avoidTitle}
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-8 text-slate-600">
                  {t.avoidItems.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 text-amber-600">&bull;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-3xl border border-blue-100 bg-blue-50/70 p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900">
                  {t.noteTitle}
                </h2>
                <p className="mt-3 text-sm leading-8 text-slate-600">
                  {t.noteText}
                </p>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
