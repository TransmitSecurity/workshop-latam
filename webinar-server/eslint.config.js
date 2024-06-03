import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
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
        ...globals.node,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
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
    ignores: ['**/*.html', 'src/db/database.json'],
    rules: {
      // base
      indent: ['error', 2, { SwitchCase: 1 }],
      //"linebreak-style": ["error", "windows"],
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
          bracketSameLine: false,
          arrowParens: 'always',
          //endOfLine: "crlf"
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
