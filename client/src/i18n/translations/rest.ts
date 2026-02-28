/** Rest of namespaces: landing, pricing, dashboard, notFound, auth, legal, featuresPage, profile, footer */

/** Nested translation value: string, array of strings/objects, or nested object (for i18next) */
export type RestTranslationValue =
  | string
  | string[]
  | { [key: string]: RestTranslationValue }
  | { [key: string]: RestTranslationValue }[];

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
    subtitle: "Choose the plan that's right for you.",
    monthly: 'Monthly',
    yearly: 'Yearly',
    yearlyDiscount: 'Save 20%',
    free: {
      name: 'Free',
      price: '$0',
      priceYearly: '$0',
      period: 'forever',
      periodYearly: 'forever',
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
      priceYearly: '$16',
      period: 'per month',
      periodYearly: 'per month',
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
      priceYearly: 'Custom',
      period: 'contact us',
      periodYearly: 'contact us',
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
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'What is the right plan for me?',
          answer:
            'The Free plan is ideal for personal projects and learning. Pro adds priority support and advanced examples. Enterprise is for teams that need custom integrations and SLA guarantees.',
        },
        {
          question: 'Can I change plans later?',
          answer: 'Yes, you can upgrade or downgrade your plan at any time.',
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major payment methods.',
        },
        {
          question: 'Is there a free trial?',
          answer: 'The Free plan is free forever with no credit card required.',
        },
      ],
    },
    ctaSection: {
      title: 'Ready to get started?',
      description: 'Start building for free. No credit card required.',
      button: 'Get Started Free',
    },
  },
};

const dashboardEn = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Welcome to your dashboard',
    menu: 'Menu',
    loading: 'Loading dashboard...',
    error: 'Failed to load dashboard data.',
    welcome: 'Welcome',
    userId: 'User ID',
    message: 'Status',
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
    branded: {
      description: 'Your full-stack serverless platform',
      comingSoon: 'Coming soon',
      confirmEmailSent:
        "We've sent a confirmation link to your email address. Please click the link to verify your account.",
    },
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
      loading: 'Logging in...',
      error: 'Login failed. Please try again.',
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
      loading: 'Creating account...',
      error: 'Sign up failed. Please try again.',
      passwordMismatch: 'Passwords do not match.',
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
      sending: 'Sending...',
      error: 'Failed to send reset code. Please try again.',
      rememberPassword: 'Remember your password?',
      signIn: 'Sign in',
    },
    resetPassword: {
      title: 'Create new password',
      description: 'Enter your new password below',
      code: 'Verification Code',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      passwordHint: 'Must be at least 8 characters long',
      submit: 'Reset Password',
      resetting: 'Resetting...',
      error: 'Failed to reset password. Please try again.',
      passwordMismatch: 'Passwords do not match.',
    },
    confirm: {
      title: 'Email Confirmation',
      checking: 'Confirming your email address...',
      checkEmail: 'Check your email for a confirmation link',
      codeLabel: 'Verification Code',
      verify: 'Verify Email',
      verifying: 'Verifying...',
      error: 'Verification failed. Please try again.',
      goToLogin: 'Go to Login',
    },
  },
};

