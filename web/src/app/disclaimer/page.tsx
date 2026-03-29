import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { siteConfig } from '@/lib/site-config';

type DisclaimerPageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

function getLang(searchParams: { [key: string]: string | undefined }) {
  return searchParams.lang === 'fr' ? 'fr' : 'ar';
}

export async function generateMetadata(
  props: DisclaimerPageProps,
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);

  return {
    title:
      lang === 'fr'
        ? `Avertissement | ${siteConfig.name}`
        : `إخلاء المسؤولية | ${siteConfig.name}`,
    description:
      lang === 'fr'
        ? "Comprendre les limites de responsabilite du site, le role des sources officielles et les precautions a prendre."
        : 'فهم حدود مسؤولية الموقع ودور المصادر الرسمية والاحتياطات التي ينبغي اتخاذها قبل أي ترشح.',
    alternates: {
      canonical: '/disclaimer',
      languages: {
        ar: '/disclaimer',
        fr: '/disclaimer?lang=fr',
        'x-default': '/disclaimer',
      },
    },
  };
}

export default async function DisclaimerPage(props: DisclaimerPageProps) {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t =
    lang === 'fr'
      ? {
          badge: 'Avertissement',
          title: "Ce qu'il faut savoir avant de se baser sur une offre",
          subtitle:
            "Cette page precise clairement ce que le site apporte, ce qu'il n'apporte pas et les limites de responsabilite liees aux contenus, aux liens et aux informations publiees.",
          lastUpdated: 'Derniere mise a jour : 29 mars 2026',
          sections: [
            {
              heading: "1. Le site n'est pas un recruteur",
              paragraphs: [
                "JOB MAROC PRO ne recrute pas directement et ne represente pas les organismes ou entreprises dont les offres sont relayees a travers les sources suivies par le site.",
              ],
            },
            {
              heading: '2. La source officielle reste la reference finale',
              paragraphs: [
                "Meme lorsqu'un resume, une reformulation ou une explication supplementaire est proposee, le texte officiel reste la reference finale pour les conditions, les pieces demandees, les delais et le mode de candidature.",
              ],
            },
            {
              heading: '3. Les annonces peuvent evoluer',
              paragraphs: [
                "Une date limite, un lien, un nombre de postes ou une condition peut etre modifie du cote de l'annonceur sans notification prealable sur notre site.",
              ],
            },
            {
              heading: '4. Vigilance face aux fraudes',
              paragraphs: [
                "Le site ne demande jamais de frais, de virement ou d'informations bancaires pour postuler. Toute demande de ce type doit etre consideree comme un signal d'alerte.",
              ],
            },
            {
              heading: '5. Liens et services externes',
              paragraphs: [
                "Nous ne sommes pas responsables du contenu, de la disponibilite ni des politiques des sites externes accessibles depuis notre plateforme.",
              ],
            },
          ],
          sidebarTitle: 'Points cles',
          sidebarItems: [
            "Nous n'orientons pas les utilisateurs vers un recruteur contre commission.",
            'Nous ne promettons aucune issue ou selection.',
            'Au moindre doute, il faut verifier a nouveau depuis la source officielle.',
          ],
          noteTitle: 'Avant toute action',
          noteText:
            "Si une offre vous interesse vraiment, ouvrez le lien d'origine, relisez l'annonce complete puis preparez votre dossier a partir des exigences publiees sur cette source.",
        }
      : {
          badge: 'إخلاء المسؤولية',
          title: 'ما يجب معرفته قبل الاعتماد على أي عرض',
          subtitle:
            'هذه الصفحة تشرح بوضوح ما يقدمه الموقع، وما لا يقدمه، وحدود المسؤولية المرتبطة بالمحتوى والروابط والمعلومات المنشورة.',
          lastUpdated: 'آخر تحديث: 29 مارس 2026',
          sections: [
            {
              heading: '1. الموقع ليس جهة تشغيل',
              paragraphs: [
                'JOB MAROC PRO لا يشغل بشكل مباشر ولا يمثل المؤسسات أو الشركات التي تنشر عروضها عبر الروابط أو المصادر التي نتابعها.',
              ],
            },
            {
              heading: '2. المرجع النهائي هو المصدر الرسمي',
              paragraphs: [
                'حتى عندما نقدم ملخصا أو تبسيطا أو شرحا إضافيا، يبقى النص الرسمي هو المرجع النهائي بخصوص الشروط والوثائق والآجال وطريقة الترشح.',
              ],
            },
            {
              heading: '3. التغييرات المحتملة في الإعلانات',
              paragraphs: [
                'قد يتم تعديل الروابط أو المواعيد أو الشروط أو عدد المناصب من طرف الجهة المعلنة بدون إشعار سابق على موقعنا.',
              ],
            },
            {
              heading: '4. الحذر من الاحتيال',
              paragraphs: [
                'الموقع لا يطلب منك أي رسوم أو حوالات أو معلومات بنكية من أجل الترشح. أي طلب من هذا النوع يجب التعامل معه كإشارة خطر.',
              ],
            },
            {
              heading: '5. الروابط والخدمات الخارجية',
              paragraphs: [
                'لسنا مسؤولين عن محتوى أو توفر أو سياسات المواقع الخارجية التي قد تصل إليها عبر روابط موجودة على منصتنا.',
              ],
            },
          ],
          sidebarTitle: 'نقط أساسية',
          sidebarItems: [
            'لا ندفع المستخدم إلى جهة معينة مقابل عمولة.',
            'لا نعد بأي نتيجة أو قبول.',
            'أي شك يجب أن يعاد التحقق منه من المصدر الرسمي.',
          ],
          noteTitle: 'قبل أي خطوة',
          noteText:
            'إذا وجدت عرضا مهما بالنسبة لك، افتح الرابط الأصلي، اقرأ الإعلان كاملا، ثم جهز ملفك بناء على ما هو منشور هناك.',
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
