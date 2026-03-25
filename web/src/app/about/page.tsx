import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default async function About(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as 'ar' | 'fr';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t = {
    ar: {
      title: 'من نحن',
      subtitle: 'تعرف على JOB MAROC PRO ومهمتنا في تسهيل البحث عن عمل بالمغرب',
      content: [
        {
          heading: 'مهمتنا',
          text: 'JOB MAROC PRO هو محرك بحث وموقع إخباري رائد متخصص في تجميع ونشر آخر مباريات التوظيف في القطاع العام والقطاع الخاص بالمغرب. هدفنا هو جعل البحث عن عمل أسهل وأسرع لجميع المغاربة.'
        },
        {
          heading: 'ماذا نقدم؟',
          text: 'نقوم بتحديث موقعنا يومياً وبشكل تلقائي لنضمن وصولكم لأحدث الإعلانات فور صدورها. نوفر تفاصيل دقيقة حول شروط الترشيح، التواريخ الهامة، وروابط التقديم المباشرة.'
        },
        {
          heading: 'التزامنا المستمر',
          text: 'نلتزم بالشفافية والمصداقية في نقل المعلومات من مصادرها الرسمية، مع الحرص على تجربة مستخدم سلسة واحترافية.'
        }
      ]
    },
    fr: {
      title: 'À Propos de Nous',
      subtitle: 'Découvrez JOB MAROC PRO et notre mission pour faciliter la recherche d\'emploi au Maroc',
      content: [
        {
          heading: 'Notre Mission',
          text: 'JOB MAROC PRO est un moteur de recherche et un site d\'information leader, spécialisé dans la collecte et la publication des derniers concours de recrutement dans les secteurs public et privé au Maroc. Notre objectif est de rendre la recherche d\'emploi plus facile et plus rapide pour tous les Marocains.'
        },
        {
          heading: 'Ce que nous offrons',
          text: 'Nous mettons à jour notre site quotidiennement et automatiquement pour vous garantir l\'accès aux dernières annonces dès leur publication. Nous fournissons des détails précis sur les conditions de candidature, les dates importantes et les liens de postulation directe.'
        },
        {
          heading: 'Notre Engagement',
          text: 'Nous nous engageons à la transparence et à la crédibilité dans la transmission des informations provenant de sources officielles, tout en assurant une expérience utilisateur fluide et professionnelle.'
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
            <p className="text-blue-100 text-lg max-w-2xl mx-auto font-medium">{t.subtitle}</p>
          </div>
          
          <div className="p-8 md:p-12 space-y-10">
            {t.content.map((section, i) => (
              <section key={i} className="relative">
                <div className={`absolute top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} w-1 h-full bg-green-500 rounded-full`}></div>
                <div className={`${dir === 'rtl' ? 'pr-6' : 'pl-6'}`}>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4">{section.heading}</h2>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    {section.text}
                  </p>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
