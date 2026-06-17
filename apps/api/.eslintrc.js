module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-underscore-dangle': 'off',
    camelcase: 'off',
  },
  overrides: [
    {
      files: ['tests/**/*.js', '**/*.test.js'],
      env: { jest: true },
      rules: {
        'no-restricted-syntax': 'off',
        'no-await-in-loop': 'off',
      },
    },
  ],
};
