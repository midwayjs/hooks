import type { Config } from 'jest'

const config: Config = {
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  coveragePathIgnorePatterns: [
    'node_modules',
    'examples',
    'fixtures',
    '__tests__',
  ],
  snapshotSerializers: ['jest-serializer-path', 'jest-snapshot-serializer-raw'],
  testTimeout: 1000 * 60,
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}

export default config
