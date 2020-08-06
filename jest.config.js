module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', 'fixtures/*', 'util.ts', 'dist/*', 'compiler.ts', '/temp_packages/'],
  globals: {
    'ts-jest': {
      isolatedModules: false,
    },
  },
  testTimeout: 10000,
}
