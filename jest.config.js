module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules/',
    'fixtures/*',
    'util.ts',
    'dist/*',
    'lib/*',
    'compiler.ts',
    '/temp_packages/',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: false,
    },
  },
  testTimeout: 30000,
  forceExit: true,
  snapshotSerializers: ['jest-snapshot-serializer-raw'],
}
