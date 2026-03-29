import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { siteConfig } from '@/lib/site-config';

type EditorialPolicyPageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

function getLang(searchParams: { [key: string]: string | undefined }) {
  return searchParams.lang === 'fr' ? 'fr' : 'ar';
}

export async function generateMetadata(
  props: EditorialPolicyPageProps,
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);

  return {
    title:
      lang === 'fr'
        ? `Politique editoriale | ${siteConfig.name}`
        : `السياسة التحريرية | ${siteConfig.name}`,
    description:
      lang === 'fr'
        ? "Voir comment le site selectionne, verifie et presente les offres, guides et resumes."
        : 'معرفة كيف يختار الموقع العروض ويتحقق منها ويقدم الملخصات والأدلة بشكل واضح.',
    alternates: {
      canonical: '/editorial-policy',
      languages: {
        ar: '/editorial-policy',
        fr: '/editorial-policy?lang=fr',
        'x-default': '/editorial-policy',
      },
    },
  };
}

export default async function EditorialPolicyPage(
  props: EditorialPolicyPageProps,
) {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t =
    lang === 'fr'
      ? {
          badge: 'Politique editoriale',
          title: 'Comment nous selectionnons, verifions et presentons le contenu',
          subtitle:
            "Cette page explique d'ou viennent les offres, comment elles sont verifiees et de quelle maniere les resumes et guides sont rediges afin de garder une ligne claire et transparente.",
          lastUpdated: 'Derniere mise a jour : 29 mars 2026',
          sections: [
            {
              heading: "1. D'ou viennent les offres",
              paragraphs: [
                "Nous nous appuyons sur des sources publiees par des organismes officiels, reconnus ou par des plateformes d'emploi identifiees, puis nous reorganisons l'acces a ces informations d'une facon plus lisible pour l'utilisateur.",
              ],
            },
            {
              heading: '2. Comment la verification est faite',
              paragraphs: [
                "Nous revoyons le titre de l'offre, l'organisme annonceur, le lien d'origine et certaines conditions ou dates limites lorsqu'elles sont disponibles. Malgre cela, la verification finale depuis la source officielle reste toujours indispensable.",
              ],
            },
            {
              heading: '3. Comment nous redigeons les resumes et articles',
              paragraphs: [
                "Les resumes et guides sont rediges dans une langue plus accessible afin d'aider a comprendre rapidement l'essentiel. Nous cherchons a distinguer clairement le contenu de la source originale et l'explication ajoutee par notre equipe.",
              ],
            },
            {
              heading: '4. Mises a jour et corrections',
              paragraphs: [
                "Si un lien change, si une erreur apparait ou si une information inexacte nous est signalee, nous essayons de mettre la page a jour ou de la corriger des que possible apres verification.",
              ],
            },
            {
              heading: '5. Independance et transparence',
              paragraphs: [
                "Le site ne pretend pas representer les organismes annonceurs et ne cherche pas a se substituer a eux. Notre role editorial est de faciliter la comprehension, pas de remplacer la source originale.",
              ],
            },
          ],
          sidebarTitle: 'Nos reperes editoriaux',
          sidebarItems: [
            'Davantage de clarte pour l utilisateur avant la candidature.',
            "Une reference constante a la source d'origine.",
            'Une ouverture aux corrections et retours utiles.',
          ],
          noteTitle: 'Note editoriale',
          noteText:
            "Si vous estimez qu'un resume manque de clarte ou qu'une offre merite une mise a jour, vous pouvez nous ecrire et nous reverrons le point apres verification de la source.",
        }
      : {
          badge: 'السياسة التحريرية',
          title: 'كيف نختار المحتوى ونراجعه ونقدمه',
          subtitle:
            'هذه الصفحة توضح مصادر العروض، ومنهجية التحقق، وطريقة كتابة الملخصات والأدلة حتى يكون دور الموقع واضحا وشفافا للمستخدم.',
          lastUpdated: 'آخر تحديث: 29 مارس 2026',
          sections: [
            {
              heading: '1. من أين تأتي العروض',
              paragraphs: [
                'نعتمد على مصادر منشورة من جهات رسمية أو معروفة أو منصات توظيف محددة، ثم نعيد تنظيم الوصول إليها داخل الموقع بطريقة أوضح للمستخدم.',
              ],
            },
            {
              heading: '2. كيف يتم التحقق',
              paragraphs: [
                'نراجع عنوان العرض، والجهة المعلنة، والرابط الأصلي، وبعض الشروط الأساسية أو الآجال عندما تكون متاحة. ومع ذلك، تبقى المراجعة النهائية من المصدر الرسمي ضرورية دائما.',
              ],
            },
            {
              heading: '3. كيف نكتب الملخصات والمقالات',
              paragraphs: [
                'نكتب الملخصات والأدلة بلغة مبسطة تساعد على الفهم السريع، ونحاول الفصل بين النص الأصلي المنشور وبين الشرح أو النصيحة المضافة من طرفنا.',
              ],
            },
            {
              heading: '4. التحديثات والتصحيحات',
              paragraphs: [
                'إذا تغير رابط أو ظهر خطأ أو تم الإبلاغ عن معلومة غير دقيقة، نحاول تحديث الصفحة أو تعديلها في أقرب وقت ممكن بعد المراجعة.',
              ],
            },
            {
              heading: '5. الاستقلالية والشفافية',
              paragraphs: [
                'الموقع لا يدعي تمثيل الجهات المعلنة، ولا يقدم نفسه كبديل عنها. دورنا التحريري هو تسهيل الفهم، لا استبدال المصدر الأصلي.',
              ],
            },
          ],
          sidebarTitle: 'معاييرنا التحريرية',
          sidebarItems: [
            'وضوح أكبر للمستخدم قبل الترشح.',
            'الإشارة الدائمة إلى المصدر الأصلي.',
            'قبول التصحيحات والملاحظات المنطقية.',
          ],
          noteTitle: 'ملاحظة تحريرية',
          noteText:
            'إذا لاحظت أن ملخصا يحتاج توضيحا أو أن عرضا يستحق تحديثا، يمكن مراسلتنا وسنراجع ذلك عند التحقق من المصدر.',
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
