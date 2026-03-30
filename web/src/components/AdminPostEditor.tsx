'use client';

import { useDeferredValue, useId, useMemo, useState } from 'react';
import type { BlogPost } from '@/lib/content';

type Lang = 'ar' | 'fr';

type EditorAction = (formData: FormData) => void | Promise<void>;

type EditorState = {
  slug: string;
  date: string;
  tags: string;
  titleAr: string;
  titleFr: string;
  excerptAr: string;
  excerptFr: string;
  contentAr: string;
  contentFr: string;
  isPublished: boolean;
};

type HtmlAnalysis = {
  previewHtml: string;
  hardIssues: string[];
  softIssues: string[];
  changedForPreview: boolean;
};

const ALLOWED_TAGS = new Set(['p', 'h2', 'h3', 'ul', 'li', 'strong', 'a']);
const DANGEROUS_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'meta',
  'link',
  'base',
]);

function getUi(lang: Lang) {
  if (lang === 'fr') {
    return {
      labels: {
        slug: 'Slug',
        date: 'Date',
        tags: 'Tags separes par des virgules',
        isPublished: 'Publie',
        titleAr: 'Titre en arabe',
        titleFr: 'Titre en francais',
        excerptAr: 'Extrait en arabe',
        excerptFr: 'Extrait en francais',
        contentAr: 'Contenu HTML en arabe',
        contentFr: 'Contenu HTML en francais',
      },
      help:
        'Le formulaire reste en HTML brut, mais vous avez maintenant un apercu direct avant enregistrement.',
      previewTitle: 'Apercu avant enregistrement',
      previewText:
        'Le panneau ci-dessous montre le rendu probable du contenu et signale les points qui meritent une verification.',
      previewAr: 'Apercu arabe',
      previewFr: 'Apercu francais',
      previewExcerpt: 'Extrait',
      previewContent: 'Contenu',
      emptyPreview: 'Le rendu apparaitra ici apres la saisie du contenu HTML.',
      validationTitle: 'Verification HTML rapide',
      validationSafe: 'Aucun blocage detecte. Vous pouvez enregistrer.',
      validationHard: 'Blocages avant enregistrement',
      validationSoft: 'Points a verifier',
      blockedSubmit:
        "L'enregistrement est bloque tant que le HTML contient des balises ou des attributs dangereux.",
      previewAdjusted:
        "L'apercu nettoie les balises non supportees pour vous montrer un rendu plus propre.",
      rulesTitle: 'Bonnes pratiques rapides',
      rules: [
        'Utilisez surtout <p>, <h2>, <h3>, <ul>, <li>, <strong> et <a>.',
        'Ajoutez au moins un sous-titre et un lien officiel quand le sujet le permet.',
        'Evitez les balises inutiles et les styles inline copies depuis d autres sites.',
      ],
      issues: {
        shortContent:
          'Le contenu semble encore court. Ajoutez plus de contexte pour un article plus solide.',
        missingHeadings:
          'Ajoutez au moins un sous-titre <h2> ou <h3> pour clarifier la structure de l article.',
        missingLink:
          'Ajoutez un lien officiel avec <a> pour guider le lecteur vers la source.',
        unsupportedTags: 'Balises non supportees dans l apercu',
        dangerousTags: 'Balises dangereuses detectees',
        removedAttributes:
          "Des attributs non necessaires ont ete retires dans l apercu",
        invalidLinks:
          'Certains liens utilisent un href non sur ou incomplete. Corrigez-les avant enregistrement.',
        eventHandlers:
          'Des gestionnaires JavaScript inline ont ete detectes. Supprimez-les avant enregistrement.',
      },
    };
  }

  return {
    labels: {
      slug: 'المعرف المختصر',
      date: 'التاريخ',
      tags: 'الوسوم مفصولة بفواصل',
      isPublished: 'منشور',
      titleAr: 'العنوان بالعربية',
      titleFr: 'العنوان بالفرنسية',
      excerptAr: 'المقتطف بالعربية',
      excerptFr: 'المقتطف بالفرنسية',
      contentAr: 'المحتوى HTML بالعربية',
      contentFr: 'المحتوى HTML بالفرنسية',
    },
    help:
      'يبقى التحرير هنا بصيغة HTML خام، لكن اصبح لديك الان معاينة مباشرة قبل الحفظ.',
    previewTitle: 'معاينة قبل الحفظ',
    previewText:
      'توضح لك هذه المساحة كيف سيظهر المحتوى غالبا، مع تنبيهات سريعة حول النقاط التي تستحق المراجعة.',
    previewAr: 'معاينة العربية',
    previewFr: 'معاينة الفرنسية',
    previewExcerpt: 'المقتطف',
    previewContent: 'المحتوى',
    emptyPreview: 'ستظهر المعاينة هنا بعد ادخال محتوى HTML.',
    validationTitle: 'فحص سريع ل HTML',
    validationSafe: 'لا توجد عوائق واضحة. يمكنك الحفظ.',
    validationHard: 'عوائق قبل الحفظ',
    validationSoft: 'ملاحظات للمراجعة',
    blockedSubmit:
      'تم منع الحفظ لان المحتوى يحتوي على عناصر HTML او خصائص خطيرة.',
    previewAdjusted:
      'المعاينة تنظف العناصر غير المدعومة حتى ترى شكلا اقرب للنشر.',
    rulesTitle: 'ارشادات سريعة',
    rules: [
      'استعمل غالبا الوسوم <p> و <h2> و <h3> و <ul> و <li> و <strong> و <a>.',
      'حاول اضافة عنوان فرعي واحد على الاقل ورابط رسمي عندما يكون ذلك ممكنا.',
      'تجنب لصق HTML مليء بالخصائص او التنسيقات غير الضرورية.',
    ],
    issues: {
      shortContent:
        'يبدو ان المحتوى ما زال قصيرا. حاول اضافة سياق اكثر ليصبح المقال اقوى.',
      missingHeadings:
        'يفضل اضافة عنوان فرعي واحد على الاقل باستعمال <h2> او <h3> لتحسين البنية.',
      missingLink:
        'يفضل اضافة رابط رسمي باستعمال <a> لتوجيه القارئ الى المصدر.',
      unsupportedTags: 'وسوم غير مدعومة في المعاينة',
      dangerousTags: 'تم العثور على وسوم خطيرة',
      removedAttributes: 'تم حذف خصائص غير ضرورية من المعاينة',
      invalidLinks:
        'بعض الروابط تحتوي على href غير امن او غير مكتمل. صححها قبل الحفظ.',
      eventHandlers:
        'تم العثور على خصائص JavaScript داخل HTML. احذفها قبل الحفظ.',
    },
  };
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function analyzeHtml(html: string, ui: ReturnType<typeof getUi>): HtmlAnalysis {
  const softIssues: string[] = [];
  const hardIssues: string[] = [];
  const textLength = stripHtml(html).length;
  const hasHeadings = /<\s*h[23]\b/i.test(html);
  const hasLink = /<\s*a\b/i.test(html);

  if (!hasHeadings && html.trim()) {
    softIssues.push(ui.issues.missingHeadings);
  }

  if (!hasLink && html.trim()) {
    softIssues.push(ui.issues.missingLink);
  }

  if (textLength > 0 && textLength < 500) {
    softIssues.push(ui.issues.shortContent);
  }

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return {
      previewHtml: html,
      hardIssues,
      softIssues,
      changedForPreview: false,
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
  const body = doc.body;
  const unsupportedTags = new Set<string>();
  const dangerousTags = new Set<string>();
  const removedAttributes = new Set<string>();
  let invalidLinkCount = 0;
  let eventHandlerCount = 0;

  for (const element of Array.from(body.querySelectorAll('*'))) {
    const tag = element.tagName.toLowerCase();

    if (DANGEROUS_TAGS.has(tag)) {
      dangerousTags.add(tag);
      element.remove();
      continue;
    }

    if (!ALLOWED_TAGS.has(tag)) {
      unsupportedTags.add(tag);
      while (element.firstChild) {
        element.parentNode?.insertBefore(element.firstChild, element);
      }
      element.remove();
      continue;
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();

      if (name.startsWith('on')) {
        eventHandlerCount += 1;
        element.removeAttribute(attribute.name);
        continue;
      }

      if (tag === 'a' && name === 'href') {
        const safeHref =
          /^(https?:\/\/|\/|#)/i.test(value) && !/^javascript:/i.test(value);

        if (!safeHref) {
          invalidLinkCount += 1;
          element.removeAttribute(attribute.name);
        }
        continue;
      }

      removedAttributes.add(name);
      element.removeAttribute(attribute.name);
    }

    if (tag === 'a' && !element.getAttribute('href')) {
      const replacement = doc.createTextNode(element.textContent || '');
      element.replaceWith(replacement);
    }
  }

  if (unsupportedTags.size > 0) {
    softIssues.push(
      `${ui.issues.unsupportedTags}: ${Array.from(unsupportedTags).sort().join(', ')}`,
    );
  }

  if (removedAttributes.size > 0) {
    softIssues.push(
      `${ui.issues.removedAttributes}: ${Array.from(removedAttributes).sort().join(', ')}`,
    );
  }

  if (dangerousTags.size > 0) {
    hardIssues.push(
      `${ui.issues.dangerousTags}: ${Array.from(dangerousTags).sort().join(', ')}`,
    );
  }

  if (eventHandlerCount > 0) {
    hardIssues.push(ui.issues.eventHandlers);
  }

  if (invalidLinkCount > 0) {
    hardIssues.push(ui.issues.invalidLinks);
  }

  const previewHtml = body.innerHTML.trim();

  return {
    previewHtml,
    hardIssues,
    softIssues,
    changedForPreview: previewHtml !== html.trim(),
  };
}

function createInitialState(
  initialPost: BlogPost | undefined,
  defaultDate: string,
): EditorState {
  return {
    slug: initialPost?.slug || '',
    date: initialPost?.date || defaultDate,
    tags: initialPost?.tags.join(', ') || '',
    titleAr: initialPost?.titleAr || '',
    titleFr: initialPost?.titleFr || '',
    excerptAr: initialPost?.excerptAr || '',
    excerptFr: initialPost?.excerptFr || '',
    contentAr: initialPost?.contentAr || '',
    contentFr: initialPost?.contentFr || '',
    isPublished: initialPost?.isPublished ?? true,
  };
}

function InputField({
  id,
  label,
  name,
  value,
  onChange,
  textarea = false,
  rows = 4,
  type = 'text',
  required = false,
}: {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  rows?: number;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      )}
    </label>
  );
}

function PreviewCard({
  title,
  articleTitle,
  excerpt,
  contentHtml,
  emptyText,
  dir,
}: {
  title: string;
  articleTitle: string;
  excerpt: string;
  contentHtml: string;
  emptyText: string;
  dir: 'rtl' | 'ltr';
}) {
  const hasContent = articleTitle.trim() || excerpt.trim() || contentHtml.trim();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <div
        dir={dir}
        className="mt-4 space-y-4 text-sm text-slate-700 [&_a]:font-bold [&_a]:text-blue-700 [&_a]:underline [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-slate-950 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-7 [&_strong]:font-black"
      >
        {hasContent ? (
          <>
            {articleTitle.trim() && (
              <h2 className="!mt-0 !text-2xl !font-black !leading-tight">
                {articleTitle}
              </h2>
            )}
            {excerpt.trim() && (
              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
                {excerpt}
              </p>
            )}
            {contentHtml.trim() ? (
              <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
            ) : null}
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center font-bold text-slate-400">
            {emptyText}
          </p>
        )}
      </div>
    </div>
  );
}

