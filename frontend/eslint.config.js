import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
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
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    files: ['src/test/**', '**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        vi: 'readonly', describe: 'readonly', it: 'readonly',
        test: 'readonly', expect: 'readonly', beforeEach: 'readonly',
      },
    },
  },
  { ignores: ['dist/', 'node_modules/'] },
];