const legalEn = {
  legal: {
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: February 27, 2026',
      section1: {
        title: '1. Open-Source Template',
        content:
          'Elytra is a free, open-source template released under the MIT License. This privacy policy describes how instances of Elytra may handle data. As this is a template, developers who deploy their own instances are responsible for implementing their own privacy practices and policies.',
      },
      section2: {
        title: '2. Information Collection',
        content:
          'The Elytra template itself does not collect, store, or transmit any personal data. When deployed by a third party, the instance operator is solely responsible for any data collection, processing, and storage that occurs.',
      },
      section3: {
        title: '3. Third-Party Services',
        content:
          'The template integrates with third-party services such as AWS Cognito for authentication. Any data processed by these services is governed by their respective privacy policies. Developers deploying Elytra should review and disclose the third-party services they use.',
      },
      section4: {
        title: '4. Cookies and Local Storage',
        content:
          'The template may use browser local storage or cookies for functionality such as theme preferences and language settings. These are stored locally on your device and are not transmitted to any server.',
      },
      section5: {
        title: '5. No Warranty',
        content:
          'This privacy policy is provided as a template for informational purposes only and does not constitute legal advice. Developers using Elytra should consult a legal professional to draft a privacy policy appropriate for their specific use case and jurisdiction.',
      },
      section6: {
        title: '6. Contact',
        content:
          'For questions about the Elytra open-source project, visit the GitHub repository at {{repoUrl}} or contact the maintainer at {{privacyEmail}}.',
      },
    },
    terms: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated: February 27, 2026',
      section1: {
        title: '1. MIT License',
        content:
          'Elytra is released under the MIT License. You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software, subject to the conditions of the MIT License included in the project repository.',
      },
      section2: {
        title: '2. Free to Use',
        content:
          'This template is provided free of charge. You may use it for personal, commercial, or educational projects without restriction. Attribution is appreciated but not required beyond the license notice.',
      },
      section3: {
        title: '3. No Warranty',
        content:
          'The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement.',
      },
      section4: {
        title: '4. Limitation of Liability',
        content:
          'In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.',
      },
      section5: {
        title: '5. Contributions',
        content:
          'Contributions to Elytra are welcome and are subject to the same MIT License. By submitting a contribution, you agree that your work will be licensed under the same terms.',
      },
      section6: {
        title: '6. Template Disclaimer',
        content:
          'These terms apply to the Elytra template itself. If you deploy an application based on this template, you are responsible for providing your own terms of service appropriate for your product and jurisdiction.',
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
      lastLogin: 'Last Login',
      memberSince: 'Member Since',
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
    subtitle: 'בחר את התוכנית המתאימה לך.',
    monthly: 'חודשי',
    yearly: 'שנתי',
    yearlyDiscount: 'חסכו 20%',
    free: {
      name: 'חינם',
      price: '$0',
      priceYearly: '$0',
      period: 'לתמיד',
      periodYearly: 'לתמיד',
      description: 'מושלם לפרויקטים אישיים ולמידה',
      cta: 'התחל',
      badge: '',
      features: ['גישה מלאה לקוד', 'תמיכת קהילה', 'תיעוד בסיסי', 'פריסה לתשתית שלך'],
    },
    pro: {
      name: 'מקצועי',
      price: '$20',
      priceYearly: '$16',
      period: 'לחודש',
      periodYearly: 'לחודש',
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
      price: 'מותאם\nאישית',
      priceYearly: 'מותאם\nאישית',
      period: 'צור קשר',
      periodYearly: 'צור קשר',
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
    faq: {
      title: 'שאלות נפוצות',
      items: [
        {
          question: 'איזו תוכנית מתאימה לי?',
          answer:
            'התוכנית החינמית מתאימה לפרויקטים אישיים ולמידה. מקצועי מוסיף תמיכה עדיפה ודוגמאות מתקדמות. ארגוני מתאים לצוותים שצריכים אינטגרציות מותאמות וערבות SLA.',
        },
        {
          question: 'אפשר לשנות תוכנית אחר כך?',
          answer: 'כן, אפשר לשדרג או לשנמך את התוכנית בכל עת.',
        },
        {
          question: 'אילו אמצעי תשלום אתם מקבלים?',
          answer: 'אנו מקבלים את כל אמצעי התשלום הנפוצים.',
        },
        {
          question: 'האם יש תקופת ניסיון חינם?',
          answer: 'התוכנית החינמית היא חינמית לתמיד ללא צורך בכרטיס אשראי.',
        },
      ],
    },
    ctaSection: {
      title: 'מוכנים להתחיל?',
      description: 'התחילו לבנות בחינם. לא נדרש כרטיס אשראי.',
      button: 'התחלה חינמית',
    },
  },
};

const dashboardHe = {
  dashboard: {
    title: 'לוח בקרה',
    subtitle: 'ברוך הבא ללוח הבקרה שלך',
    menu: 'תפריט',
    loading: 'טוען לוח בקרה...',
    error: 'טעינת נתוני לוח הבקרה נכשלה.',
    welcome: 'ברוך הבא',
    userId: 'מזהה משתמש',
    message: 'סטטוס',
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
    branded: {
      description: 'הפלטפורמה שלך ללא שרת',
      comingSoon: 'בקרוב',
      confirmEmailSent: 'שלחנו קישור אישור לכתובת האימייל שלך. לחץ על הקישור כדי לאמת את חשבונך.',
    },
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
      loading: 'מתחבר...',
      error: 'ההתחברות נכשלה. נסה שוב.',
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
      loading: 'יוצר חשבון...',
      error: 'יצירת החשבון נכשלה. נסה שוב.',
      passwordMismatch: 'הסיסמאות אינן תואמות.',
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
      sending: 'שולח...',
      error: 'שליחת קוד האיפוס נכשלה. נסה שוב.',
      rememberPassword: 'זוכר את הסיסמה שלך?',
      signIn: 'התחבר',
    },
    resetPassword: {
      title: 'צור סיסמה חדשה',
      description: 'הזן את הסיסמה החדשה שלך למטה',
      code: 'קוד אימות',
      newPassword: 'סיסמה חדשה',
      confirmPassword: 'אשר סיסמה',
      passwordHint: 'חייבת להיות לפחות 8 תווים',
      submit: 'אפס סיסמה',
      resetting: 'מאפס...',
      error: 'איפוס הסיסמה נכשל. נסה שוב.',
      passwordMismatch: 'הסיסמאות אינן תואמות.',
    },
    confirm: {
      title: 'אישור אימייל',
      checking: 'מאשר את כתובת האימייל שלך...',
      checkEmail: 'בדוק את האימייל שלך לקישור אישור',
      codeLabel: 'קוד אימות',
      verify: 'אמת אימייל',
      verifying: 'מאמת...',
      error: 'האימות נכשל. נסה שוב.',
      goToLogin: 'עבור להתחברות',
    },
  },
};

