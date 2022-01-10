const path = require('path')

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  coveragePathIgnorePatterns: [
    'node_modules',
    'examples',
    'fixtures',
    '__tests__',
  ],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '^test.ts$'],
  snapshotSerializers: ['jest-serializer-path', 'jest-snapshot-serializer-raw'],
  testTimeout: 1000 * 30,
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}
