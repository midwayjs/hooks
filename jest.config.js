const path = require('path')

/** @typedef {import('ts-jest/dist/types')} */
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: path.resolve(
    __dirname,
    './packages/hooks-testing-library/jest-preset/environment.js'
  ),
  testPathIgnorePatterns: [
    '/node_modules/',
    '/fixtures/',
    'util.ts',
    'compiler.ts',
  ],
  testRegex: ['(/__tests__/.*|(\\.|/)(test|spec))\\.[t]sx?$'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '.faas_debug_tmp',
    '__tests__',
    'examples',
  ],
  snapshotSerializers: ['jest-serializer-path', 'jest-snapshot-serializer-raw'],
}
