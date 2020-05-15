module.exports = {
  'root': true,
  'env': {
    'node': true,
    'browser': true
  },
  'plugins': ['@typescript-eslint'],
  'extends': [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  'rules': {
    'no-console': 'off',
    'no-debugger': 'off',
    'no-mixed-spaces-and-tabs': 'off'
  },
  'parserOptions': {
    'sourceType': 'module',
    'parser': '@typescript-eslint/parser'
  }
};
