/** Rest of namespaces: landing, pricing, dashboard, notFound, auth, legal, featuresPage, profile, footer */

/** Nested translation value: string, array of strings, or nested object (for i18next) */
export type RestTranslationValue = string | string[] | { [key: string]: RestTranslationValue };

export type RestTranslations = Record<string, RestTranslationValue>;

const landingEn = {
  landing: {
    hero: {
      badge: 'Open Source Full-Stack Template',
      title: 'Build Serverless Apps',
      titleHighlight: 'Lightning Fast',
      description:
        'A production-ready full-stack serverless template with authentication, file uploads, and modern UI components. Start building your next project in minutes, not weeks.',
      cta: 'Try It Now',
      viewGithub: 'View on GitHub',
    },
    benefits: {
      title: 'Why Choose Elytra',
      instant: {
        title: 'Instant Loading',
        description: 'Optimized for performance with sub-second load times',
      },
      seo: {
        title: 'SEO Friendly',
        description: 'Built-in SEO best practices for better discoverability',
      },
      responsive: {
        title: 'Fully Responsive',
        description: 'Works perfectly from 320px mobile to 4K displays',
      },
    },
    features: {
      title: 'Everything You Need to Build',
      titleHighlight: 'Fast',
      subtitle: 'Production-ready features out of the box',
      auth: {
        title: 'Authentication Ready',
        description:
          'AWS Cognito integration with Google and Apple sign-in. Secure, scalable, and easy to customize.',
      },
      s3: {
        title: 'S3 File Uploads',
        description:
          'Direct S3 uploads with presigned URLs. Optimized for images with automatic compression and resizing.',
      },
      serverless: {
        title: 'Serverless Architecture',
        description:
          'Built on AWS Lambda with API Gateway. Pay only for what you use with automatic scaling.',
      },
      cicd: {
        title: 'CI/CD Pipeline',
        description:
          'Automated deployments with GitHub Actions. Test, build, and deploy with confidence.',
      },
      state: {
        title: 'State Management',
        description:
          'Redux Toolkit with TypeScript. Single source of truth with optimized selectors and middleware.',
      },
      i18n: {
        title: 'Internationalization',
        description:
          'Supports RTL and LTR languages. Built-in support for English and Hebrew with easy extensibility.',
      },
      email: {
        title: 'Email Sending',
        description:
          'AWS SES integration for transactional emails. Templates, scheduling, and tracking included.',
      },
      mfa: {
        title: 'Multi-Factor Auth',
        description: 'TOTP-based MFA with QR codes. SMS backup codes for enhanced security.',
      },
      monitoring: {
        title: 'Monitoring & Observability',
        description:
          "Track performance and errors with built-in logging and metrics. Stay on top of your app's health.",
      },
    },
    tech: {
      title: 'Built with',
      titleHighlight: 'Modern Technologies',
      subtitle: 'Industry-standard tools and frameworks',
      react: { name: 'React 19', description: 'Latest React with Hooks' },
      typescript: { name: 'TypeScript', description: 'Type-safe development' },
      vite: { name: 'Vite', description: 'Lightning-fast builds' },
      tailwind: { name: 'Tailwind CSS', description: 'Utility-first styling' },
      shadcn: { name: 'shadcn/ui', description: 'Beautiful UI components' },
      reactBits: { name: 'React Bits', description: 'Animated UI components' },
      lambda: { name: 'AWS Lambda', description: 'Serverless compute' },
      redux: { name: 'Redux Toolkit', description: 'State management' },
      query: { name: 'React Query', description: 'Server state sync' },
      axios: { name: 'Axios', description: 'HTTP client' },
      serverless: { name: 'AWS Serverless', description: 'Serverless framework' },
      aws: { name: 'AWS', description: 'Cloud infrastructure' },
    },
    cta: {
      title: 'Ready to Start',
      titleHighlight: 'Building?',
      description:
        'Join developers who are shipping faster with Elytra. Free, open source, and ready for production.',
      button: 'Create Account',
      docs: 'Read Documentation',
    },
  },
};

