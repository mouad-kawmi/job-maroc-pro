import type { JobSector } from '@/lib/job-categories';

export type JobGuideSlug = 'public-sector' | 'private-sector';

export type JobGuide = {
  slug: JobGuideSlug;
  sector: Exclude<JobSector, 'all'>;
  titles: { ar: string; fr: string };
  overviews: { ar: string; fr: string };
  keyPoints: { ar: string[]; fr: string[] };
  faqs: {
    ar: Array<{ question: string; answer: string }>;
    fr: Array<{ question: string; answer: string }>;
  };
};

export const JOB_GUIDES: Record<JobGuideSlug, JobGuide> = {
  'public-sector': {
    slug: 'public-sector',
    sector: 'public',
    titles: {
      ar: 'دليل مباريات القطاع العام في المغرب',
      fr: 'Guide des concours du secteur public au Maroc',
    },
    overviews: {
      ar: 'هذه الصفحة تجمع فرص القطاع العام مع توضيحات عملية حول طريقة التقديم، ما يجب الانتباه له داخل الإعلان الرسمي، وكيفية تنظيم ملف الترشيح بشكل أفضل.',
      fr: "Cette page rassemble les opportunites du secteur public avec des explications pratiques sur la candidature, les points a verifier dans l'annonce officielle et la meilleure facon d'organiser son dossier.",
    },
    keyPoints: {
      ar: [
        'اقرأ الإعلان الرسمي كاملا لأن شروط السن أو الدبلوم أو التخصص قد تكون حاسمة.',
        'راجع عدد المناصب والآجال والوثائق المطلوبة قبل البدء في تجهيز الملف.',
        'احرص على مطابقة المعلومات بين الاستمارة والسيرة الذاتية والوثائق المرفقة.',
      ],
      fr: [
        "Lisez toujours l'annonce officielle en entier car les conditions d'age, de diplome ou de specialite peuvent etre decisives.",
        'Verifiez le nombre de postes, la date limite et les documents demandes avant de preparer votre dossier.',
        'Gardez des informations coherentes entre votre formulaire, votre CV et les pieces jointes.',
      ],
    },
    faqs: {
      ar: [
        {
          question: 'ما أول شيء يجب مراجعته في مباريات القطاع العام؟',
          answer: 'أهم نقطة هي الشروط الرسمية: السن، الشهادة، التخصص، طريقة التقديم، وآخر أجل. أي خطأ في هذه النقاط قد يؤدي إلى رفض الملف.',
        },
        {
          question: 'هل يمكن الاعتماد فقط على ملخص الموقع؟',
          answer: 'لا. الملخص يساعدك على الفهم السريع، لكن المرجع النهائي دائما هو الإعلان أو الرابط الرسمي الصادر عن الجهة المنظمة.',
        },
      ],
      fr: [
        {
          question: 'Quel est le premier point a verifier pour un concours public ?',
          answer: "Commencez par les conditions officielles: age, diplome, specialite, mode de candidature et date limite. Une erreur sur l'un de ces points peut invalider le dossier.",
        },
        {
          question: 'Le resume du site suffit-il pour postuler ?',
          answer: "Non. Le resume aide a comprendre l'offre rapidement, mais la reference finale reste toujours l'annonce officielle de l'organisme recruteur.",
        },
      ],
    },
  },
  'private-sector': {
    slug: 'private-sector',
    sector: 'private',
    titles: {
      ar: 'دليل فرص القطاع الخاص في المغرب',
      fr: "Guide des offres d'emploi du secteur prive au Maroc",
    },
    overviews: {
      ar: 'هذه الصفحة تساعدك على تتبع فرص القطاع الخاص مع نصائح عملية لتقييم العرض، تخصيص السيرة الذاتية، والاستعداد للتقديم بشكل احترافي وسريع.',
      fr: "Cette page vous aide a suivre les offres du secteur prive avec des conseils concrets pour evaluer l'annonce, adapter votre CV et postuler de facon professionnelle et rapide.",
    },
    keyPoints: {
      ar: [
        'خصص السيرة الذاتية حسب المنصب بدل إرسال نفس الملف لجميع العروض.',
        'تحقق من طبيعة الشركة والرابط الرسمي قبل مشاركة أي معلومات حساسة.',
        'ركز على المهارات والخبرة المطلوبة داخل الإعلان وابرزها بوضوح داخل ملفك.',
      ],
      fr: [
        'Adaptez votre CV au poste vise au lieu de reutiliser le meme document pour toutes les offres.',
        "Verifiez l'entreprise et le lien officiel avant de partager des informations sensibles.",
        "Reperez les competences et experiences demandees dans l'annonce puis mettez-les clairement en avant dans votre dossier.",
      ],
    },
    faqs: {
      ar: [
        {
          question: 'كيف أعرف أن عرض القطاع الخاص جدي؟',
          answer: 'تحقق من اسم الشركة والرابط الرسمي وطريقة التواصل، وتجنب أي عرض يطلب أداء مبلغ مالي أو معلومات غير مهنية في بداية العملية.',
        },
        {
          question: 'هل يكفي إرسال السيرة الذاتية فقط؟',
          answer: 'ليس دائما. بعض العروض تحتاج أيضا رسالة تحفيزية أو معلومات إضافية، لذلك اقرأ الإعلان الرسمي بعناية قبل الإرسال.',
        },
      ],
      fr: [
        {
          question: 'Comment savoir si une offre du secteur prive est serieuse ?',
          answer: "Verifiez le nom de l'entreprise, le lien officiel et le mode de contact. Evitez toute annonce qui demande un paiement ou des informations non professionnelles des le debut.",
        },
        {
          question: 'Le CV seul est-il suffisant ?',
          answer: "Pas toujours. Certaines offres exigent aussi une lettre de motivation ou des informations complementaires. Lisez donc l'annonce complete avant l'envoi.",
        },
      ],
    },
  },
};

export function getJobGuide(slug: string): JobGuide | null {
  if (slug === 'public-sector' || slug === 'private-sector') {
    return JOB_GUIDES[slug];
  }

  return null;
}

export function listJobGuides(): JobGuide[] {
  return Object.values(JOB_GUIDES);
}
