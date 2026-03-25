import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default async function Contact(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as 'ar' | 'fr';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t = {
    ar: {
      title: 'اتصل بنا',
      subtitle: 'لديك استفسار أو اقتراح؟ نحن هنا للاستماع إليك.',
      sections: [
        { heading: 'البريد الإلكتروني', text: 'contact@jobmarocpro.ma' },
        { heading: 'الدعم الفني', text: 'متاح على مدار الساعة عبر البريد الإلكتروني.' }
      ],
      formTitle: 'راسلنا مباشرة',
      formLabels: {
        name: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        message: 'رسالتكم',
        button: 'إرسال الرسالة'
      }
    },
    fr: {
      title: 'Contactez-nous',
      subtitle: 'Une question ou une suggestion ? Nous sommes là pour vous écouter.',
      sections: [
        { heading: 'E-mail', text: 'contact@jobmarocpro.ma' },
        { heading: 'Support technique', text: 'Disponible 24h/24 via e-mail.' }
      ],
      formTitle: 'Contactez-nous directement',
      formLabels: {
        name: 'Nom complet',
        email: 'E-mail',
        message: 'Votre message',
        button: 'Envoyer le message'
      }
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
          
          <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-6">{t.formTitle}</h2>
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.formLabels.name}</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.formLabels.email}</label>
                  <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.formLabels.message}</label>
                  <textarea rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none"></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-colors shadow-lg shadow-blue-200">
                  {t.formLabels.button}
                </button>
              </form>
            </div>
            
            <div className="space-y-8">
              {t.sections.map((section, i) => (
                <div key={i} className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="text-sm font-black text-blue-800 uppercase tracking-widest mb-2">{section.heading}</h3>
                  <p className="text-xl font-bold text-slate-900">{section.text}</p>
                </div>
              ))}
              
              <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest mb-2">
                  {lang === 'ar' ? 'ملاحظة' : 'Note'}
                </h3>
                <p className="text-slate-700 font-bold">
                  {lang === 'ar' ? 'نحن نسعى للرد على جميع الاستفسارات في أقرب وقت ممكن.' : 'Nous nous efforçons de répondre à toutes les demandes le plus rapidement possible.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
