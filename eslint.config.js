import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: { ecmaVersion: 2020, globals: { ...globals.browser }, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z][A-Za-z0-9]*$', argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['server/**/*.js', 'scripts/**/*.js'],
    languageOptions: { ecmaVersion: 2020, globals: { ...globals.node }, parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z][A-Za-z0-9]*$', argsIgnorePattern: '^_' }],
    },
  },
];
