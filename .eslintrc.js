module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // Integrate Prettier
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module', // Use ES modules
  },
  rules: {
    // Add any specific rules or overrides here
  },
};
