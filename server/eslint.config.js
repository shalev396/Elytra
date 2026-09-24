import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    files: ['**/*.{ts,js}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      parserOptions: {
        // src/ is checked by tsconfig.json; infra/ and scripts/ by infra/tsconfig.json.
        project: ['./tsconfig.json', './infra/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'no-debugger': 'error',
    },
  },
  {
    // CDK constructs are instantiated for their side effects (new CfnOutput(...)).
    files: ['infra/**/*.ts'],
    rules: {
      'no-new': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    // node:test describe/it return promises the runner tracks itself.
    files: ['infra/test/**/*.ts', 'src/**/*.test.ts'],
    rules: { '@typescript-eslint/no-floating-promises': 'off' },
  },
  {
    ignores: [
      'node_modules/**',
      'cdk.out/**',
      '.build/**',
      'infra/functions/**',
      'infra/composer/**',
      'infra/fixtures/**',
      'eslint.config.js',
    ],
  },
);