const legalHe = {
  legal: {
    privacy: {
      title: 'מדיניות פרטיות',
      lastUpdated: 'עודכן לאחרונה: 27 בפברואר 2026',
      section1: {
        title: '1. תבנית קוד פתוח',
        content:
          'Elytra היא תבנית חינמית בקוד פתוח שפורסמה תחת רישיון MIT. מדיניות פרטיות זו מתארת כיצד מופעים של Elytra עשויים לטפל בנתונים. מכיוון שזו תבנית, מפתחים שמפעילים מופעים משלהם אחראים ליישום נהלי ומדיניות הפרטיות שלהם.',
      },
      section2: {
        title: '2. איסוף מידע',
        content:
          'תבנית Elytra עצמה אינה אוספת, מאחסנת או מעבירה נתונים אישיים כלשהם. כאשר היא מופעלת על ידי צד שלישי, מפעיל המופע אחראי באופן בלעדי לכל איסוף, עיבוד ואחסון נתונים שמתרחש.',
      },
      section3: {
        title: '3. שירותי צד שלישי',
        content:
          'התבנית משתלבת עם שירותי צד שלישי כמו AWS Cognito לאימות. כל נתון המעובד על ידי שירותים אלה כפוף למדיניות הפרטיות שלהם. מפתחים המפעילים את Elytra צריכים לבדוק ולחשוף את שירותי הצד השלישי שבהם הם משתמשים.',
      },
      section4: {
        title: '4. עוגיות ואחסון מקומי',
        content:
          'התבנית עשויה להשתמש באחסון מקומי בדפדפן או בעוגיות לצורך פונקציונליות כמו העדפות ערכת נושא והגדרות שפה. אלה מאוחסנים באופן מקומי במכשיר שלך ואינם מועברים לשום שרת.',
      },
      section5: {
        title: '5. ללא אחריות',
        content:
          'מדיניות פרטיות זו מסופקת כתבנית למטרות מידע בלבד ואינה מהווה ייעוץ משפטי. מפתחים המשתמשים ב-Elytra צריכים להתייעץ עם איש מקצוע משפטי כדי לנסח מדיניות פרטיות מתאימה למקרה השימוש ולתחום השיפוט שלהם.',
      },
      section6: {
        title: '6. יצירת קשר',
        content:
          'לשאלות לגבי פרויקט הקוד הפתוח Elytra, בקרו במאגר GitHub בכתובת {{repoUrl}} או צרו קשר עם המתחזק בכתובת {{privacyEmail}}.',
      },
    },
    terms: {
      title: 'תנאי שימוש',
      lastUpdated: 'עודכן לאחרונה: 27 בפברואר 2026',
      section1: {
        title: '1. רישיון MIT',
        content:
          'Elytra פורסמה תחת רישיון MIT. אתה רשאי להשתמש, להעתיק, לשנות, למזג, לפרסם, להפיץ, לתת רישיון משנה ו/או למכור עותקים של תוכנה זו, בכפוף לתנאי רישיון MIT הכלול במאגר הפרויקט.',
      },
      section2: {
        title: '2. חינמי לשימוש',
        content:
          'תבנית זו מסופקת ללא תשלום. אתה רשאי להשתמש בה לפרויקטים אישיים, מסחריים או חינוכיים ללא הגבלה. מתן קרדיט מוערך אך אינו נדרש מעבר להודעת הרישיון.',
      },
      section3: {
        title: '3. ללא אחריות',
        content:
          'התוכנה מסופקת "כמות שהיא", ללא אחריות מכל סוג שהוא, מפורשת או משתמעת, כולל אך לא מוגבל לאחריות של סחירות, התאמה למטרה מסוימת ואי-הפרה.',
      },
      section4: {
        title: '4. הגבלת אחריות',
        content:
          'בשום מקרה המחברים או בעלי זכויות היוצרים לא יהיו אחראים לכל תביעה, נזק או אחריות אחרת, בין אם בפעולת חוזה, עוולה או אחרת, הנובעת מהתוכנה או מהשימוש או עסקאות אחרות בתוכנה.',
      },
      section5: {
        title: '5. תרומות',
        content:
          'תרומות ל-Elytra מתקבלות בברכה וכפופות לאותו רישיון MIT. על ידי הגשת תרומה, אתה מסכים שהעבודה שלך תורשה תחת אותם תנאים.',
      },
      section6: {
        title: '6. הצהרת תבנית',
        content:
          'תנאים אלה חלים על תבנית Elytra עצמה. אם אתה מפעיל יישום המבוסס על תבנית זו, אתה אחראי לספק תנאי שימוש משלך המתאימים למוצר שלך ולתחום השיפוט שלך.',
      },
    },
  },
};

const featuresPageHe = {
  featuresPage: {
    title: 'תכונות עוצמתיות',
    titleHighlight: 'לאפליקציות מודרניות',
    subtitle: 'כל מה שצריך לבניית אפליקציות ללא שרת מוכנות לייצור. ללא התקנה נדרשת.',
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
      lastLogin: 'התחברות אחרונה',
      memberSince: 'חבר מאז',
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
