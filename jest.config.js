const path = require('path')

/** @type {import('@swc-node/core').Options} */
const swcJestOptions = {
  experimentalDecorators: true,
  esModuleInterop: true,
  sourcemap: 'inline',
}

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc-node/jest',
      // https://github.com/Brooooooklyn/swc-node/blob/master/packages/core/index.ts#L13
      swcJestOptions,
    ],
  },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  coveragePathIgnorePatterns: [
    'node_modules',
    'examples',
    'fixtures',
    '__tests__',
  ],
  snapshotSerializers: ['jest-serializer-path', 'jest-snapshot-serializer-raw'],
  testTimeout: 1000 * 30,
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}
