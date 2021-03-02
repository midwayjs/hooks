/** @typedef {import('ts-jest/dist/types')} */
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 120 * 1000,
  forceExit: true,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/fixtures/',
    'util.ts',
    'compiler.ts',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '.faas_debug_tmp',
    '__tests__',
    'examples',
  ],
  snapshotSerializers: ['jest-serializer-path', 'jest-snapshot-serializer-raw'],
}
