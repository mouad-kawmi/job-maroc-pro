import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getSiteSettings } from '@/lib/content';

export default async function Contact(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as 'ar' | 'fr';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const settings = await getSiteSettings();

  const t = {
    ar: {
      title: 'اتصل بنا',
      subtitle: settings.contactSubtitleAr,
      sections: [
        { heading: 'البريد الإلكتروني', text: settings.contactEmail },
        { heading: 'الدعم الفني', text: settings.contactSupportAr },
      ],
      formTitle: 'راسلنا مباشرة',
      formLabels: {
        name: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        message: 'رسالتكم',
        button: 'إرسال الرسالة',
      },
      note: settings.contactNoteAr,
    },
    fr: {
      title: 'Contactez-nous',
      subtitle: settings.contactSubtitleFr,
      sections: [
        { heading: 'E-mail', text: settings.contactEmail },
        { heading: 'Support technique', text: settings.contactSupportFr },
      ],
      formTitle: 'Contactez-nous directement',
      formLabels: {
        name: 'Nom complet',
        email: 'E-mail',
        message: 'Votre message',
        button: 'Envoyer le message',
      },
      note: settings.contactNoteFr,
    },
  }[lang];

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir={dir}>
      <Navbar lang={lang} />

      <main className="container mx-auto max-w-4xl flex-grow px-4 py-12">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] p-8 text-center text-white md:p-12">
            <h1 className="mb-4 text-3xl font-black md:text-4xl">{t.title}</h1>
            <p className="mx-auto max-w-2xl text-lg font-medium text-blue-100">
              {t.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 p-8 md:grid-cols-2 md:p-12">
            <div>
              <h2 className="mb-6 text-2xl font-black text-slate-900">
                {t.formTitle}
              </h2>
              <form className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    {t.formLabels.name}
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    {t.formLabels.email}
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    {t.formLabels.message}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 py-4 font-black text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700"
                >
                  {t.formLabels.button}
                </button>
              </form>
            </div>

            <div className="space-y-8">
              {t.sections.map((section, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6"
                >
                  <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-blue-800">
                    {section.heading}
                  </h3>
                  <p className="text-xl font-bold text-slate-900">{section.text}</p>
                </div>
              ))}

              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6">
                <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-amber-800">
                  {lang === 'ar' ? 'ملاحظة' : 'Note'}
                </h3>
                <p className="font-bold text-slate-700">{t.note}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
