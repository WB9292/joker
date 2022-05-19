module.exports = {
  root: true,
  <%_ if(options.ts) { _%>
  parser: '@typescript-eslint/parser',
  <%_ } _%>
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    amd: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  <%_ if(options.ts) { _%>'plugin:@typescript-eslint/recommended',<%_ } _%>
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended' // Make sure this is always the last element in the array.
  ],
  plugins: ['prettier', 'import'<%_ if(options.ts) { _%>, '@typescript-eslint'<%_ } _%>],
  rules: {
    // Stylistic Issues
    'no-multiple-empty-lines': 'error',

    // Possible Errors
    'no-debugger': 'off',

    // Prettier
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],

    // React
    'react/react-in-jsx-scope': 'off',
    'jsx-a11y/accessible-emoji': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton']
      }
    ],
    'jsx-a11y/no-autofocus': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/media-has-caption': 'off',
      <%_ if(options.ts) { _%>
    // Typescript
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
      <%_ } _%>
    // Import
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/order': ['error', { 'newlines-between': 'always' }]
  }
}
