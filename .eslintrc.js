module.exports = {
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
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
        paths: ['src'],
      },
    },
  },
  env: {
    jest: true,
  },
}
