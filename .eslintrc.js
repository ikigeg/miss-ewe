module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
  ],
  plugins: ['react-hooks', 'prettier'],
  parser: 'babel-eslint',
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    es2017: true,
    browser: true,
    node: true,
  },
  rules: {
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 0,
    'prettier/prettier': 'error',
  },
  globals: {
    MISS_EWE_PRIVATE_KEY_1: 'readonly',
    MISS_EWE_PRIVATE_KEY_2: 'readonly',
    MISS_EWE_PRIVATE_KEY_3: 'readonly',
    MISS_EWE_GITHUB_CLIENT_SECRET: 'readonly',
    MISS_EWE_GITHUB_CLIENT_ID: 'readonly',
    MISS_EWE_GITHUB_APP_ID: 'readonly',
  },
};
