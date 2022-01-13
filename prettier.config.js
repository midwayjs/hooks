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
