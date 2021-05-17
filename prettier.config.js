module.exports = {
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: false,
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: 'always',
  printWidth: 80,
  overrides: [
    {
      files: '*.md',
      options: {
        semi: true,
      },
    },
    {
      files: 'examples/**/*',
      options: {
        semi: true,
        importOrderSeparation: false,
      },
    },
  ],
  importOrder: ['^[w+]', '^[@]', '^[./]'],
  importOrderSeparation: true,
}