const pricingEn = {
  pricing: {
    title: 'Simple,',
    titleHighlight: 'transparent pricing',
    subtitle:
      "Choose the plan that's right for you. All plans include access to the full codebase.",
    free: {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for personal projects and learning',
      cta: 'Get Started',
      badge: '',
      features: [
        'Full access to codebase',
        'Community support',
        'Basic documentation',
        'Deploy to your own infrastructure',
      ],
    },
    pro: {
      name: 'Pro',
      price: '$20',
      period: 'per month',
      description: 'For professional developers and small teams',
      badge: 'Most Popular',
      cta: 'Get Started',
      features: [
        'Everything in Free',
        'Priority support',
        'Advanced examples',
        'Private Discord channel',
        'Monthly office hours',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For organizations with specific needs',
      cta: 'Contact Sales',
      badge: '',
      features: [
        'Everything in Pro',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'Training sessions',
        'White-label options',
      ],
    },
  },
};

const dashboardEn = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Welcome to your dashboard',
    menu: 'Menu',
    stats: {
      totalUsers: 'Total Users',
      activeProjects: 'Active Projects',
      successRate: 'Success Rate',
    },
  },
};
const notFoundEn = {
  notFound: {
    title: '404',
    message: "Oops! The page you're looking for doesn't exist.",
    backHome: 'Go back home',
  },
};

const authEn = {
  auth: {
    login: {
      title: 'Welcome back',
      description: 'Login with your Apple or Google account',
      loginWithApple: 'Login with Apple',
      loginWithGoogle: 'Login with Google',
      orContinueWith: 'Or continue with',
      email: 'Email',
      emailPlaceholder: 'm@example.com',
      password: 'Password',
      forgotPassword: 'Forgot your password?',
      submit: 'Login',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
      agreeTo: 'By clicking continue, you agree to our',
      termsOfService: 'Terms of Service',
      and: 'and',
      privacyPolicy: 'Privacy Policy',
      feature1: 'Build serverless apps lightning fast',
      feature2: 'Production-ready auth and file uploads',
      feature3: 'Secure and easy to customize',
    },
    signUp: {
      title: 'Create your account',
      description: 'Enter your email below to create your account',
      fullName: 'Full Name',
      namePlaceholder: 'John Doe',
      email: 'Email',
      emailPlaceholder: 'm@example.com',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      passwordHint: 'Must be at least 8 characters long.',
      submit: 'Create Account',
      haveAccount: 'Already have an account?',
      signIn: 'Sign in',
      agreeTo: 'By clicking continue, you agree to our',
      termsOfService: 'Terms of Service',
      and: 'and',
      privacyPolicy: 'Privacy Policy',
    },
    forgotPassword: {
      title: 'Reset your password',
      description: "Enter your email and we'll send you a reset link",
      email: 'Email',
      emailPlaceholder: 'm@example.com',
      submit: 'Send Reset Link',
      rememberPassword: 'Remember your password?',
      signIn: 'Sign in',
    },
    resetPassword: {
      title: 'Create new password',
      description: 'Enter your new password below',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      passwordHint: 'Must be at least 8 characters long',
      submit: 'Reset Password',
    },
    confirm: {
      title: 'Email Confirmation',
      checking: 'Confirming your email address...',
      checkEmail: 'Check your email for a confirmation link',
      goToLogin: 'Go to Login',
    },
  },
};

