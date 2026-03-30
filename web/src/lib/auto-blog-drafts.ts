export type AutoDraftSourceJob = {
  title?: string;
  title_ar?: string;
  title_fr?: string;
  organization?: string;
  organization_ar?: string;
  organization_fr?: string;
  deadline?: string;
  posts?: string;
  meta_description?: string;
  url?: string;
  post_url?: string;
  source_url?: string;
};

export type AutoDraftPayload = {
  date: string;
  tags: string;
  title_ar: string;
  title_fr: string;
  excerpt_ar: string;
  excerpt_fr: string;
  content_ar: string;
  content_fr: string;
};

const AUTO_DRAFT_TAGS = 'auto-draft,veille,emploi,maroc';

function normalizeText(value: unknown): string {
  return String(value || '').trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeDateInput(value: string): string {
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? trimmed
    : new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(value: string): string {
  return normalizeDateInput(value).split('-').reverse().join('/');
}

function getJobTitle(job: AutoDraftSourceJob, lang: 'ar' | 'fr') {
  return normalizeText(
    lang === 'ar'
      ? job.title_ar || job.title || job.title_fr
      : job.title_fr || job.title || job.title_ar,
  );
}

function getOrganization(job: AutoDraftSourceJob, lang: 'ar' | 'fr') {
  return normalizeText(
    lang === 'ar'
      ? job.organization_ar || job.organization || job.organization_fr
      : job.organization_fr || job.organization || job.organization_ar,
  );
}

function getSourceUrl(job: AutoDraftSourceJob) {
  return normalizeText(job.post_url || job.url || job.source_url);
}

function getDeadlineSentence(job: AutoDraftSourceJob, lang: 'ar' | 'fr') {
  const deadline = normalizeText(job.deadline);
  if (!deadline) {
    return '';
  }

  return lang === 'ar'
    ? ` اخر اجل للترشيح هو ${escapeHtml(deadline)}.`
    : ` La date limite de candidature est fixee au ${escapeHtml(deadline)}.`;
}

function getPostsSentence(job: AutoDraftSourceJob, lang: 'ar' | 'fr') {
  const posts = normalizeText(job.posts);
  if (!posts) {
    return '';
  }

  return lang === 'ar'
    ? ` عدد المناصب المعلن عنها هو ${escapeHtml(posts)}.`
    : ` Le nombre de postes annonces est ${escapeHtml(posts)}.`;
}

function getMetaSentence(job: AutoDraftSourceJob, lang: 'ar' | 'fr') {
  const meta = normalizeText(job.meta_description);
  if (!meta) {
    return '';
  }

  return lang === 'ar'
    ? ` ${escapeHtml(meta)}`
    : ` ${escapeHtml(meta)}`;
}

function buildJobListHtml(jobs: AutoDraftSourceJob[], lang: 'ar' | 'fr') {
  return jobs
    .map((job) => {
      const title = getJobTitle(job, lang);
      const organization = getOrganization(job, lang);
      const url = getSourceUrl(job);

      const heading = title || organization;
      const intro =
        lang === 'ar'
          ? `يتعلق هذا الاعلان بفرصة جديدة لدى ${escapeHtml(organization || 'جهة منظمة')} بعنوان ${escapeHtml(
              heading || 'مباراة او وظيفة جديدة',
            )}.${getPostsSentence(job, lang)}${getDeadlineSentence(job, lang)}${getMetaSentence(job, lang)}`
          : `Cette opportunite concerne ${escapeHtml(
              organization || 'un organisme recruteur',
            )} pour l'intitule ${escapeHtml(
              heading || "offre d'emploi ou concours",
            )}.${getPostsSentence(job, lang)}${getDeadlineSentence(job, lang)}${getMetaSentence(job, lang)}`;

      const listItems =
        lang === 'ar'
          ? [
              organization ? `<li><strong>الجهة:</strong> ${escapeHtml(organization)}</li>` : '',
              title ? `<li><strong>المنصب او المباراة:</strong> ${escapeHtml(title)}</li>` : '',
              normalizeText(job.posts)
                ? `<li><strong>عدد المناصب:</strong> ${escapeHtml(normalizeText(job.posts))}</li>`
                : '',
              normalizeText(job.deadline)
                ? `<li><strong>اخر اجل:</strong> ${escapeHtml(normalizeText(job.deadline))}</li>`
                : '',
            ]
          : [
              organization ? `<li><strong>Organisme:</strong> ${escapeHtml(organization)}</li>` : '',
              title ? `<li><strong>Intitule:</strong> ${escapeHtml(title)}</li>` : '',
              normalizeText(job.posts)
                ? `<li><strong>Postes:</strong> ${escapeHtml(normalizeText(job.posts))}</li>`
                : '',
              normalizeText(job.deadline)
                ? `<li><strong>Date limite:</strong> ${escapeHtml(normalizeText(job.deadline))}</li>`
                : '',
            ];

      const applyText =
        lang === 'ar'
          ? url
            ? `يمكنك الرجوع الى <a href="${escapeHtml(url)}">الاعلان الرسمي</a> للاطلاع على الوثائق المطلوبة وطريقة التقديم الكاملة.`
            : 'يرجى الرجوع الى المصدر الرسمي للاطلاع على شروط الترشح وطريقة التقديم الكاملة.'
          : url
            ? `Vous pouvez consulter <a href="${escapeHtml(url)}">l'annonce officielle</a> pour verifier les pieces a fournir et la procedure complete de candidature.`
            : "Veuillez consulter la source officielle pour connaitre les conditions completes et la methode de candidature.";

      return (
        `<h3>${escapeHtml(heading || (lang === 'ar' ? 'فرصة مهنية جديدة' : 'Nouvelle opportunite professionnelle'))}</h3>` +
        `<p>${intro}</p>` +
        `<ul>${listItems.filter(Boolean).join('')}</ul>` +
        `<p>${applyText}</p>`
      );
    })
    .join('');
}

export function parseAutoDraftSourcePayload(sourcePayload: string): AutoDraftSourceJob[] {
  if (!sourcePayload.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(sourcePayload);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((job): job is AutoDraftSourceJob => typeof job === 'object' && job !== null);
  } catch {
    return [];
  }
}

export function buildAutoDraftFromJobs(
  jobs: AutoDraftSourceJob[],
  publishDate?: string,
): AutoDraftPayload | null {
  if (!jobs.length) {
    return null;
  }

  const safeDate = normalizeDateInput(publishDate || new Date().toISOString().slice(0, 10));
  const displayDate = formatDisplayDate(safeDate);
  const visibleJobs = jobs.slice(0, 4);
  const hiddenCount = Math.max(0, jobs.length - visibleJobs.length);

  const arIntro = `نقدم لك في هذا المقال موجزا مهنيا يضم ابرز فرص العمل والمباريات التي تمت اضافتها حديثا بتاريخ ${displayDate}. تم تجميع هذه الفرص من مصادر رسمية وموثوقة حتى تتمكن من مراجعتها بسرعة ومقارنة التفاصيل قبل التقديم.`;
  const frIntro = `Voici un point complet sur les principales offres d'emploi et concours ajoutes le ${displayDate}. Cette selection rassemble des opportunites recentes issues de sources officielles afin de vous aider a reperer rapidement les annonces les plus importantes.`;

  const arMore = hiddenCount
    ? `<p>هناك ايضا ${hiddenCount} فرص اضافية ضمن نفس الدفعة يمكنك مراجعتها مباشرة من خلال لوحة الادارة او من خلال الصفحات الرسمية المرتبطة بكل اعلان.</p>`
    : '';
  const frMore = hiddenCount
    ? `<p>Il existe aussi ${hiddenCount} autres opportunites dans cette vague que vous pouvez consulter depuis l'administration ou directement via les sources officielles.</p>`
    : '';

  const arContent =
    `<p>${escapeHtml(arIntro)}</p>` +
    '<h2>تفاصيل ابرز الفرص الجديدة</h2>' +
    buildJobListHtml(visibleJobs, 'ar') +
    '<h2>شروط المشاركة والترشح</h2>' +
    '<p>تختلف شروط المشاركة حسب الجهة المنظمة ونوع المنصب او المباراة. لذلك من المهم التحقق من المؤهل المطلوب، الوثائق المطلوبة، واخر اجل للترشيح مباشرة من الاعلان الرسمي قبل اعداد الملف.</p>' +
    '<ul>' +
    '<li>اقرا تفاصيل الاعلان الرسمي بعناية قبل اي خطوة.</li>' +
    '<li>تأكد من مطابقة الشهادة او التخصص مع الشروط المنشورة.</li>' +
    '<li>راجع دائما اخر اجل والوثائق المطلوبة قبل ارسال الملف.</li>' +
    '</ul>' +
    '<h2>طريقة التقديم</h2>' +
    '<p>يفضل دائما الاعتماد على الروابط الرسمية المرفقة مع كل اعلان لمعرفة مسطرة الترشيح بالتفصيل، سواء كان التقديم عبر منصة رقمية او عبر ايداع ملف الترشيح حسب ما تحدده الجهة المعنية.</p>' +
    '<h2>ملاحظات مهمة</h2>' +
    '<p>قد تحتوي بعض الاعلانات على توضيحات اضافية تخص مراكز التعيين او مراحل الانتقاء او تفاصيل الملف. لهذا السبب يبقى الرجوع الى المصدر الرسمي هو المرجع الاساسي قبل التقديم النهائي.</p>' +
    arMore +
    '<h2>خلاصة</h2>' +
    '<p>تمثل هذه الفرص اختيارات مهمة للباحثين عن العمل في المغرب. قبل التقديم، خذ وقتك لقراءة الاعلان الرسمي والتحقق من جميع الشروط والاجال والوثائق المطلوبة.</p>';

  const frContent =
    `<p>${escapeHtml(frIntro)}</p>` +
    '<h2>Details des principales opportunites</h2>' +
    buildJobListHtml(visibleJobs, 'fr') +
    '<h2>Conditions de participation</h2>' +
    "<p>Les conditions de candidature changent selon l'organisme, le niveau demande et la nature du poste ou du concours. Avant toute demarche, il faut verifier le diplome requis, les pieces a fournir et la date limite annoncee dans la source officielle.</p>" +
    '<ul>' +
    '<li>Relisez toujours l annonce officielle avant de preparer votre dossier.</li>' +
    '<li>Verifiez que votre profil correspond bien aux conditions mentionnees.</li>' +
    '<li>Controlez les delais et les modalites de depot avant de candidater.</li>' +
    '</ul>' +
    '<h2>Comment postuler</h2>' +
    "<p>La meilleure approche consiste a utiliser les liens officiels associes a chaque annonce. Vous y trouverez la procedure complete, les pieces demandees et, selon les cas, la plateforme de candidature ou l'adresse de depot du dossier.</p>" +
    '<h2>Informations utiles</h2>' +
    "<p>Certaines annonces precisent des elements supplementaires comme les centres d'affectation, les etapes de selection ou les conditions particulieres. C'est pourquoi la consultation de la source officielle reste indispensable avant toute candidature.</p>" +
    frMore +
    '<h2>Conclusion</h2>' +
    "<p>Cette vague d'offres peut interesser plusieurs profils au Maroc. Avant de finaliser votre dossier, prenez le temps de verifier chaque annonce officielle afin de confirmer les conditions, les delais et la methode de candidature.</p>";

  return {
    date: safeDate,
    tags: AUTO_DRAFT_TAGS,
    title_ar: `فرص عمل جديدة في المغرب - ${displayDate}`,
    title_fr: `Nouvelles offres d'emploi au Maroc - ${displayDate}`,
    excerpt_ar: `ملخص مهني لاهم فرص العمل والمباريات التي اضيفت حديثا بتاريخ ${displayDate} مع روابط رسمية للتفاصيل وطريقة التقديم.`,
    excerpt_fr: `Resume pratique des principales offres et concours ajoutes le ${displayDate}, avec les points essentiels a verifier avant de candidater.`,
    content_ar: arContent,
    content_fr: frContent,
  };
}
