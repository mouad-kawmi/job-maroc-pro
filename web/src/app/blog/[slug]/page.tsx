import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';

function AdSpot({ label, height = 'min-h-[90px]' }: { label: string, height?: string }) {
  return <AdSlot label={label} heightClassName={height} />;
}

export default async function BlogPost(props: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const lang = (searchParams.lang === 'fr' ? 'fr' : 'ar') as 'ar' | 'fr';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Restoration of FULL rich blog articles content
  const articles: Record<string, { title: { ar: string, fr: string }, content: { ar: string, fr: string } }> = {
    'job-search-ads': {
        title: { ar: 'الدليل الشامل: كيف تجد إعلانات التوظيف في JOB MAROC PRO', fr: 'Le Guide Complet: Comment trouver les meilleures annonces d\'emploi' },
        content: {
            ar: `
                <p>البحث عن وظيفة يمكن أن يكون مرهقاً في ظل تشتت المعلومات. منصة <strong>JOB MAROC PRO</strong> صممت لتكون بوابتك الموحدة للعثور على الوظيفة المثالية سواء في القطاع العام أو الخاص.</p>
                <h3>1. استعمال محرك البحث بذكاء</h3>
                <p>للحصول على نتائج مبهرة، لا تكتفِ بالبحث العشوائي. استخدم كلمات مفتاحية دقيقة تصف مهاراتك الدقيقة مثل (تطوير الويب، محاسبة مالية، أو تدبير لوجستي).</p>
                <h3>2. تصفية النتائج (الفلترة)</h3>
                <p>يتيح لك الموقع فرز الوظائف بناءً على تاريخ النشر، نوع العقد (CDI, CDD)، ومكان العمل. القطاع العمومي لديه قسم خاص يعرض المباريات الحكومية مع شروط اجتيازها.</p>
                <h3>3. تفعيل التنبيهات</h3>
                <p>أفضل المترشحين هم الأسرع في تقديم الطلبات. قم بتفقد الموقع يومياً لأننا نحدث قاعدة البيانات بناءً على منصة التشغيل العمومي والخاص على مدار الساعة.</p>
                <div class="bg-blue-50 p-4 border-l-4 border-blue-500 rounded my-6 text-blue-900">
                    <strong>نصيحة ذهبية:</strong> اقرأ دائماً "تفاصيل الوظيفة" لتتأكد من مطابقة شروط السن والدبلوم لتفادي رفض ملفك.
                </div>
            `,
            fr: `
                <p>Chercher un emploi peut s'avérer fastidieux. La plateforme <strong>JOB MAROC PRO</strong> est conçue pour être votre portail unifié pour trouver le poste idéal au Maroc.</p>
                <h3>1. Utiliser le moteur de recherche intelligemment</h3>
                <p>Ne vous contentez pas d'une recherche aléatoire. Utilisez des mots-clés précis qui décrivent vos compétences (développement web, comptabilité, logistique).</p>
                <h3>2. Filtrer les résultats</h3>
                <p>Le site vous permet de trier les offres par date, type de contrat, et localisation. Le secteur public possède une section dédiée affichant les concours officiels.</p>
                <h3>3. Être le premier informé</h3>
                <p>Consultez la plateforme tous les jours. Notre base de données est mise à jour 24/7 pour vous garantir les dernières opportunités.</p>
            `
        }
    },
    'cv-writing': {
        title: { ar: 'كيف تكتب سيرة ذاتية (CV) احترافية في 2025 تضمن لك المقابلة', fr: 'Rédiger un CV professionnel en 2025 qui garantit un entretien' },
        content: {
            ar: `
                <p>السيرة الذاتية (CV) ليست مجرد ورقة تلخص حياتك، بل هي إعلان تسويقي لمهاراتك لمدير الموارد البشرية الذي يمتلك 10 ثوانٍ فقط لتقييم ملفك.</p>
                <h3>هيكل السيرة الذاتية الحديثة:</h3>
                <ul>
                    <li><strong>الملخص المهني (Profile):</strong> 3 أسطر تلخص خبرتك وما يمكنك تقديمه للشركة.</li>
                    <li><strong>الخبرات (Experience):</strong> رتبها من الأحدث للأقدم. ركز على الإنجازات والأرقام بدلاً من سرد المهام الروتينية فقط.</li>
                    <li><strong>تنسيق ATS (Applicant Tracking System):</strong> الشركات اليوم تستعمل برامج لفرز السير الذاتية. استخدم خطوطاً واضحة، تفادى الجداول المعقدة، وضع الكلمات المفتاحية المتعلقة بالمنصب.</li>
                </ul>
                <h3>الأخطاء القاتلة في السيرة الذاتية:</h3>
                <p>أكبر خطأ هو إرسال نفس السيرة الذاتية لكل الشركات. يجب تعديل السيرة الذاتية لتتطابق مع متطلبات الوظيفة التي تقدم عليها.</p>
            `,
            fr: `
                <p>Le CV n'est pas qu'un résumé de votre vie, c'est un document marketing pour convaincre un recruteur qui ne dispose que de 10 secondes pour vous lire.</p>
                <h3>Structure du CV moderne :</h3>
                <ul>
                    <li><strong>Profil (Summary):</strong> 3 lignes résumant votre expérience.</li>
                    <li><strong>Expérience:</strong> Classée de la plus récente à la plus ancienne. Privilégiez les résultats chiffrés.</li>
                    <li><strong>Format ATS:</strong> Les entreprises utilisent des logiciels de tri. Utilisez un format clair sans tableaux complexes.</li>
                </ul>
                <p>L'erreur fatale est d'envoyer le même CV partout. Adaptez-le toujours à l'offre.</p>
            `
        }
    },
    'interview-tips': {
        title: { ar: 'الدليل العملي لاجتياز المقابلة الشفهية (Entretien) بنجاح', fr: 'Guide pratique pour exceller lors de votre entretien d\'embauche' },
        content: {
            ar: `
                <p>تخطيت مرحلة فرز السير الذاتية وتم استدعاؤك للمقابلة الشفهية! هذه فرصتك الذهبية لإثبات قدراتك.</p>
                <h3>أسرار النجاح في المقابلة الشفهية:</h3>
                <ol>
                    <li><strong>قاعدة الـ 48 ساعة السابقة:</strong> قم بدراسة الشركة (تاريخها، منافسوها، أحدث منتجاتها). المشغل يحب المترشح المهتم بمشروعه بشغف.</li>
                    <li><strong>طريقة STAR للإجابة:</strong> عندما تُسأل عن تجربة معينة، أجب بـ: 
                        <ul>
                            <li><strong>S (الموقف - Situation)</strong></li>
                            <li><strong>T (المهمة - Task)</strong></li>
                            <li><strong>A (الإجراء - Action)</strong></li>
                            <li><strong>R (النتيجة - Result)</strong></li>
                        </ul>
                    </li>
                    <li><strong>لغة الجسد القوية:</strong> 70% من التواصل غير لفظي. واصل النظر في أعين المحاورين بثقة، وجلسة مستقيمة توحي بالثقة بالنفس.</li>
                </ol>
                <div class="bg-green-50 p-4 border-l-4 border-green-500 rounded my-6 text-green-900">
                    اطلب دائماً فرصة لطرح سؤال في نهاية المقابلة. هذا يثبت استباقيتك (Proactivity) ورغبتك الحقيقية في الانضمام لفريق العمل.
                </div>
            `,
            fr: `
                <p>Vous avez passé le tri des CV et décroché un entretien ! C'est votre opportunité en or.</p>
                <h3>Les secrets de la réussite :</h3>
                <ol>
                    <li><strong>La Règle des 48h :</strong> Étudiez l'entreprise (histoire, concurrents, actualité).</li>
                    <li><strong>La méthode STAR :</strong> Répondez aux questions situationnelles avec : Situation, Task (Tâche), Action, et Result (Résultat).</li>
                    <li><strong>Le langage corporel :</strong> 70% de la communication est non-verbale. Gardez le contact visuel et asseyez-vous droit.</li>
                </ol>
            `
        }
    },
    'sectors-2025': {
        title: { ar: 'أهم قطاعات التشغيل التي ستسيطر على المغرب في 2025', fr: 'Les secteurs d\'emploi qui domineront le Maroc en 2025' },
        content: {
            ar: `
                <p>المغرب يمر بفترة تحول جيو-اقتصادي هامة جعلته قبلة للاستثمارات الأجنبية الكبرى. هذا التحول رسم خريطة جديدة للمهن الأكثر طلباً.</p>
                <h3>1. التكنولوجيا المتقدمة والسيبرانية (IT & Cyber Security)</h3>
                <p>التحول الرقمي للقطاعين العام والخاص جعل من مهندسي البرمجيات وخبرات الذكاء الاصطناعي عملة نادرة في السوق برواتب جد مغرية.</p>
                <h3>2. صناعة السيارات والطيران (Automotive & Aerospace)</h3>
                <p>مع افتتاح مصانع جديدة لشركات عملاقة، يحتاج القطاع الصناعي باستمرار إلى مهندسي الصيانة، تقنيي الميكانيك والجودة.</p>
                <h3>3. اللوجستيك والتجارة الإلكترونية</h3>
                <p>موقع المغرب الاستراتيجي، وميناء طنجة المتوسط، فضلاً عن نمو الاقتصاد الرقمي، ضاعف من الحاجة إلى خبراء سلاسل التوريد (Supply Chain) وإدارة المستودعات.</p>
                <h3>4. الطاقات المتجددة</h3>
                <p>استثمارات المغرب الضخمة في الطاقة الشمسية (نور) وطاقة الرياح جعلت من مهندسي البيئة والطاقات النظيفة مهناً واعدة جداً للسنوات القادمة.</p>
            `,
            fr: `
                <p>Le Maroc traverse une période de transformation économique majeure, attirant des investissements étrangers qui redessinent le marché de l'emploi.</p>
                <h3>1. Hautes Technologies (IT & Cyber Security)</h3>
                <p>La transformation digitale propulse la demande en développeurs et experts en IA.</p>
                <h3>2. Industrie Automobile et Aéronautique</h3>
                <p>L'installation de géants industriels nécessite constamment des ingénieurs et techniciens de qualité.</p>
                <h3>3. Logistique et E-commerce</h3>
                <p>La position géostratégique du royaume fait exploser la demande en experts de la Supply Chain.</p>
            `
        }
    },
    'public-concours': {
        title: { ar: 'دليلك للنجاح في مباريات الوظيفة العمومية بالمغرب', fr: 'Votre guide pour réussir les concours de la Fonction Publique au Maroc' },
        content: {
            ar: `
                <p>الوظيفة العمومية تمثل الخيار المفضل للكثير من المغاربة نظراً للاستقرار المادي والمهني الذي توفره. لكن المنافسة شرسة.</p>
                <h3>كيف تبرز بين آلاف المترشحين؟</h3>
                <ul>
                    <li><strong>التحضير القبلي المبكر:</strong> لا تنتظر صدور الإعلان لتبدأ المراجعة. الدساتير وقوانين الإدارات (القانون الإداري، المالية العامة) ثابتة ويمكن مراجعتها مسبقاً.</li>
                    <li><strong>نماذج الامتحانات (QCM):</strong> أغلب المباريات أصبحت تعتمد نظام الأسئلة متعددة الاختيارات. الدقة والسرعة في الإجابة تتطلب تدرباً مكثفاً.</li>
                    <li><strong>المستجدات الوطنية:</strong> يجب أن يكون المترشح ملماً بالمشاريع الملكية الكبرى، وقرارات مجلس النواب، والظرفية الاقتصادية.</li>
                </ul>
                <p>تذكر أن التحضير الشامل والمستمر هو مفتاحك لكتابة اسمك في لوائح الناجحين.</p>
            `,
            fr: `
                <p>La fonction publique est un choix de carrière privilégié au Maroc pour la sécurité qu'elle offre. Cependant, la concurrence est féroce.</p>
                <h3>Comment se démarquer ?</h3>
                <ul>
                    <li><strong>Préparation précoce:</strong> Révisez le Droit Administratif et les Finances Publiques bien avant l'annonce du concours.</li>
                    <li><strong>Entraînement QCM:</strong> Beaucoup de concours adoptent ce format qui nécessite rapidité et précision.</li>
                    <li><strong>Actualité Nationale:</strong> Restez informé des grands projets royaux et de la conjoncture économique du pays.</li>
                </ul>
            `
        }
    },
    'motivation-letter': {
        title: { ar: 'كيف تكتب رسالة تحفيزية ناجحة (Lettre de motivation)', fr: 'Rédiger une lettre de motivation efficace et impactante' },
        content: {
            ar: `
                <p>رسالة التحفيز هي صوت سيرتك الذاتية. إنها تشرح الدوافع التي جعلتك تختار هذه الشركة تحديداً ولماذا أنت الشريك الأفضل لهم.</p>
                <h3>القواعد الذهبية لكتابة رسالة التحفيز:</h3>
                <ul>
                    <li><strong>التخصيص التام (Personalization):</strong> الرسائل الجاهزة يتم اكتشافها فوراً. اذكر منصبك المستهدف واسم الشركة بوضوح.</li>
                    <li><strong>بنية الرسالة (Vous, Moi, Nous):</strong> 
                        <br/>- <em>أنتم (Vous):</em> لماذا اخترت شركتهم؟ ما الذي يعجبك في عملهم؟
                        <br/>- <em>أنا (Moi):</em> ما هي مهاراتك التي سترد على احتياجاتهم؟
                        <br/>- <em>نحن (Nous):</em> ماذا يمكننا إنجازه معاً؟
                    </li>
                    <li><strong>الوضوح والإيجاز:</strong> رسالة التحفيز يجب ألا تتجاوز صفحة واحدة بأي حال من الأحوال.</li>
                </ul>
            `,
            fr: `
                <p>La lettre de motivation est la "voix" de votre CV. Elle explique pourquoi vous avez choisi cette entreprise spécifique.</p>
                <h3>Les règles d'or :</h3>
                <ul>
                    <li><strong>Personnalisation :</strong> Fuyez les modèles standards. Mentionnez spécifiquement l'entreprise.</li>
                    <li><strong>Structure Vous/Moi/Nous :</strong> 
                        <br/>- <em>Vous :</em> Pourquoi cette entreprise ?
                        <br/>- <em>Moi :</em> En quoi vos compétences répondent-elles à leur besoin ?
                        <br/>- <em>Nous :</em> Que ferez-vous ensemble ?
                    </li>
                    <li><strong>Concision :</strong> La lettre ne doit jamais dépasser une page.</li>
                </ul>
            `
        }
    },
    'linkedin-tips': {
        title: { ar: 'كيف تجعل حسابك على LinkedIn مغناطيساً لعروض العمل', fr: 'Optimiser son profil LinkedIn pour attirer les recruteurs' },
        content: {
            ar: `
                <p>لقد أصبح تطبيق LinkedIn اليوم هو "السوق المفتوح" لاستياد المواهب من طرف مسؤولي الموارد البشرية.</p>
                <h3>خطوات تحويل حسابك لاحترافي:</h3>
                <ol>
                    <li><strong>الصورة والتغطية (Banner):</strong> استخدم صورة لك بملابس مهنية، مع صورة غلاف تعكس مجال عملك.</li>
                    <li><strong>الكلمات المفتاحية (SEO Strategy):</strong> المشغلون يبحثون بواسطات كلمات مفتاحية كـ "Angular Developer" المشغل لن يجدك إذا كتبت فقط "طالب".</li>
                    <li><strong>التوصيات (Recommendations):</strong> اطلب من زملائك السابقين أو أساتذتك كتابة توصيات في ملفك، فهي تعطي ثقة عميقة في مهاراتك.</li>
                    <li><strong>صناعة المحتوى:</strong> شارك بعض مشاريعك، آراءك التحليلية، والمقالات المهمة في تخصصك لتصبح مرجعاً يتابعه المحترفون.</li>
                </ol>
            `,
            fr: `
                <p>LinkedIn est aujourd'hui le "marché ouvert" où les chasseurs de têtes viennent dénicher les talents.</p>
                <h3>Étapes vers l'excellence :</h3>
                <ol>
                    <li><strong>Bannière et Photo :</strong> Une image professionnelle est indispensable.</li>
                    <li><strong>Stratégie SEO :</strong> Utilisez les bons mots-clés dans votre titre.</li>
                    <li><strong>Recommandations :</strong> Les témoignages de collègues valorisent votre expertise.</li>
                    <li><strong>Création de contenu :</strong> Publiez sur votre secteur d'activité pour gagner en visibilité.</li>
                </ol>
            `
        }
    },
    'demand-jobs': {
        title: { ar: 'المهن الأكثر طلباً في السوق الوطني لسنة 2025', fr: 'Les métiers les plus demandés sur le marché national en 2025' },
        content: {
            ar: `
                <p>مع تطور الاقتصاد المغربي، برزت مهن جديدة وتراجع الطلب على أخرى. تعرف على التخصصات التي ستحكم المستقبل.</p>
                <div class="grid md:grid-cols-2 gap-4 my-8">
                    <div class="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h4 class="font-black text-blue-700 text-lg mb-2">1. المطورون (Full-Stack Developers)</h4>
                        <p class="text-slate-600 text-sm">كل شركة اليوم تحتاج موقعاً أو تطبيقاً، مما جعل وظيفة المبرمجين في قمة الهرم الوظيفي.</p>
                    </div>
                    <div class="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h4 class="font-black text-blue-700 text-lg mb-2">2. خبراء تحليل البيانات (Data Analysts)</h4>
                        <p class="text-slate-600 text-sm">أصبحت الشركات تعتمد على البيانات الضخمة (Big Data) لاتخاذ قراراتها، والرواتب في هذا القطاع خيالية.</p>
                    </div>
                    <div class="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h4 class="font-black text-blue-700 text-lg mb-2">3. مسؤولو الخدمات اللوجيستية</h4>
                        <p class="text-slate-600 text-sm">نمو التجارة الإلكترونية خلق طلباً خيالياً على أطر التخزين والنقل (Supply Chain).</p>
                    </div>
                    <div class="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h4 class="font-black text-blue-700 text-lg mb-2">4. التسويق الرقمي (Digital Marketing)</h4>
                        <p class="text-slate-600 text-sm">أصبح من الأساسي لكل ماركة الحصول على فريق لتشغيل الحملات الإعلانية ومراقبة الـ ROI.</p>
                    </div>
                </div>
            `,
            fr: `
                <p>Découvrez les spécialisations qui garantissent une employabilité maximale au Maroc.</p>
                <ul>
                    <li><strong>Développeurs Full-Stack :</strong> Indispensables à la transformation digitale.</li>
                    <li><strong>Data Analysts :</strong> Experts capables de donner du sens au Big Data.</li>
                    <li><strong>Supply Chain Managers :</strong> Piliers du boom du e-commerce et de l'industrie.</li>
                    <li><strong>Digital Marketing Managers :</strong> Au cœur de la stratégie d'acquisition de toute entreprise moderne.</li>
                </ul>
            `
        }
    },
    'employee-rights': {
        title: { ar: 'حقوقك كموظف في القطاع الخاص: كل ما يجب معرفته', fr: 'Vos droits en tant que salarié du secteur privé' },
        content: {
            ar: `
                <p>عقد العمل ليس التزاماً للشركة فقط، بل הוא قانون يحمي الموظف والمشغل في نفس الوقت.</p>
                <h3>نقاط لا تتنازل عنها كأجير:</h3>
                <ul>
                    <li><strong>الحد الأدنى للأجور (SMIG):</strong> يجب ألا يقل راتبك الصافي عن الحد الأدنى القانوني، والذي يتم مراجعته باستمرار من طرف الحكومة.</li>
                    <li><strong>التغطية الصحية (AMO) والضمان الاجتماعي (CNSS):</strong> تسجيلك في الصندوق هو حق مفروض بقوة القانون لضمان تقاعدك ورعايتك الصحية.</li>
                    <li><strong>ساعات العمل والعطل:</strong> ساعات العمل القانونية هي 44 ساعة، ولديك الحق في استراحة أسبوعية، بالإضافة لعطلة سنوية مؤدى عنها تصل لـ 1.5 يوم على كل شهر عمل.</li>
                    <li><strong>شهادة العمل:</strong> لك الحق بطلبها عند نهاية العقد، وهي تثبت فترة شغلك للمنصب قانونياً.</li>
                </ul>
            `,
            fr: `
                <p>Le contrat de travail est un document légal qui protège le salarié tout autant que l'employeur.</p>
                <h3>Les points non-négociables :</h3>
                <ul>
                    <li><strong>Le SMIG :</strong> Votre salaire ne doit jamais être inférieur au minimum légal du secteur.</li>
                    <li><strong>CNSS et AMO :</strong> Votre déclaration est une obligation de votre employeur.</li>
                    <li><strong>Congés et horaires :</strong> La durée de travail légale est de 44h/semaine avec droit aux congés payés.</li>
                </ul>
            `
        }
    },
    'anapec-services': {
        title: { ar: 'كيف تستفيد من خدمات ANAPEC للحصول على فرصة عمل', fr: 'Comment tirer profit des services de l\'ANAPEC' },
        content: {
            ar: `
                <p>الوكالة الوطنية لإنعاش التشغيل والكفاءات (ANAPEC) هي الجسر الرابط بين الباحثين عن عمل والمقاولات في المغرب.</p>
                <h3>كيف تستفيد أقصى استفادة:</h3>
                <ul>
                    <li><strong>عقود الإدماج والتأهيل (CI):</strong> الكثير من الشركات تفضل توظيف الشباب عبر وكالة الأنابيك للتحفيزات الضريبية التي تستفيد منها، مما يضاعف فرصتك كخريج جديد (Primo-accédant).</li>
                    <li><strong>ورشات التكوين (Ateliers):</strong> تقدم الوكالة تكوينات مجانية لكيفية صياغة الـ CV واجتياز المقابلات، وهي ورشات مؤطرة من اختصاصيين.</li>
                    <li><strong>بوابة التشغيل الدولية:</strong> توفر الأنابيك عروض عمل خارج أرض الوطن (إسبانيا، فرنسا، الخليج، كندا) للعمال المؤهلين والمتخصصين الموسميين.</li>
                </ul>
                <p class="font-bold mt-6 text-slate-800 text-center">قم بزيارة أقرب وكالة إليك ومعك شهاداتك الجامعية وسيرتك الذاتية للتسجيل والحصول على مواكبة شخصية.</p>
            `,
            fr: `
                <p>L'ANAPEC est le trait d'union par excellence entre l'offre et la demande d'emploi au Maroc.</p>
                <h3>Tirez-en un maximum de bénéfices :</h3>
                <ul>
                    <li><strong>Contrats d'Insertion :</strong> Profitez de cet atout majeur pour décrocher un premier poste.</li>
                    <li><strong>Ateliers de conseil :</strong> Améliorez vos techniques de recherche d'emploi et vos entretiens gratuitement.</li>
                    <li><strong>Placement à l'international :</strong> Opportunités de travail à l'Etranger grâce aux partenariats internationaux de l'agence.</li>
                </ul>
            `
        }
    }
  };

  const article = articles[params.slug];
  if (!article) return notFound();

  const t = {
    ar: { back: '← العودة للمدونة', readingTime: 'دقائق للقراءة', share: 'شارك المقال' },
    fr: { back: '→ Retour au blog', readingTime: 'min de lecture', share: 'Partager' }
  }[lang];

  // Estimate reading time (avg 200 words/min)
  const wordCount = article.content[lang].replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#f1f5f9' }} dir={dir}>
      <Navbar lang={lang} />

      {/* AD SPOT 1 — Top of article */}
      <div className="container mx-auto px-4 max-w-3xl mt-4">
        <AdSpot label="728x90 — Leaderboard (Top of Article)" />
      </div>

      <main className="container mx-auto px-4 max-w-3xl py-6 flex-grow">
        {/* Back link */}
        <Link href={`/blog?lang=${lang}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 mb-5 transition-colors">
          {t.back}
        </Link>

        <article className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Article Header */}
          <div className="bg-gradient-to-br from-[#0f2167] to-[#1a3a8f] px-8 py-10 text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-white/15 border border-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                ✍️ {lang === 'ar' ? 'مقال' : 'Article'}
              </span>
              <span className="text-blue-300 text-[10px] font-bold">
                ⏱️ {readTime} {t.readingTime}
              </span>
            </div>
            <h1 className="text-xl md:text-3xl font-black leading-tight">{article.title[lang]}</h1>
          </div>

          {/* AD SPOT 2 — Under title, above content */}
          <div className="px-6 md:px-10 pt-6">
            <AdSpot label="336x280 — Rectangle Ad (Under Article Title)" height="min-h-[90px]" />
          </div>

          {/* Article Content */}
          <div
            className="px-6 md:px-10 py-8 prose prose-slate max-w-none
              prose-headings:font-black prose-headings:text-slate-800
              prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-sm md:prose-p:text-base
              prose-li:text-slate-600 prose-li:text-sm md:prose-li:text-base
              prose-strong:text-slate-800
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
            dir="auto"
            dangerouslySetInnerHTML={{ __html: article.content[lang] }}
          />

          {/* AD SPOT 3 — End of article */}
          <div className="px-6 md:px-10 pb-8">
            <AdSpot label="728x90 — Horizontal Banner (End of Article)" />
          </div>

          {/* Share CTA */}
          <div className="px-6 md:px-10 pb-8">
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-black text-slate-800 text-sm">{lang === 'ar' ? '💡 هل أفادك هذا المقال؟' : '💡 Cet article vous a aidé ?'}</p>
                <p className="text-slate-500 text-xs mt-1">{lang === 'ar' ? 'شاركه مع أصدقائك الباحثين عن عمل' : 'Partagez-le avec vos amis en recherche d\'emploi'}</p>
              </div>
              <Link
                href={`/blog?lang=${lang}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-2.5 px-6 rounded-xl transition-colors shrink-0"
              >
                {lang === 'ar' ? 'مقالات أخرى ←' : 'Autres articles →'}
              </Link>
            </div>
          </div>
        </article>

        {/* AD SPOT 4 — Below article */}
        <div className="mt-6">
          <AdSpot label="728x90 — Footer Banner (Below Article)" />
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
