module.exports = {
  sourceMap: 'inline',
  retainLines: true,
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: {
          node: '14',
        },
      },
    ],
  ],
}
