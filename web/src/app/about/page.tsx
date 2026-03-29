import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getSiteSettings } from '@/lib/content';

export default async function About(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as 'ar' | 'fr';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const settings = await getSiteSettings();

  const t = {
    ar: {
      title: 'من نحن',
      subtitle: settings.aboutSubtitleAr,
      content: [
        {
          heading: 'مهمتنا',
          text: settings.aboutMissionAr,
        },
        {
          heading: 'ماذا نقدم؟',
          text: settings.aboutOfferAr,
        },
        {
          heading: 'التزامنا المستمر',
          text: settings.aboutCommitmentAr,
        },
      ],
    },
    fr: {
      title: 'A Propos de Nous',
      subtitle: settings.aboutSubtitleFr,
      content: [
        {
          heading: 'Notre Mission',
          text: settings.aboutMissionFr,
        },
        {
          heading: 'Ce que nous offrons',
          text: settings.aboutOfferFr,
        },
        {
          heading: 'Notre Engagement',
          text: settings.aboutCommitmentFr,
        },
      ],
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

          <div className="space-y-10 p-8 md:p-12">
            {t.content.map((section, index) => (
              <section key={index} className="relative">
                <div
                  className={`absolute top-0 h-full w-1 rounded-full bg-green-500 ${
                    dir === 'rtl' ? 'right-0' : 'left-0'
                  }`}
                />
                <div className={dir === 'rtl' ? 'pr-6' : 'pl-6'}>
                  <h2 className="mb-4 text-xl font-black text-slate-900 md:text-2xl">
                    {section.heading}
                  </h2>
                  <p className="text-lg font-medium leading-relaxed text-slate-600">
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
