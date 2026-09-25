export const landing = {
  hero: {
    badge: 'תבנית קוד פתוח עם מחסנית מלאה',
    title: 'בנה אפליקציות ללא שרת',
    titleHighlight: 'במהירות הבזק',
    description:
      'תבנית מוכנה לייצור עם אימות, העלאת קבצים ורכיבי UI מודרניים. התחל לבנות את הפרויקט הבא שלך תוך דקות, לא שבועות.',
    cta: 'נסה עכשיו',
    viewGithub: 'צפה ב-GitHub',
    exploreLabel: 'חקור',
  },
  nav: {
    benefits: 'יתרונות',
    features: 'תכונות',
    tech: 'טכנולוגיות',
    pricing: 'תמחור',
  },
  benefits: {
    title: 'למה לבחור ב-{{appName}}',
    instant: {
      title: 'טעינה מיידית',
      description: 'אופטימיזציה לביצועים עם זמני טעינה מתחת לשנייה',
    },
    seo: {
      title: 'ידידותי למנועי חיפוש',
      description: 'שיטות עבודה מומלצות מובנות עבור נראות טובה יותר',
    },
    responsive: {
      title: 'רספונסיבי לחלוטין',
      description: 'עובד מצוין ממובייל 320px ועד צגי 4K',
    },
    darkMode: {
      title: 'מצב כהה ובהיר',
      description: 'לפי ערכת הנושא של המערכת או לפי בחירת המשתמש',
    },
    accessible: {
      title: 'נגיש',
      description: 'כל עמוד נבדק בבדיקות נגישות אוטומטיות',
    },
    typeSafe: {
      title: 'בטיחות טיפוסים מקצה לקצה',
      description: 'הלקוח בנוי על טיפוסי ה-TypeScript של ה-API עצמו',
    },
    secure: {
      title: 'מאובטח כברירת מחדל',
      description: 'דליים פרטיים, הגבלת קצב וכותרות אבטחה מהקופסה',
    },
    payPerUse: {
      title: 'תשלום לפי שימוש',
      description: 'אין שרתים שעומדים ריקים: העלות עוקבת אחרי התנועה',
    },
    onePush: {
      title: 'פריסה בדחיפה אחת',
      description: 'דוחפים ענף והסביבה שלו מתעדכנת מעצמה',
    },
    yourData: {
      title: 'ייצוא ומחיקת נתונים',
      description: 'משתמשים יכולים להוריד את הנתונים שלהם או למחוק את החשבון',
    },
    documented: {
      title: 'מתועד היטב',
      description: 'מדריכים, מפרט OpenAPI ותרשים ארכיטקטורה',
    },
    openSource: {
      title: 'קוד פתוח',
      description: 'ברישיון MIT: עשו fork והפכו אותו לשלכם',
    },
  },
  features: {
    title: 'כל מה שצריך לבנות',
    titleHighlight: 'מהר',
    subtitle: 'תכונות מוכנות לייצור מהקופסה',
    auth: {
      title: 'אימות מוכן',
      description:
        'הרשמה עם AWS Cognito כולל אימות אימייל, התחברות ואיפוס סיסמה. נתיבי API פרטיים מוגנים ב-JWT.',
    },
    s3: {
      title: 'העלאת קבצים',
      description:
        'תמונות פרופיל עולות דרך ה-API לדלי S3 פרטי ומוגשות מהדומיין שלכם דרך CloudFront.',
    },
    serverless: {
      title: 'ארכיטקטורה ללא שרת',
      description:
        'בנוי על AWS Lambda עם API Gateway. שלם רק עבור מה שאתה משתמש עם סקאלינג אוטומטי.',
    },
    database: {
      title: 'מסד הנתונים שלכם',
      description:
        'PostgreSQL דרך Sequelize, או MongoDB דרך Mongoose, נבחר אוטומטית לפי מחרוזת החיבור.',
    },
    infra: {
      title: 'תשתית כקוד',
      description:
        'כל הסטאק כתוב ב-AWS CDK ב-TypeScript, נבדק ב-cdk-nag ומוצג כתרשים ב-Infrastructure Composer.',
    },
    cdn: {
      title: 'דומיין משלכם ו-CDN',
      description: 'CloudFront על הדומיין שלכם, עם תעודת HTTPS ורשומות DNS שנוצרות עבורכם.',
    },
    cicd: {
      title: 'צינור CI/CD',
      description:
        'GitHub Actions פורסים את dev, qa ו-prod מהענפים שלהם, עם lint, build ובדיקות בכל pull request.',
    },
    testing: {
      title: 'בדיקות אוטומטיות',
      description:
        'בדיקות קצה לקצה ב-Playwright, בדיקות API ב-Postman ובדיקות תשתית, מקומית וב-CI.',
    },
    state: {
      title: 'ניהול מצב',
      description: 'Redux Toolkit עם TypeScript. מקור אמת יחיד עם בוררים ו-middleware מיטביים.',
    },
    i18n: {
      title: 'בינלאומיות',
      description: 'תומך בשפות RTL ו-LTR. תמיכה מובנית באנגלית ועברית עם הרחבה קלה.',
    },
    email: {
      title: 'שליחת אימייל',
      description: 'AWS SES עם DKIM על הדומיין שלכם לקודי אימות ולאימיילים שהאפליקציה שולחת.',
    },
    monitoring: {
      title: 'לוגים וטיפול בשגיאות',
      description: 'כל בקשה נרשמת ב-CloudWatch עם שמירה ל-30 יום, והשגיאות חוזרות בפורמט אחיד.',
    },
  },
  tech: {
    title: 'נבנה עם',
    titleHighlight: 'טכנולוגיות מודרניות',
    subtitle: 'כלים ומסגרות תעשייתיות סטנדרטיות',
    react: { name: 'React 19', description: 'React עם Hooks' },
    typescript: { name: 'TypeScript', description: 'פיתוח מאובטח סוגים' },
    vite: { name: 'Vite', description: 'בנייה מהירה' },
    tailwind: { name: 'Tailwind CSS', description: 'עיצוב עם utility' },
    shadcn: { name: 'shadcn/ui', description: 'רכיבי UI יפים' },
    reactBits: { name: 'React Bits', description: 'רכיבי UI מונפשים' },
    lambda: { name: 'AWS Lambda', description: 'חישוב ללא שרת' },
    redux: { name: 'Redux Toolkit', description: 'ניהול מצב' },
    query: { name: 'React Query', description: 'סנכרון מצב שרת' },
    axios: { name: 'Axios', description: 'לקוח HTTP' },
    cdk: { name: 'AWS CDK', description: 'תשתית כקוד' },
    aws: { name: 'AWS', description: 'תשתית ענן' },
  },
  cta: {
    title: 'מוכן להתחיל',
    titleHighlight: 'לבנות?',
    description: 'הצטרף למפתחים ששולחים מהר יותר עם {{appName}}. חינם, קוד פתוח, ומוכן לייצור.',
    button: 'צור חשבון',
    docs: 'קרא תיעוד',
  },
};
