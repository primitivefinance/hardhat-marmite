module.exports = {
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'import/extensions': ['error', 'never'],
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['./src'],
        extensions: ['.ts'],
      },
    },
  },
};
