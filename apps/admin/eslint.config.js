// ESLint for the admin SPA (P1.1 bootstrap).
// Focus: React Rules-of-Hooks enforcement — the violation class that crashed
// the Products editor (audit finding U-1). The wider recommended presets
// (unused-vars etc.) are deliberately deferred to Phase 4 so this security
// fix-pack stays atomic; this config enforces exactly its declared gate.
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { 'react-hooks': reactHooks, '@typescript-eslint': tseslint.plugin },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
);
