import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { siteConfig } from '@/lib/site-config';

type TermsPageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

function getLang(searchParams: { [key: string]: string | undefined }) {
  return searchParams.lang === 'fr' ? 'fr' : 'ar';
}

export async function generateMetadata(
  props: TermsPageProps,
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);

  return {
    title:
      lang === 'fr'
        ? `Conditions d'utilisation | ${siteConfig.name}`
        : `شروط الاستخدام | ${siteConfig.name}`,
    description:
      lang === 'fr'
        ? "Consulter les conditions d'utilisation du site, ses limites et les regles de bon usage."
        : 'الاطلاع على شروط الاستخدام الأساسية وحدود الموقع وقواعد الاستعمال المسؤول.',
    alternates: {
      canonical: '/terms',
      languages: {
        ar: '/terms',
        fr: '/terms?lang=fr',
        'x-default': '/terms',
      },
    },
  };
}

export default async function TermsPage(props: TermsPageProps) {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t =
    lang === 'fr'
      ? {
          badge: "Conditions d'utilisation",
          title: "Les regles essentielles d'utilisation du site",
          subtitle:
            "En utilisant le site, vous acceptez de l'utiliser de maniere responsable et de vous referer a la source officielle avant toute decision finale liee a une candidature.",
          lastUpdated: 'Derniere mise a jour : 29 mars 2026',
          sections: [
            {
              heading: '1. Objet du site',
              paragraphs: [
                "Le site est concu pour regrouper des offres d'emploi, concours et contenus d'accompagnement. Sa finalite est avant tout informative et pratique.",
              ],
            },
            {
              heading: '2. Usage acceptable',
              paragraphs: [
                "Le service doit etre utilise dans un cadre legal et respectueux, sans tentative d'abus visant le contenu, l'interface ou toute composante technique du site.",
              ],
            },
            {
              heading: '3. Utilisation des informations',
              paragraphs: [
                "Les resumes, conseils et explications proposes par le site servent a mieux comprendre une annonce, mais ils ne remplacent pas l'avis officiel ni les conditions publiees par l'organisme concerne.",
              ],
            },
            {
              heading: '4. Absence de garantie de resultat',
              paragraphs: [
                "L'utilisation du site ne donne aucune garantie de selection, de convocation, d'embauche ou de reponse de la part de l'organisme annonceur.",
              ],
            },
            {
              heading: '5. Services et liens externes',
              paragraphs: [
                "Le site peut orienter vers des plateformes externes ou vers d'autres services techniques. Leur utilisation reste soumise a leurs propres conditions et politiques.",
              ],
            },
            {
              heading: '6. Evolution des conditions',
              paragraphs: [
                "Ces conditions peuvent etre mises a jour si le service evolue ou si une precision supplementaire devient necessaire. La poursuite de l'utilisation du site apres mise a jour vaut acceptation de la nouvelle version.",
              ],
            },
          ],
          sidebarTitle: 'En bref',
          sidebarItems: [
            'Utilisez le site comme un support, pas comme un substitut a la source officielle.',
            "Nous ne procurons pas d'emploi et ne garantissons aucun resultat.",
            'Tout usage abusif du service ou du contenu est interdit.',
          ],
          noteTitle: 'Usage responsable',
          noteText:
            "Avant d'envoyer un dossier ou de partager des informations sensibles, verifiez toujours l'annonce originale et les conditions de l'organisme annonceur.",
        }
      : {
          badge: 'شروط الاستخدام',
          title: 'القواعد الأساسية لاستعمال الموقع',
          subtitle:
            'باستعمالك للموقع، فأنت توافق على استعماله بشكل مسؤول وعلى الرجوع إلى المصادر الرسمية عند اتخاذ قرار نهائي حول أي ترشح.',
          lastUpdated: 'آخر تحديث: 29 مارس 2026',
          sections: [
            {
              heading: '1. الغرض من الموقع',
              paragraphs: [
                'الموقع مخصص لتجميع وتتبع فرص العمل والمباريات والمحتوى المساعد حولها. الغرض منه إخباري وتوجيهي بالأساس.',
              ],
            },
            {
              heading: '2. الاستعمال المقبول',
              paragraphs: [
                'يجب استعمال الموقع بطريقة قانونية ومحترمة، وعدم محاولة إساءة استعمال المحتوى أو الواجهة أو أي جزء تقني من الخدمة.',
              ],
            },
            {
              heading: '3. الاعتماد على المعلومات',
              paragraphs: [
                'المعلومات والملخصات التي نقدمها تساعد على الفهم السريع، لكنها لا تعوض الإعلانات الرسمية أو الشروط الأصلية المنشورة من الجهات المعنية.',
              ],
            },
            {
              heading: '4. عدم ضمان النتيجة',
              paragraphs: [
                'استعمالك للموقع لا يمنح أي ضمان بخصوص القبول أو الاستدعاء أو التوظيف أو الرد من الجهة المعلنة.',
              ],
            },
            {
              heading: '5. الخدمات والروابط الخارجية',
              paragraphs: [
                'قد نحيلك إلى مواقع خارجية أو خدمات تقنية أخرى. استعمالك لتلك المواقع والخدمات يخضع لشروطها وسياساتها الخاصة.',
              ],
            },
            {
              heading: '6. تحديث الشروط',
              paragraphs: [
                'يجوز لنا تحديث هذه الشروط عندما تتطور الخدمة أو تظهر حاجة إلى توضيح إضافي. استمرارك في استعمال الموقع بعد التحديث يعني قبول النسخة الجديدة.',
              ],
            },
          ],
          sidebarTitle: 'باختصار',
          sidebarItems: [
            'استعمل الموقع كمصدر مساعد وليس كبديل للمصدر الرسمي.',
            'لا نحصل لك على وظيفة ولا نضمن النتيجة.',
            'أي إساءة استعمال تقنية أو محتوى غير مسموح بها.',
          ],
          noteTitle: 'استعمال مسؤول',
          noteText:
            'قبل إرسال ملفك أو مشاركة معلومات حساسة، راجع دائما الإعلان الأصلي وشروط الجهة المعلنة.',
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