const legalEn = {
  legal: {
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: February 1, 2026',
      section1: {
        title: '1. Information We Collect',
        content:
          'We collect information that you provide directly to us, including when you create an account, use our services, or communicate with us. This may include your name, email address, and other contact information.',
      },
      section2: {
        title: '2. How We Use Your Information',
        content:
          'We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to protect our users and services.',
      },
      section3: {
        title: '3. Information Sharing',
        content:
          'We do not sell your personal information. We may share your information with service providers who assist us in operating our services, subject to confidentiality agreements.',
      },
      section4: {
        title: '4. Data Security',
        content:
          'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
      },
      section5: {
        title: '5. Your Rights',
        content:
          'You have the right to access, correct, or delete your personal information. You may also object to or restrict certain processing of your data.',
      },
      section6: {
        title: '6. Contact Us',
        content:
          'If you have questions about this Privacy Policy, please contact us at privacy@elytra.dev.',
      },
    },
    terms: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated: February 1, 2026',
      section1: {
        title: '1. Acceptance of Terms',
        content:
          'By accessing and using Elytra, you accept and agree to be bound by the terms and provision of this agreement.',
      },
      section2: {
        title: '2. Use License',
        content:
          "Permission is granted to temporarily download one copy of the materials on Elytra's website for personal, non-commercial transitory viewing only.",
      },
      section3: {
        title: '3. Disclaimer',
        content:
          "The materials on Elytra's website are provided on an 'as is' basis. Elytra makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.",
      },
      section4: {
        title: '4. Limitations',
        content:
          "In no event shall Elytra or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Elytra's website.",
      },
      section5: {
        title: '5. Revisions',
        content:
          "The materials appearing on Elytra's website may include technical, typographical, or photographic errors. Elytra does not warrant that any of the materials on its website are accurate, complete, or current.",
      },
      section6: {
        title: '6. Governing Law',
        content:
          'These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.',
      },
    },
  },
};

const featuresPageEn = {
  featuresPage: {
    title: 'Powerful features',
    titleHighlight: 'for modern apps',
    subtitle:
      'Everything you need to build production-ready serverless applications. No setup required.',
    comingSoon: 'More features coming soon',
    comingSoonDesc:
      "We're constantly improving Elytra with new features, components, and integrations. Join our community to stay updated.",
  },
};

const profileEn = {
  profile: {
    title: 'Profile',
    subtitle: 'Manage your account settings',
    avatar: {
      title: 'Profile Picture',
      description: 'Upload a profile picture to personalize your account',
      upload: 'Upload Photo',
      comingSoon: 'Image upload coming soon with backend',
    },
    info: {
      title: 'Account Information',
      name: 'Name',
      email: 'Email',
      userId: 'User ID',
      notSet: 'Not set',
    },
  },
};

const footerEn = {
  footer: {
    product: 'Product',
    resources: 'Resources',
    company: 'Company',
    legal: 'Legal',
    builtWith: 'Built with',
    features: 'Features',
    pricing: 'Pricing',
    documentation: 'Documentation',
    examples: 'Examples',
    blog: 'Blog',
    community: 'Community',
    about: 'About',
    contact: 'Contact',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    github: 'GitHub',
    social: 'Social',
    githubAria: 'Open Elytra repository on GitHub',
    linkedInAria: 'Open Elytra on LinkedIn',
    copyright: '© {{year}} {{name}}',
    madeWithLove: 'Made with {{name}} and love',
  },
};

export const restEn: RestTranslations = {
  ...landingEn,
  ...pricingEn,
  ...dashboardEn,
  ...notFoundEn,
  ...authEn,
  ...legalEn,
  ...featuresPageEn,
  ...profileEn,
  ...footerEn,
};

