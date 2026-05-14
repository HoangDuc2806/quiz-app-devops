import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': 'warn',
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
