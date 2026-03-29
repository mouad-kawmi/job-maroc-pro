export type StaticBlogCard = {
  slug: string;
  date: string;
  tags: string[];
  title: { ar: string; fr: string };
  excerpt: { ar: string; fr: string };
};

export const STATIC_BLOG_CARDS: StaticBlogCard[] = [
  {
    slug: 'job-search-ads',
    date: '2025-03-22',
    tags: ['search', 'tips'],
    title: {
      ar: 'ÙƒÙŠÙ ØªØ¬Ø¯ Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø§Ù„ØªÙˆØ¸ÙŠÙ - JOB MAROC PRO',
      fr: "Comment trouver les annonces d'emploi",
    },
    excerpt: {
      ar: 'Ø¯Ù„ÙŠÙ„ Ø´Ø§Ù…Ù„ Ù„Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø£ÙØ¶Ù„ Ø¹Ø±ÙˆØ¶ Ø§Ù„Ø¹Ù…Ù„ ÙÙŠ Ø§Ù„Ù…ØºØ±Ø¨',
      fr: "Guide complet pour trouver les meilleures offres d'emploi",
    },
  },
  {
    slug: 'cv-writing',
    date: '2025-03-21',
    tags: ['cv', 'tips'],
    title: {
      ar: 'Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ø°Ø§ØªÙŠØ© - CV',
      fr: 'Le Curriculum Vitae',
    },
    excerpt: {
      ar: 'ÙƒÙŠÙ ØªÙƒØªØ¨ Ø³ÙŠØ±Ø© Ø°Ø§ØªÙŠØ© Ø§Ø­ØªØ±Ø§ÙÙŠØ© ØªÙØªØ­ Ø£Ù…Ø§Ù…Ùƒ Ø§Ù„Ø£Ø¨ÙˆØ§Ø¨',
      fr: 'Comment rediger un CV professionnel qui ouvre des portes',
    },
  },
  {
    slug: 'interview-tips',
    date: '2025-03-20',
    tags: ['interview'],
    title: {
      ar: 'Ø§Ù„Ù…Ù‚Ø§Ø¨Ù„Ø© Ø§Ù„Ø´ÙÙ‡ÙŠØ©',
      fr: "L'entretien d'embauche",
    },
    excerpt: {
      ar: 'Ù†ØµØ§Ø¦Ø­ Ø°Ù‡Ø¨ÙŠØ© Ù„Ù„Ù†Ø¬Ø§Ø­ ÙÙŠ Ù…Ù‚Ø§Ø¨Ù„Ø© Ø§Ù„Ø¹Ù…Ù„',
      fr: 'Conseils cles pour reussir votre entretien',
    },
  },
  {
    slug: 'sectors-2025',
    date: '2025-03-19',
    tags: ['search'],
    title: {
      ar: 'Ù‚Ø·Ø§Ø¹Ø§Øª Ø§Ù„ØªØ´ØºÙŠÙ„ 2025',
      fr: "Secteurs de l'emploi 2025",
    },
    excerpt: {
      ar: 'Ø£Ù‡Ù… Ø§Ù„Ù‚Ø·Ø§Ø¹Ø§Øª Ø§Ù„ØªÙŠ ØªÙˆÙØ± ÙØ±Øµ Ø¹Ù…Ù„ ÙÙŠ Ø§Ù„Ù…ØºØ±Ø¨',
      fr: 'Les secteurs qui recrutent le plus au Maroc',
    },
  },
  {
    slug: 'public-concours',
    date: '2025-03-18',
    tags: ['public'],
    title: {
      ar: 'Ù…Ø¨Ø§Ø±Ø§Ø© Ø§Ù„ÙˆØ¸ÙŠÙØ© Ø§Ù„Ø¹Ù…ÙˆÙ…ÙŠØ©',
      fr: 'Concours de la fonction publique',
    },
    excerpt: {
      ar: 'ÙƒÙ„ Ù…Ø§ ØªØ­ØªØ§Ø¬ Ù…Ø¹Ø±ÙØªÙ‡ Ø¹Ù† Ø§Ù„Ù…Ø¨Ø§Ø±ÙŠØ§Øª Ø§Ù„Ø¹Ù…ÙˆÙ…ÙŠØ©',
      fr: "Tout ce qu'il faut savoir sur les concours publics",
    },
  },
  {
    slug: 'motivation-letter',
    date: '2025-03-17',
    tags: ['cv', 'tips'],
    title: {
      ar: 'Ø±Ø³Ø§Ù„Ø© Ø§Ù„ØªØ­ÙÙŠØ²',
      fr: 'Lettre de motivation',
    },
    excerpt: {
      ar: 'ÙƒÙŠÙ ØªÙƒØªØ¨ Ø±Ø³Ø§Ù„Ø© ØªØ­ÙÙŠØ² ØªØ¬Ø°Ø¨ Ø£ØµØ­Ø§Ø¨ Ø§Ù„Ø¹Ù…Ù„',
      fr: "Comment rediger une lettre qui attire l'attention",
    },
  },
  {
    slug: 'linkedin-tips',
    date: '2025-03-16',
    tags: ['linkedin'],
    title: {
      ar: 'Ù†ØµØ§Ø¦Ø­ LinkedIn',
      fr: 'Conseils LinkedIn',
    },
    excerpt: {
      ar: 'ÙƒÙŠÙ ØªØ¨Ù†ÙŠ Ø­Ø¶ÙˆØ±Ø§ Ù‚ÙˆÙŠØ§ Ø¹Ù„Ù‰ Ù„ÙŠÙ†ÙƒØ¯Ø¥Ù†',
      fr: 'Comment batir une presence forte sur LinkedIn',
    },
  },
  {
    slug: 'demand-jobs',
    date: '2025-03-15',
    tags: ['search'],
    title: {
      ar: 'Ø£ÙƒØ«Ø± Ø§Ù„Ù…Ù†Ø§ØµØ¨ Ø·Ù„Ø¨Ø§ 2025',
      fr: 'Metiers les plus demandes 2025',
    },
    excerpt: {
      ar: 'ØªØ¹Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù‡Ù† Ø§Ù„Ø£ÙƒØ«Ø± Ø·Ù„Ø¨Ø§ ÙÙŠ Ø³ÙˆÙ‚ Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„Ù…ØºØ±Ø¨ÙŠ',
      fr: 'Decouvrez les metiers en forte demande au Maroc',
    },
  },
  {
    slug: 'employee-rights',
    date: '2025-03-14',
    tags: ['rights'],
    title: {
      ar: 'Ø­Ù‚ÙˆÙ‚ Ø§Ù„Ù…ÙˆØ¸Ù - SMIG/CNSS',
      fr: "Droits de l'employe",
    },
    excerpt: {
      ar: 'Ø­Ù‚ÙˆÙ‚Ùƒ ÙƒÙ…ÙˆØ¸Ù ÙˆÙ…Ø§ ÙŠØ¬Ø¨ Ø£Ù† ØªØ¹Ø±ÙÙ‡ Ù‚Ø¨Ù„ Ø§Ù„ØªÙˆÙ‚ÙŠØ¹',
      fr: "Vos droits en tant qu'employe au Maroc",
    },
  },
  {
    slug: 'anapec-services',
    date: '2025-03-13',
    tags: ['search'],
    title: {
      ar: 'Ø®Ø¯Ù…Ø§Øª ANAPEC',
      fr: "Services de l'ANAPEC",
    },
    excerpt: {
      ar: 'ÙƒÙŠÙ ØªØ³ØªÙÙŠØ¯ Ù…Ù† Ø®Ø¯Ù…Ø§Øª ÙˆÙƒØ§Ù„Ø© Ø§Ù„ØªØ´ØºÙŠÙ„ ANAPEC',
      fr: "Comment profiter des services de l'ANAPEC",
    },
  },
  {
    slug: 'read-job-offer',
    date: '2026-03-29',
    tags: ['search', 'tips'],
    title: {
      ar: 'كيف تقرأ إعلان عمل قبل أن ترسل ترشيحك',
      fr: "Comment lire une offre d'emploi avant de candidater",
    },
    excerpt: {
      ar: 'خطوات بسيطة لفهم الشروط الحقيقية داخل الإعلان وتفادي ضياع الوقت في عروض لا تناسبك.',
      fr: "Les points a verifier dans une annonce pour comprendre rapidement si le poste vous correspond vraiment.",
    },
  },
  {
    slug: 'verify-job-scam',
    date: '2026-03-28',
    tags: ['safety', 'tips'],
    title: {
      ar: 'كيف تتحقق أن عرض العمل ليس احتيالا',
      fr: "Comment verifier qu'une offre n'est pas une arnaque",
    },
    excerpt: {
      ar: 'علامات مهمة تساعدك على التمييز بين الفرصة الجدية والإعلان المشبوه قبل مشاركة معلوماتك الشخصية.',
      fr: "Les signaux qui permettent de distinguer une vraie opportunite d'une annonce douteuse avant d'envoyer vos donnees.",
    },
  },
  {
    slug: 'application-mistakes',
    date: '2026-03-27',
    tags: ['tips'],
    title: {
      ar: 'أخطاء شائعة تضعف طلب العمل حتى لو كانت الفرصة مناسبة',
      fr: 'Les erreurs qui affaiblissent une candidature pourtant pertinente',
    },
    excerpt: {
      ar: 'أخطاء بسيطة في الملف أو طريقة التقديم قد تجعل المشغل يتجاوز طلبك بسرعة.',
      fr: "Des erreurs simples dans le dossier ou dans la facon de postuler peuvent suffire a faire perdre une bonne opportunite.",
    },
  },
  {
    slug: 'cdi-cdd-stage-difference',
    date: '2026-03-26',
    tags: ['contract', 'rights'],
    title: {
      ar: 'ما الفرق بين CDI و CDD و Stage في سوق الشغل',
      fr: 'Comprendre la difference entre CDI, CDD et stage',
    },
    excerpt: {
      ar: 'فهم نوع العقد يساعدك على تقييم الاستقرار، الحقوق، والأهداف المناسبة لكل مرحلة مهنية.',
      fr: "Comprendre le type de contrat aide a mieux evaluer la stabilite, les droits et l'objectif de chaque opportunite.",
    },
  },
  {
    slug: 'cv-without-experience',
    date: '2026-03-25',
    tags: ['cv', 'tips'],
    title: {
      ar: 'كيف تكتب CV مقنعا حتى إذا لم تكن لديك تجربة كبيرة',
      fr: "Comment faire un CV convaincant meme sans grande experience",
    },
    excerpt: {
      ar: 'طرق عملية لإبراز التكوين، المشاريع، والتداريب عندما تكون خبرتك المهنية ما زالت محدودة.',
      fr: "Des pistes concretes pour valoriser votre formation, vos projets et vos stages lorsque votre experience reste limitee.",
    },
  },
  {
    slug: 'concours-preparation-plan',
    date: '2026-03-24',
    tags: ['public', 'tips'],
    title: {
      ar: 'خطة عملية للتحضير لمباريات التوظيف بدون تشتت',
      fr: 'Plan pratique pour preparer un concours sans se disperser',
    },
    excerpt: {
      ar: 'برنامج واضح يساعدك على تنظيم المراجعة والوثائق والمتابعة حتى لا يتحول التحضير إلى ضغط عشوائي.',
      fr: "Une methode simple pour organiser la revision, les documents et le suivi du concours sans travailler dans le flou.",
    },
  },
];
