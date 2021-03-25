module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  plugins: ['prettier', '@typescript-eslint'],
  extends: [
    './node_modules/kcd-scripts/eslint.js',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'babel/new-cap': 'off',
    'prettier/prettier': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { vars: 'all', args: 'after-used', varsIgnorePattern: '^_' },
    ],
  },
  overrides: [
    {
      files: ['*.test.ts', '*.ts'],
      parser: '@typescript-eslint/parser',
    },
  ],

  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts'],
        paths: ['src'],
      },
    },
  },
  env: {
    node: true,
    jest: true,
  },
}
