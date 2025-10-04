// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('typescript-eslint').Config} */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // 型情報が必要なルールの設定 (tsconfig.jsonのパスを指定)
  {
    files: ['src/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  prettierConfig,
  {
    ignores: ['dist/', 'node_modules/'],
  }
);
