import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'off',
    },
  },
  {
    files: ['src/test/**', '**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
        vi: 'readonly', describe: 'readonly', it: 'readonly',
        test: 'readonly', expect: 'readonly', beforeEach: 'readonly',
      },
    },
  },
  { ignores: ['dist/', 'node_modules/'] },
];