/* Hebrew (he) */
const landingHe = {
  landing: {
    hero: {
      badge: 'תבנית קוד פתוח עם מחסנית מלאה',
      title: 'בנה אפליקציות ללא שרת',
      titleHighlight: 'במהירות הבזק',
      description:
        'תבנית מוכנה לייצור עם אימות, העלאת קבצים ורכיבי UI מודרניים. התחל לבנות את הפרויקט הבא שלך תוך דקות, לא שבועות.',
      cta: 'נסה עכשיו',
      viewGithub: 'צפה ב-GitHub',
    },
    benefits: {
      title: 'למה לבחור ב-Elytra',
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
    },
    features: {
      title: 'כל מה שצריך לבנות',
      titleHighlight: 'מהר',
      subtitle: 'תכונות מוכנות לייצור מהקופסה',
      auth: {
        title: 'אימות מוכן',
        description:
          'אינטגרציה עם AWS Cognito עם התחברות Google ו-Apple. מאובטח, ניתן להרחבה, וקל להתאמה אישית.',
      },
      s3: {
        title: 'העלאת קבצים ל-S3',
        description:
          'העלאות ישירות ל-S3 עם URLים חתומים מראש. אופטימיזציה לתמונות עם דחיסה אוטומטית ושינוי גודל.',
      },
      serverless: {
        title: 'ארכיטקטורה ללא שרת',
        description:
          'בנוי על AWS Lambda עם API Gateway. שלם רק עבור מה שאתה משתמש עם סקאלינג אוטומטי.',
      },
      cicd: {
        title: 'צינור CI/CD',
        description: 'פריסות אוטומטיות עם GitHub Actions. בדוק, בנה, ופרוס בביטחון.',
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
        description: 'אינטגרציה עם AWS SES לאימיילים טרנזקציוניים. תבניות, תזמון ומעקב כלולים.',
      },
      mfa: {
        title: 'אימות דו-שלבי',
        description: 'MFA מבוסס TOTP עם קודי QR. קודי גיבוי SMS לאבטחה משופרת.',
      },
      monitoring: {
        title: 'ניטור ותצפית',
        description:
          'עקוב אחר ביצועים ושגיאות עם לוגים ומדדים מובנים. הישאר על גבי בריאות האפליקציה.',
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
      serverless: { name: 'AWS Serverless', description: 'מסגרת ללא שרת' },
      aws: { name: 'AWS', description: 'תשתית ענן' },
    },
    cta: {
      title: 'מוכן להתחיל',
      titleHighlight: 'לבנות?',
      description: 'הצטרף למפתחים ששולחים מהר יותר עם Elytra. חינם, קוד פתוח, ומוכן לייצור.',
      button: 'צור חשבון',
      docs: 'קרא תיעוד',
    },
  },
};

const pricingHe = {
  pricing: {
    title: 'תמחור',
    titleHighlight: 'פשוט ושקוף',
    subtitle: 'בחר את התוכנית המתאימה לך. כל התוכניות כוללות גישה לקוד המלא.',
    free: {
      name: 'חינם',
      price: '$0',
      period: 'לתמיד',
      description: 'מושלם לפרויקטים אישיים ולמידה',
      cta: 'התחל',
      badge: '',
      features: ['גישה מלאה לקוד', 'תמיכת קהילה', 'תיעוד בסיסי', 'פריסה לתשתית שלך'],
    },
    pro: {
      name: 'מקצועי',
      price: '$20',
      period: 'לחודש',
      description: 'למפתחים מקצועיים וצוותים קטנים',
      badge: 'הכי פופולרי',
      cta: 'התחל',
      features: [
        'כל מה שיש בחינם',
        'תמיכה עדיפה',
        'דוגמאות מתקדמות',
        'ערוץ Discord פרטי',
        'שעות פגישה חודשיות',
      ],
    },
    enterprise: {
      name: 'ארגוני',
      price: 'מותאם אישית',
      period: 'צור קשר',
      description: 'לארגונים עם צרכים ספציפיים',
      cta: 'צור קשר למכירות',
      badge: '',
      features: [
        'כל מה שיש במקצועי',
        'אינטגרציות מותאמות אישית',
        'תמיכה ייעודית',
        'ערבות SLA',
        'מפגשי הדרכה',
        'אפשרויות white-label',
      ],
    },
  },
};

const dashboardHe = {
  dashboard: {
    title: 'לוח בקרה',
    subtitle: 'ברוך הבא ללוח הבקרה שלך',
    menu: 'תפריט',
    stats: {
      totalUsers: 'סך המשתמשים',
      activeProjects: 'פרויקטים פעילים',
      successRate: 'אחוז הצלחה',
    },
  },
};
const notFoundHe = {
  notFound: { title: '404', message: 'אופס! הדף שאתה מחפש לא קיים.', backHome: 'חזור לדף הבית' },
};

const authHe = {
  auth: {
    login: {
      title: 'ברוכים השבים',
      description: 'התחבר עם חשבון Apple או Google',
      loginWithApple: 'התחבר עם Apple',
      loginWithGoogle: 'התחבר עם Google',
      orContinueWith: 'או המשך עם',
      email: 'אימייל',
      emailPlaceholder: 'm@example.com',
      password: 'סיסמה',
      forgotPassword: 'שכחת את הסיסמה?',
      submit: 'התחבר',
      noAccount: 'אין לך חשבון?',
      signUp: 'הירשם',
      agreeTo: 'על ידי לחיצה על המשך, אתה מסכים ל',
      termsOfService: 'תנאי השימוש',
      and: 'ו',
      privacyPolicy: 'מדיניות הפרטיות',
      feature1: 'בנה אפליקציות ללא שרת במהירות',
      feature2: 'אימות והעלאת קבצים מוכנים לייצור',
      feature3: 'מאובטח וקל להתאמה אישית',
    },
    signUp: {
      title: 'צור חשבון',
      description: 'הזן את האימייל שלך למטה כדי ליצור חשבון',
      fullName: 'שם מלא',
      namePlaceholder: 'ישראל ישראלי',
      email: 'אימייל',
      emailPlaceholder: 'm@example.com',
      password: 'סיסמה',
      confirmPassword: 'אשר סיסמה',
      passwordHint: 'חייבת להיות לפחות 8 תווים.',
      submit: 'צור חשבון',
      haveAccount: 'כבר יש לך חשבון?',
      signIn: 'התחבר',
      agreeTo: 'על ידי לחיצה על המשך, אתה מסכים ל',
      termsOfService: 'תנאי השימוש',
      and: 'ו',
      privacyPolicy: 'מדיניות הפרטיות',
    },
    forgotPassword: {
      title: 'איפוס סיסמה',
      description: 'הזן את האימייל שלך ונשלח לך קישור לאיפוס',
      email: 'אימייל',
      emailPlaceholder: 'm@example.com',
      submit: 'שלח קישור לאיפוס',
      rememberPassword: 'זוכר את הסיסמה שלך?',
      signIn: 'התחבר',
    },
    resetPassword: {
      title: 'צור סיסמה חדשה',
      description: 'הזן את הסיסמה החדשה שלך למטה',
      newPassword: 'סיסמה חדשה',
      confirmPassword: 'אשר סיסמה',
      passwordHint: 'חייבת להיות לפחות 8 תווים',
      submit: 'אפס סיסמה',
    },
    confirm: {
      title: 'אישור אימייל',
      checking: 'מאשר את כתובת האימייל שלך...',
      checkEmail: 'בדוק את האימייל שלך לקישור אישור',
      goToLogin: 'עבור להתחברות',
    },
  },
};

const legalHe = {
  legal: {
    privacy: {
      title: 'מדיניות פרטיות',
      lastUpdated: 'עודכן לאחרונה: 1 בפברואר 2026',
      section1: {
        title: '1. מידע שאנו אוספים',
        content:
          'אנו אוספים מידע שאתה מספק לנו ישירות, כולל כאשר אתה יוצר חשבון, משתמש בשירותים שלנו, או מתקשר איתנו. זה עשוי לכלול את שמך, כתובת האימייל שלך ומידע ליצירת קשר נוסף.',
      },
      section2: {
        title: '2. כיצד אנו משתמשים במידע שלך',
        content:
          'אנו משתמשים במידע שאנו אוספים כדי לספק, לתחזק ולשפר את השירותים שלנו, לתקשר איתך, ולהגן על המשתמשים והשירותים שלנו.',
      },
      section3: {
        title: '3. שיתוף מידע',
        content:
          'אנו לא מוכרים את המידע האישי שלך. אנו עשויים לשתף את המידע שלך עם ספקי שירות המסייעים לנו בהפעלת השירותים שלנו, בכפוף להסכמי סודיות.',
      },
      section4: {
        title: '4. אבטחת מידע',
        content:
          'אנו מיישמים אמצעי אבטחה טכניים וארגוניים מתאימים כדי להגן על המידע האישי שלך מפני גישה, שינוי, גילוי או השמדה לא מורשים.',
      },
      section5: {
        title: '5. הזכויות שלך',
        content:
          'יש לך את הזכות לגשת, לתקן או למחוק את המידע האישי שלך. אתה יכול גם להתנגד או להגביל עיבוד מסוים של הנתונים שלך.',
      },
      section6: {
        title: '6. צור קשר',
        content:
          'אם יש לך שאלות לגבי מדיניות פרטיות זו, אנא צור איתנו קשר בכתובת privacy@elytra.dev.',
      },
    },
    terms: {
      title: 'תנאי שימוש',
      lastUpdated: 'עודכן לאחרונה: 1 בפברואר 2026',
      section1: {
        title: '1. קבלת התנאים',
        content:
          'על ידי גישה ושימוש ב-Elytra, אתה מקבל ומסכים להיות כפוף לתנאים והוראות של הסכם זה.',
      },
      section2: {
        title: '2. רישיון שימוש',
        content:
          'ניתן רישיון להוריד זמנית עותק אחד של החומרים באתר Elytra לצפייה אישית ולא מסחרית בלבד.',
      },
      section3: {
        title: '3. כתב ויתור',
        content:
          "החומרים באתר Elytra מסופקים 'כמות שהם'. Elytra אינה נותנת אחריות כלשהי, מפורשת או משתמעת, ובזאת מוותרת על כל האחריות האחרות.",
      },
      section4: {
        title: '4. מגבלות',
        content:
          'בשום מקרה Elytra או ספקיה לא יהיו אחראים לכל נזק (כולל, ללא הגבלה, נזקים בגין אובדן נתונים או רווח, או עקב הפרעה לעסק) הנובעים מהשימוש או מחוסר היכולת להשתמש בחומרים באתר Elytra.',
      },
      section5: {
        title: '5. תיקונים',
        content:
          'החומרים המופיעים באתר Elytra עשויים לכלול שגיאות טכניות, טיפוגרפיות או צילום. Elytra אינה מבטיחה שאף אחד מהחומרים באתר שלה מדויקים, שלמים או עדכניים.',
      },
      section6: {
        title: '6. חוק ממשל',
        content:
          'תנאים אלה מוסדרים ומתפרשים בהתאם לחוקים ואתה מתחייב לסמכות השיפוט הבלעדית של בתי המשפט באותו מיקום.',
      },
    },
  },
};

const featuresPageHe = {
  featuresPage: {
    title: 'תכונות עוצמתיות',
    titleHighlight: 'לאפליקציות מודרניות',
    subtitle: 'כל מה שצריך לבניית אפליקציות ללא שרת מוכנות לייצור. ללא התקנה נדרשת.',
    comingSoon: 'תכונות נוספות בקרוב',
    comingSoonDesc:
      'אנחנו משפרים כל הזמן את Elytra עם תכונות, רכיבים ואינטגרציות חדשות. הצטרף לקהילה שלנו כדי להישאר מעודכן.',
  },
};

const profileHe = {
  profile: {
    title: 'פרופיל',
    subtitle: 'נהל את הגדרות החשבון שלך',
    avatar: {
      title: 'תמונת פרופיל',
      description: 'העלה תמונת פרופיל כדי להתאים אישית את החשבון שלך',
      upload: 'העלה תמונה',
      comingSoon: 'העלאת תמונה בקרוב עם הבקאנד',
    },
    info: {
      title: 'מידע על החשבון',
      name: 'שם',
      email: 'אימייל',
      userId: 'מזהה משתמש',
      notSet: 'לא הוגדר',
    },
  },
};

const footerHe = {
  footer: {
    product: 'מוצר',
    resources: 'משאבים',
    company: 'חברה',
    legal: 'משפטי',
    builtWith: 'נבנה עם',
    features: 'תכונות',
    pricing: 'תמחור',
    documentation: 'תיעוד',
    examples: 'דוגמאות',
    blog: 'בלוג',
    community: 'קהילה',
    about: 'אודות',
    contact: 'צור קשר',
    privacy: 'מדיניות פרטיות',
    terms: 'תנאי שימוש',
    github: 'GitHub',
    social: 'חברתי',
    githubAria: 'פתח את המאגר של Elytra ב-GitHub',
    linkedInAria: 'פתח את Elytra ב-LinkedIn',
    copyright: '© {{year}} {{name}}',
    madeWithLove: 'נבנה עם {{name}} באהבה',
  },
};

export const restHe: RestTranslations = {
  ...landingHe,
  ...pricingHe,
  ...dashboardHe,
  ...notFoundHe,
  ...authHe,
  ...legalHe,
  ...featuresPageHe,
  ...profileHe,
  ...footerHe,
};
