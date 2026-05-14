import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  { languageOptions: { globals: { ...globals.node } } },
  {
    files: ['src/__tests__/**'],
    languageOptions: {
      globals: {
        ...globals.node,
        vi: 'readonly', describe: 'readonly', it: 'readonly',
        test: 'readonly', expect: 'readonly',
      },
    },
  },
];
