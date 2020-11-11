module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/fixtures/', 'util.ts', 'compiler.ts'],
  testTimeout: 30000,
  forceExit: true,
  snapshotSerializers: ['jest-serializer-path', 'jest-snapshot-serializer-raw'],
}
