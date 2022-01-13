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
      files: 'examples/**/*',
      options: {
        semi: true,
      },
    },
  ],
}
