export const landing = {
  hero: {
    badge: 'Open Source Full-Stack Template',
    title: 'Build Serverless Apps',
    titleHighlight: 'Lightning Fast',
    description:
      'A production-ready full-stack serverless template with authentication, file uploads, and modern UI components. Start building your next project in minutes, not weeks.',
    cta: 'Try It Now',
    viewGithub: 'View on GitHub',
    exploreLabel: 'Explore',
  },
  nav: {
    benefits: 'Benefits',
    features: 'Features',
    tech: 'Tech Stack',
    pricing: 'Pricing',
  },
  benefits: {
    title: 'Why Choose {{appName}}',
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
    darkMode: {
      title: 'Dark & Light Mode',
      description: "Follows the system theme or the user's own choice",
    },
    accessible: {
      title: 'Accessible',
      description: 'Every page is checked by automated accessibility tests',
    },
    typeSafe: {
      title: 'Type-Safe End to End',
      description: "The client is built on the API's own TypeScript types",
    },
    secure: {
      title: 'Secure by Default',
      description: 'Private buckets, rate limiting and security headers out of the box',
    },
    payPerUse: {
      title: 'Pay Per Use',
      description: 'No servers sitting idle: costs follow your traffic',
    },
    onePush: {
      title: 'One Push to Deploy',
      description: 'Push a branch and its environment updates itself',
    },
    yourData: {
      title: 'Data Export & Deletion',
      description: 'Users can download their data or delete their account',
    },
    documented: {
      title: 'Well Documented',
      description: 'Guides, an OpenAPI spec and an architecture diagram',
    },
    openSource: {
      title: 'Open Source',
      description: 'MIT licensed: fork it and make it yours',
    },
  },
  features: {
    title: 'Everything You Need to Build',
    titleHighlight: 'Fast',
    subtitle: 'Production-ready features out of the box',
    auth: {
      title: 'Authentication Ready',
      description:
        'AWS Cognito sign-up with email verification, login and password reset. Private API routes are protected with JWT.',
    },
    s3: {
      title: 'File Uploads',
      description:
        'Profile photos upload through the API to a private S3 bucket and are served from your own domain through CloudFront.',
    },
    serverless: {
      title: 'Serverless Architecture',
      description:
        'Built on AWS Lambda with API Gateway. Pay only for what you use with automatic scaling.',
    },
    database: {
      title: 'Your Database',
      description:
        'PostgreSQL or MySQL through Sequelize, or MongoDB through Mongoose, picked automatically from your connection string.',
    },
    infra: {
      title: 'Infrastructure as Code',
      description:
        'The whole stack is AWS CDK in TypeScript, checked by cdk-nag and drawn as an Infrastructure Composer diagram.',
    },
    cdn: {
      title: 'Custom Domain & CDN',
      description:
        'CloudFront on your own domain, with the HTTPS certificate and DNS records created for you.',
    },
    cicd: {
      title: 'CI/CD Pipeline',
      description:
        'GitHub Actions deploy dev, qa and prod from their branches, with lint, build and tests on every pull request.',
    },
    testing: {
      title: 'Automated Testing',
      description:
        'Playwright end-to-end tests, Postman API tests and infrastructure tests, locally and in CI.',
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
        'AWS SES with DKIM on your domain for verification codes and emails sent by the app.',
    },
    monitoring: {
      title: 'Logs & Error Handling',
      description:
        'Every request is logged to CloudWatch with 30-day retention, and errors come back in one consistent format.',
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
    cdk: { name: 'AWS CDK', description: 'Infrastructure as code' },
    aws: { name: 'AWS', description: 'Cloud infrastructure' },
  },
  cta: {
    title: 'Ready to Start',
    titleHighlight: 'Building?',
    description:
      'Join developers who are shipping faster with {{appName}}. Free, open source, and ready for production.',
    button: 'Create Account',
    docs: 'Read Documentation',
  },
};