export function AdminPostEditor({
  lang,
  action,
  submitLabel,
  initialPost,
  hiddenFields,
  defaultDate,
}: {
  lang: Lang;
  action: EditorAction;
  submitLabel: string;
  initialPost?: BlogPost;
  hiddenFields?: Record<string, string | undefined>;
  defaultDate: string;
}) {
  const ui = getUi(lang);
  const fieldPrefix = useId();
  const [state, setState] = useState(() => createInitialState(initialPost, defaultDate));
  const [submitBlocked, setSubmitBlocked] = useState(false);

  const deferredExcerptAr = useDeferredValue(state.excerptAr);
  const deferredExcerptFr = useDeferredValue(state.excerptFr);
  const deferredContentAr = useDeferredValue(state.contentAr);
  const deferredContentFr = useDeferredValue(state.contentFr);

  const analysisAr = useMemo(
    () => analyzeHtml(deferredContentAr, ui),
    [deferredContentAr, ui],
  );
  const analysisFr = useMemo(
    () => analyzeHtml(deferredContentFr, ui),
    [deferredContentFr, ui],
  );

  const hardIssues = [...analysisAr.hardIssues, ...analysisFr.hardIssues];
  const softIssues = [...analysisAr.softIssues, ...analysisFr.softIssues];
  const previewAdjusted = analysisAr.changedForPreview || analysisFr.changedForPreview;

  function update<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    setState((current) => ({ ...current, [key]: value }));
    setSubmitBlocked(false);
  }

  return (
    <form
      action={action}
      className="mt-5 space-y-5"
      onSubmit={(event) => {
        if (hardIssues.length > 0) {
          event.preventDefault();
          setSubmitBlocked(true);
        }
      }}
    >
      {Object.entries(hiddenFields || {}).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null,
      )}

      <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm font-bold text-slate-600">
        {ui.help}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InputField
          id={`${fieldPrefix}-slug`}
          label={ui.labels.slug}
          name="slug"
          value={state.slug}
          onChange={(value) => update('slug', value)}
          required
        />
        <InputField
          id={`${fieldPrefix}-date`}
          label={ui.labels.date}
          name="date"
          type="date"
          value={state.date}
          onChange={(value) => update('date', value)}
          required
        />
        <InputField
          id={`${fieldPrefix}-tags`}
          label={ui.labels.tags}
          name="tags"
          value={state.tags}
          onChange={(value) => update('tags', value)}
        />
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
          <input
            type="checkbox"
            name="isPublished"
            checked={state.isPublished}
            onChange={(event) => update('isPublished', event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          {ui.labels.isPublished}
        </label>
        <InputField
          id={`${fieldPrefix}-title-ar`}
          label={ui.labels.titleAr}
          name="titleAr"
          value={state.titleAr}
          onChange={(value) => update('titleAr', value)}
          required
        />
        <InputField
          id={`${fieldPrefix}-title-fr`}
          label={ui.labels.titleFr}
          name="titleFr"
          value={state.titleFr}
          onChange={(value) => update('titleFr', value)}
          required
        />
        <InputField
          id={`${fieldPrefix}-excerpt-ar`}
          label={ui.labels.excerptAr}
          name="excerptAr"
          value={state.excerptAr}
          onChange={(value) => update('excerptAr', value)}
          textarea
          rows={4}
          required
        />
        <InputField
          id={`${fieldPrefix}-excerpt-fr`}
          label={ui.labels.excerptFr}
          name="excerptFr"
          value={state.excerptFr}
          onChange={(value) => update('excerptFr', value)}
          textarea
          rows={4}
          required
        />
        <InputField
          id={`${fieldPrefix}-content-ar`}
          label={ui.labels.contentAr}
          name="contentAr"
          value={state.contentAr}
          onChange={(value) => update('contentAr', value)}
          textarea
          rows={12}
          required
        />
        <InputField
          id={`${fieldPrefix}-content-fr`}
          label={ui.labels.contentFr}
          name="contentFr"
          value={state.contentFr}
          onChange={(value) => update('contentFr', value)}
          textarea
          rows={12}
          required
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h4 className="text-lg font-black text-slate-950">{ui.previewTitle}</h4>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{ui.previewText}</p>
          </div>
          {previewAdjusted && (
            <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-800">
              {ui.previewAdjusted}
            </span>
          )}
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-black text-slate-900">{ui.validationTitle}</p>
            {hardIssues.length === 0 ? (
              <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-800">
                {ui.validationSafe}
              </span>
            ) : null}
          </div>

          {hardIssues.length > 0 && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-black">{ui.validationHard}</p>
              <ul className="mt-3 space-y-2">
                {hardIssues.map((issue) => (
                  <li key={issue} className="list-inside list-disc">
                    {issue}
                  </li>
                ))}
              </ul>
              {submitBlocked && (
                <p className="mt-3 font-black">{ui.blockedSubmit}</p>
              )}
            </div>
          )}

          {softIssues.length > 0 && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-black">{ui.validationSoft}</p>
              <ul className="mt-3 space-y-2">
                {softIssues.map((issue) => (
                  <li key={issue} className="list-inside list-disc">
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-black text-slate-800">{ui.rulesTitle}</p>
            <ul className="mt-3 space-y-2">
              {ui.rules.map((rule) => (
                <li key={rule} className="list-inside list-disc">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <PreviewCard
            title={ui.previewAr}
            articleTitle={state.titleAr}
            excerpt={deferredExcerptAr}
            contentHtml={analysisAr.previewHtml}
            emptyText={ui.emptyPreview}
            dir="rtl"
          />
          <PreviewCard
            title={ui.previewFr}
            articleTitle={state.titleFr}
            excerpt={deferredExcerptFr}
            contentHtml={analysisFr.previewHtml}
            emptyText={ui.emptyPreview}
            dir="ltr"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
      >
        {submitLabel}
      </button>
    </form>
  );
}
