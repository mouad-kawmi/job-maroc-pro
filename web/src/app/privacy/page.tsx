import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { siteConfig } from '@/lib/site-config';

type PrivacyPageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

function getLang(searchParams: { [key: string]: string | undefined }) {
  return searchParams.lang === 'fr' ? 'fr' : 'ar';
}

export async function generateMetadata(
  props: PrivacyPageProps,
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);

  return {
    title:
      lang === 'fr'
        ? `Confidentialite | ${siteConfig.name}`
        : `سياسة الخصوصية | ${siteConfig.name}`,
    description:
      lang === 'fr'
        ? "Consulter la politique de confidentialite du site: donnees techniques, cookies, liens externes et services tiers."
        : 'الاطلاع على سياسة الخصوصية الخاصة بالموقع: البيانات التقنية، الكوكيز، الروابط الخارجية، والخدمات الخارجية.',
    alternates: {
      canonical: '/privacy',
      languages: {
        ar: '/privacy',
        fr: '/privacy?lang=fr',
        'x-default': '/privacy',
      },
    },
  };
}

export default async function PrivacyPage(props: PrivacyPageProps) {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t =
    lang === 'fr'
      ? {
          badge: 'Politique de confidentialite',
          title: 'Comment nous traitons la confidentialite et les donnees essentielles',
          subtitle:
            "Cette page explique de facon simple quelles donnees techniques peuvent etre collecte es, comment elles servent a ameliorer l'experience et quand des services externes entrent en jeu.",
          lastUpdated: 'Derniere mise a jour : 29 mars 2026',
          sections: [
            {
              heading: '1. Les donnees que nous pouvons collecter',
              paragraphs: [
                "Le site peut collecter des informations techniques limitees comme le navigateur, l'appareil, les pages consultees ou d'autres signaux utiles au suivi du bon fonctionnement de la plateforme.",
                "Si vous nous contactez directement, nous pouvons utiliser les informations que vous nous transmettez, comme votre adresse e-mail, afin de repondre a votre demande.",
              ],
            },
            {
              heading: '2. Cookies et outils techniques',
              paragraphs: [
                "Le site ou certains services relies peuvent utiliser des cookies ou mecanismes similaires pour ameliorer la navigation, memoriser quelques preferences ou mesurer l'usage de facon globale.",
              ],
            },
            {
              heading: '3. Analyse, mesure et publicite',
              paragraphs: [
                "Si des outils d'analyse ou de publicite sont actives, ces services peuvent s'appuyer sur leurs propres donnees techniques ou cookies conformement a leurs politiques respectives.",
                "Nous vous recommandons de consulter les politiques de ces fournisseurs si vous souhaitez plus de details sur leurs usages et options de controle.",
              ],
            },
            {
              heading: '4. Liens externes',
              paragraphs: [
                "Le site peut renvoyer vers des pages officielles ou externes. Une fois que vous quittez notre plateforme, ces sites appliquent leurs propres conditions et leur propre politique de confidentialite.",
              ],
            },
            {
              heading: '5. Questions de confidentialite',
              paragraphs: [
                "Si vous avez une question sur la facon dont vos informations sont traitees ou si vous souhaitez signaler un point sensible, vous pouvez nous contacter via la page dediee.",
              ],
            },
            {
              heading: '6. Mises a jour',
              paragraphs: [
                "Cette page peut etre adaptee si les services utilises evoluent ou si une precision supplementaire devient necessaire. La date de mise a jour sera alors modifiee en haut de page.",
              ],
            },
          ],
          sidebarTitle: 'Ce qui compte pour vous',
          sidebarItems: [
            'Nous ne vendons pas vos donnees personnelles.',
            "Un message envoye via le contact sert uniquement a la reponse ou au suivi.",
            'Les services externes appliquent leurs propres politiques une fois hors du site.',
          ],
          noteTitle: 'Point important',
          noteText:
            "Si vous suivez un lien vers une page officielle, pensez a lire egalement sa propre politique de confidentialite car son fonctionnement peut differer du notre.",
        }
      : {
          badge: 'سياسة الخصوصية',
          title: 'كيف نتعامل مع الخصوصية والبيانات الأساسية',
          subtitle:
            'هذه الصفحة تشرح بشكل مبسط ما يمكن أن نجمعه تقنيا، وكيف نستعمله لتحسين التجربة، ومتى تصبح خدمات خارجية طرفا في المعالجة.',
          lastUpdated: 'آخر تحديث: 29 مارس 2026',
          sections: [
            {
              heading: '1. البيانات التي قد نجمعها',
              paragraphs: [
                'قد يجمع الموقع بيانات تقنية محدودة مثل نوع المتصفح، نوع الجهاز، الصفحات التي تمت زيارتها، أو مؤشرات عامة تساعد على متابعة الأداء الجيد للمنصة.',
                'إذا تواصلت معنا بشكل مباشر، فقد نستعمل المعلومات التي تقدمها مثل البريد الإلكتروني من أجل الرد على طلبك فقط.',
              ],
            },
            {
              heading: '2. الكوكيز والأدوات التقنية',
              paragraphs: [
                'قد يستعمل الموقع أو بعض الخدمات المرتبطة به ملفات تعريف ارتباط أو وسائل مشابهة لتحسين التصفح، وحفظ بعض التفضيلات، وقياس الاستعمال بشكل عام.',
              ],
            },
            {
              heading: '3. التحليلات والقياس والإعلانات',
              paragraphs: [
                'إذا تم تفعيل أدوات التحليلات أو الإعلانات، فقد تعتمد هذه الخدمات على بيانات تقنية أو ملفات تعريف خاصة بها وفق سياساتها هي.',
                'ننصح بمراجعة سياسات هذه الخدمات إذا أردت معرفة تفاصيل أكثر حول كيفية القياس أو التخصيص أو التحكم.',
              ],
            },
            {
              heading: '4. الروابط الخارجية',
              paragraphs: [
                'قد يحيلك الموقع إلى صفحات رسمية أو خارجية. بمجرد مغادرة منصتنا، تصبح تلك المواقع خاضعة لشروطها وسياسة الخصوصية الخاصة بها.',
              ],
            },
            {
              heading: '5. أسئلة الخصوصية',
              paragraphs: [
                'إذا كان لديك سؤال حول طريقة استعمال معلوماتك أو رغبت في الإبلاغ عن نقطة حساسة، يمكنك التواصل معنا عبر الصفحة المخصصة لذلك.',
              ],
            },
            {
              heading: '6. التحديثات',
              paragraphs: [
                'يمكن تحديث هذه الصفحة إذا تغيرت الخدمات المستعملة أو ظهرت حاجة إلى توضيح إضافي. عندها سيتم تعديل تاريخ آخر تحديث في أعلى الصفحة.',
              ],
            },
          ],
          sidebarTitle: 'ما الذي يهمك هنا؟',
          sidebarItems: [
            'لا نبيع بياناتك الشخصية.',
            'الرسالة التي ترسلها عبر الاتصال تستعمل فقط للرد أو المتابعة.',
            'الخدمات الخارجية تطبق سياساتها الخاصة بعد مغادرة الموقع.',
          ],
          noteTitle: 'تنبيه مهم',
          noteText:
            'إذا انتقلت إلى صفحة رسمية عبر رابط في موقعنا، خذ وقتك لقراءة شروط وخصوصية تلك الجهة لأن طريقة معالجتها قد تختلف عنا.',
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
            <span className="mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-blue-50">
              {t.lastUpdated}
            </span>
          </div>

          <div className="grid gap-8 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-6">
              {t.sections.map((section) => (
                <section
                  key={section.heading}
                  className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6"
                >
                  <h2 className="text-xl font-black text-slate-900 md:text-2xl">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4 text-sm leading-8 text-slate-600 md:text-base">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900">
                  {t.sidebarTitle}
                </h2>
                <ul className="mt-5 space-y-3 text-sm leading-8 text-slate-600">
                  {t.sidebarItems.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 text-blue-600">&bull;</span>
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
