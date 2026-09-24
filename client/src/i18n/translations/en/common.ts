export const common = {
  app: { name: '{{appName}}' },
  aria: { toggleTheme: 'Toggle theme' },
  theme: { light: 'Light', dark: 'Dark', system: 'System' },
  nav: {
    signIn: 'Sign In',
    getStarted: 'Get Started',
    dashboard: 'Dashboard',
    features: 'Features',
    pricing: 'Pricing',
    selectLanguage: 'Select language',
    homeAria: '{{appName}} - Go to home',
    myAccount: 'My account',
    logOut: 'Log out',
    guest: 'Guest',
  },
  imageUpload: {
    choose: 'Choose image',
    change: 'Change image',
    remove: 'Remove image',

    dragHint: 'Or drag and drop a file here',
    previewAlt: 'Selected image preview',
  },
  upload: {
    errors: {
      tooLarge: 'The file is too large. The maximum size is {{maxMb}} MB.',
      invalidType: 'This file type is not supported. Allowed types: {{types}}.',
      uploadFailed: 'The upload failed. Please try again.',
    },
  },
};
