module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:jsdoc/recommended-typescript',
    'plugin:react-hooks/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './packages/*/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'jsdoc', 'react-hooks', 'import'],
  settings: {
    'import/resolver': { typescript: { project: ['packages/*/tsconfig.json'] } },
    react: { version: '18.2' },
  },
  rules: {
    'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
    'jsdoc/require-jsdoc': ['error', {
      contexts: ['TSClassDeclaration', 'TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSEnumDeclaration', 'FunctionDeclaration', 'ArrowFunctionExpression', 'FunctionExpression', 'MethodDefinition', 'PropertyDefinition'],
      exemptEmpty: false
    }],
    'jsdoc/require-param': 'error',
    'jsdoc/require-returns': 'error',
    'jsdoc/require-description': 'error',
    'jsdoc/check-param-names': 'error',
    'jsdoc/check-property-names': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-magic-numbers': ['error', { ignore: [-1, 0, 1, 2, 3, 4, 5, 10, 100, 1000], ignoreEnums: true, ignoreTypeScriptTuple: true }],
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'interface', format: ['PascalCase'], custom: { regex: '^I[A-Z]', match: true } },
      { selector: 'typeAlias', format: ['PascalCase'] },
      { selector: 'enum', format: ['PascalCase'] },
      { selector: 'enumMember', format: ['UPPER_SNAKE_CASE'] },
      { selector: 'variable', format: ['camelCase', 'UPPER_SNAKE_CASE'] },
      { selector: 'function', format: ['camelCase'] },
      { selector: 'parameter', format: ['camelCase'] },
      { selector: 'property', format: ['camelCase', 'UPPER_SNAKE_CASE'] },
      { selector: 'class', format: ['PascalCase'] },
    ],
    'import/order': ['error', { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'], 'newlines-between': 'always', alphabetize: { order: 'asc' } }],
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
  },
  overrides: [
    { files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'], rules: { 'max-lines': 'off', 'max-lines-per-function': 'off', '@typescript-eslint/no-explicit-any': 'off', 'jsdoc/require-jsdoc': 'off' } },
    { files: ['**/*.d.ts'], rules: { 'jsdoc/require-jsdoc': 'off' } }
  ],
};
