import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default async function Privacy(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as 'ar' | 'fr';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t = {
    ar: {
      title: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث: 22 مارس 2026',
      subtitle: 'نحن في JOB MAROC PRO نولي أهمية قصوى لخصوصيتكم وحماية بياناتكم الشخصية وفقاً للقوانين المعمول بها.',
      intro: 'توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات التي تقدمونها عند استخدام موقعنا. تصفير استخدامكم للموقع يعني موافقتكم على هذه الشروط.',
      sections: [
        {
          heading: '1. المعلومات التي نجمعها',
          text: 'نقوم بجمع نوعين من المعلومات: معلومات تقنية غير شخصية (مثل عنوان IP، نوع المتصفح، نظام التشغيل) ومعلومات تقدمونها طواعية عبر نماذج الاتصال (الاسم، البريد الإلكتروني).'
        },
        {
          heading: '2. ملفات تعريف الارتباط (Cookies)',
          text: 'نستخدم "الكوكيز" لتحليل حركة المرور وحفظ تفضيلاتكم. يمكن لشركائنا مثل Google AdSense استخدام ملفات تعريف الارتباط لعرض إعلانات بناءً على زياراتكم لموقعنا ومواقع أخرى على الإنترنت.'
        },
        {
          heading: '3. Google AdSense',
          text: 'يستخدم موقعنا Google AdSense لعرض الإعلانات. تستخدم Google ملفات تعريف ارتباط DoubleClick لتمكينها هي وشركائها من عرض الإعلانات لكم بناءً على زيارتكم لهذا الموقع و/أو مواقع أخرى عبر الإنترنت. يمكنكم إلغاء استخدام ملف تعريفي الارتباط DoubleClick للإعلانات القائمة على الاهتمامات بزيارة إعدادات إعلانات Google.'
        },
        {
          heading: '4. الروابط الخارجية',
          text: 'يحتوي موقعنا على روابط لمباريات التوظيف في مواقع رسمية أو تابعة لجهات أخرى. بمجرد النقر على هذه الروابط ومغادرة موقعنا، يرجى العلم أننا لا نملك أي سيطرة على تلك المواقع الأخرى ولا نتحمل مسؤولية حماية خصوصية أي معلومات تقدمونها هناك.'
        },
        {
          heading: '5. إخلاء المسؤولية القانوني',
          text: 'موقع JOB MAROC PRO هو محرك بحث ومجمع للإعلانات فقط. نحن لا نوظف أحداً بشكل مباشر ولا نطلب مبالغ مالية من المترشحين. المرجو الحذر من أي شخص يطلب منكم مبالغ مالية باسم الموقع.'
        },
        {
          heading: '6. التغييرات في سياسة الخصوصية',
          text: 'نحتفظ بالحق في تحديث هذه السياسة في أي وقت. سنقوم بنشر أي تغييرات على هذه الصفحة وإبلاغكم عبر تحديث تاريخ "آخر تحديث" في أعلى الصفحة.'
        }
      ]
    },
    fr: {
      title: 'Politique de Confidentialité',
      lastUpdated: 'Dernière mise à jour : 22 Mars 2026',
      subtitle: 'Chez JOB MAROC PRO, nous accordons une importance primordiale à la protection de votre vie privée et de vos données personnelles.',
      intro: 'Cette politique détaille comment nous collectons, utilisons et protégeons les informations que vous fournissez en utilisant notre site. L\'utilisation du site implique votre acceptation de ces termes.',
      sections: [
        {
          heading: '1. Collecte d\'informations',
          text: 'Nous collectons deux types d\'informations : des données techniques non personnelles (IP, navigateur, système d\'exploitation) et des données fournies volontairement via nos formulaires (Nom, Email).'
        },
        {
          heading: '2. Utilisation des Cookies',
          text: 'Nous utilisons les cookies pour analyser le trafic et sauvegarder vos préférences. Nos partenaires, comme Google AdSense, peuvent également utiliser des cookies pour diffuser des publicités basées sur votre navigation.'
        },
        {
          heading: '3. Google AdSense',
          text: 'Notre site utilise Google AdSense. Google utilise des cookies DoubleClick pour diffuser des annonces pertinentes basées sur votre historique de navigation. Vous pouvez désactiver l\'utilisation du cookie DoubleClick pour la publicité par centres d\'intérêt en consultant les paramètres des annonces Google.'
        },
        {
          heading: '4. Liens Externes',
          text: 'Notre site contient des liens vers des sites officiels de recrutement. Une fois que vous quittez notre site, nous n\'avons aucun contrôle sur ces sites externes et ne sommes pas responsables de la protection de vos données sur ces plateformes.'
        },
        {
          heading: '5. Avertissement Légal',
          text: 'JOB MAROC PRO est un moteur de recherche. Nous ne recrutons pas directement et ne demandons jamais de frais de dossier. Soyez vigilants face aux tentatives de fraude.'
        },
        {
          heading: '6. Modifications',
          text: 'Nous nous réservons le droit de modifier cette politique. Toute mise à jour sera affichée sur cette page avec une date de révision mise à jour.'
        }
      ]
    }
  }[lang];

  return (
    <div className="min-h-screen font-sans flex flex-col bg-slate-50" dir={dir}>
      <Navbar lang={lang} />
      
      <main className="flex-grow container mx-auto px-4 max-w-4xl py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] p-8 md:p-12 text-white text-center">
            <h1 className="text-3xl md:text-4xl font-black mb-4">{t.title}</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto font-medium mb-4">{t.subtitle}</p>
            <span className="inline-block bg-white/10 px-4 py-1 rounded-full text-xs font-bold border border-white/20">
              {t.lastUpdated}
            </span>
          </div>
          
          <div className="p-8 md:p-12">
            <p className="text-slate-600 text-lg leading-relaxed mb-10 text-center font-medium italic">
               "{t.intro}"
            </p>
            
            <div className="space-y-12">
              {t.sections.map((section, i) => (
                <section key={i} className="group">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                    {section.heading}
                  </h2>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium md:pl-4">
                    {section.text}
                  </p>
                </section>
              ))}
            </div>
            
            <div className="mt-16 p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center">
              <p className="text-blue-800 font-bold">
                {lang === 'ar' ? 'إذا كان لديك أي سؤال حول سياسة الخصوصية، يرجى الاتصال بنا عبر صفحة الاتصال.' : 'Si vous avez des questions concernant notre politique de confidentialité, n\'hésitez pas à nous contacter via notre page dédiée.'}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
