module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    // Add custom rules here
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/', '.next/', '**/*.ico', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.eot'],
};