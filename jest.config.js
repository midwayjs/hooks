module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/fixtures/', 'util.ts', 'compiler.ts'],
  testTimeout: 120 * 1000,
  forceExit: true,
  coveragePathIgnorePatterns: ['/node_modules/', '.faas_debug_tmp', '__tests__'],
  snapshotSerializers: ['jest-serializer-path', 'jest-snapshot-serializer-raw'],
}
