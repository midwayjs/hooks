const path = require('path')

/** @typedef {import('ts-jest/dist/types')} */
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'esbuild-jest',
      {
        sourcemap: true,
      },
    ],
  },
  testEnvironment: path.resolve(
    __dirname,
    './packages/hooks-testing-library/jest-preset/environment.js'
  ),
  testPathIgnorePatterns: [
    'node_modules',
    'fixtures',
    'util.ts',
    'compiler.ts',
    '.serverless',
    'dist',
  ],
  coveragePathIgnorePatterns: [
    'node_modules',
    '.faas_debug_tmp',
    '.serverless',
    '__tests__',
    'examples',
  ],
  snapshotSerializers: ['jest-serializer-path', 'jest-snapshot-serializer-raw'],
  testTimeout: 1000 * 30,
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}
