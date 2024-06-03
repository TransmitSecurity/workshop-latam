import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
//import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      //'simple-import-sort': simpleImportSort,
      unicorn: eslintPluginUnicorn,
      prettier: eslintPluginPrettier,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js'],
          moduleDirectory: ['node_modules', 'src/', 'backend/'],
        },
      },
    },
    ignores: ['**/*.html'],
    rules: {
      // base
      indent: ['error', 2, { SwitchCase: 1 }],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      // end

      // prettier
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      'prettier/prettier': [
        'error',
        {
          printWidth: 120,
          tabWidth: 2,
          useTabs: false,
          semi: true,
          singleQuote: true,
          jsxSingleQuote: true,
          trailingComma: 'all',
          bracketSpacing: true,
          bracketSameLine: true,
          arrowParens: 'always',
        },
      ],
      // end prettier

      // simple-import-sort
      //"simple-import-sort/imports": "error",
      //"simple-import-sort/exports": "error"
      // end simple-import-sort
    },
  },
];
