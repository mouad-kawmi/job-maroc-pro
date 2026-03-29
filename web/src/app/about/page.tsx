import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { siteConfig } from '@/lib/site-config';

type AboutPageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

function getLang(searchParams: { [key: string]: string | undefined }) {
  return searchParams.lang === 'fr' ? 'fr' : 'ar';
}

export async function generateMetadata(
  props: AboutPageProps,
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);

  return {
    title:
      lang === 'fr'
        ? `A propos | ${siteConfig.name}`
        : `عن الموقع | ${siteConfig.name}`,
    description:
      lang === 'fr'
        ? "Comprendre le role de JOB MAROC PRO, ce que le site publie et comment il accompagne les candidats sans remplacer la source officielle."
        : 'فهم دور JOB MAROC PRO وما الذي ينشره وكيف يساعد المستخدم دون أن يعوض المصدر الرسمي.',
    alternates: {
      canonical: '/about',
      languages: {
        ar: '/about',
        fr: '/about?lang=fr',
        'x-default': '/about',
      },
    },
  };
}

export default async function AboutPage(props: AboutPageProps) {
  const searchParams = await props.searchParams;
  const lang = getLang(searchParams);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t =
    lang === 'fr'
      ? {
          badge: 'A propos du site',
          title: 'Comment JOB MAROC PRO aide les candidats au Maroc',
          subtitle:
            "Le site suit les offres d'emploi, concours et contenus utiles autour de la candidature, tout en rappelant que la source officielle reste toujours la reference finale.",
          sections: [
            {
              heading: '1. Le role du site',
              paragraphs: [
                "JOB MAROC PRO n'est pas un recruteur et ne represente pas les organismes qui publient les offres. Le site sert avant tout a regrouper des opportunites et a les presenter d'une facon plus simple a lire.",
                "Notre objectif est de faire gagner du temps a l'utilisateur, de mieux structurer l'information et d'aider a comprendre rapidement ce qu'il faut verifier avant de postuler.",
              ],
            },
            {
              heading: '2. Ce que nous publions',
              paragraphs: [
                "Nous suivons des opportunites dans le secteur public, le secteur prive, les concours, les stages et d'autres contenus lies a la recherche d'emploi au Maroc.",
                "En plus des annonces, nous ajoutons aussi des guides, FAQ et articles originaux pour aider l'utilisateur a avancer avec plus de clarte.",
              ],
            },
            {
              heading: '3. La valeur ajoutee du site',
              paragraphs: [
                "Nous essayons d'ajouter des resumes utiles, des conseils de candidature, des pages guides et une navigation plus claire pour rendre le contenu plus exploitable.",
                "Cette valeur ajoutee ne remplace pas le texte d'origine. Elle sert surtout a mieux comprendre une opportunite avant de consulter sa source officielle.",
              ],
            },
            {
              heading: '4. Les limites de notre role',
              paragraphs: [
                "Un organisme peut modifier ses conditions, ses dates limites ou ses liens a tout moment. C'est pour cela que nous recommandons toujours de relire l'annonce officielle avant toute action finale.",
                "Le site ne garantit ni la selection, ni la convocation, ni le recrutement, et ne demande jamais de paiement au nom d'une candidature.",
              ],
            },
          ],
          sidebarTitle: 'Ce que vous pouvez attendre de nous',
          sidebarItems: [
            'Des pages plus claires pour comprendre rapidement une offre.',
            'Des liens et reperes utiles quand ils sont disponibles.',
            'Un rappel constant que la source officielle reste le dernier mot.',
          ],
          noteTitle: 'Correction ou remarque',
          noteText:
            "Si vous voyez une erreur, un lien qui ne marche plus ou une information a clarifier, vous pouvez nous ecrire via la page Contact afin que nous reverifiions le point signale.",
        }
      : {
          badge: 'عن الموقع',
          title: 'كيف يساعد JOB MAROC PRO الباحثين عن العمل في المغرب',
          subtitle:
            'الموقع يتابع عروض العمل والمباريات والمحتوى المفيد حول الترشح، مع التذكير دائما بأن المصدر الرسمي يبقى هو المرجع النهائي.',
          sections: [
            {
              heading: '1. دور الموقع',
              paragraphs: [
                'JOB MAROC PRO ليس جهة تشغيل ولا يمثل المؤسسات التي تنشر العروض. دوره الأساسي هو تجميع الفرص وتقديمها بطريقة أوضح وأسهل في القراءة.',
                'الهدف هو ربح الوقت للمستخدم، وتنظيم المعلومات، والمساعدة على فهم ما يجب التحقق منه قبل إرسال أي ترشح.',
              ],
            },
            {
              heading: '2. ما الذي ننشره',
              paragraphs: [
                'نتابع فرصا من القطاع العام والقطاع الخاص، والمباريات، والتداريب، ومحتوى يساعد على البحث عن العمل في المغرب.',
                'إلى جانب الإعلانات، نضيف أيضا أدلة وFAQ ومقالات أصلية تساعد المستخدم على التقدم بوضوح أكبر.',
              ],
            },
            {
              heading: '3. القيمة المضافة للموقع',
              paragraphs: [
                'نحاول إضافة ملخصات مفيدة، ونصائح للتقديم، وصفحات إرشادية، وتنظيم أوضح للمحتوى حتى يصبح أكثر فائدة للمستخدم.',
                'هذه القيمة المضافة لا تعوض النص الأصلي المنشور، بل تساعد فقط على فهم العرض بسرعة أكبر قبل الرجوع إلى المصدر الرسمي.',
              ],
            },
            {
              heading: '4. حدود دورنا',
              paragraphs: [
                'قد تقوم الجهة المعلنة بتغيير الشروط أو الآجال أو الروابط في أي وقت. لهذا السبب ننصح دائما بقراءة الإعلان الرسمي قبل أي خطوة نهائية.',
                'الموقع لا يضمن القبول أو الاستدعاء أو التوظيف، ولا يطلب أي أداء مالي باسم الترشح.',
              ],
            },
          ],
          sidebarTitle: 'ماذا يمكن أن تتوقع منا؟',
          sidebarItems: [
            'صفحات أوضح تساعدك على فهم العرض بسرعة.',
            'روابط ومؤشرات مفيدة عندما تكون متاحة.',
            'تذكير دائم بأن المصدر الرسمي هو الكلمة الأخيرة.',
          ],
          noteTitle: 'تصحيح أو ملاحظة',
          noteText:
            'إذا لاحظت خطأ أو رابطا لا يعمل أو معلومة تحتاج توضيحا، يمكنك مراسلتنا عبر صفحة الاتصال حتى نقوم بالمراجعة.',
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
