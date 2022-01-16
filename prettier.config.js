module.exports = {
  semi: false,
  singleQuote: true,
  overrides: [
    {
      files: '*.md',
      options: {
        semi: true,
      },
    },
    {
      files: 'docs/**/*.md',
      options: {
        semi: true,
        printWidth: 40,
      },
    },
    {
      files: 'docs/test.md',
      options: {
        printWidth: 60,
      },
    },
    {
      files: 'README*.md',
      options: {
        printWidth: 75,
      },
    },
    {
      files: 'examples/**/*',
      options: {
        semi: true,
      },
    },
  ],
}
