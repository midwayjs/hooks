const path = require('path')

const common = {
  preset: 'ts-jest',
  clearMocks: true,
  testPathIgnorePatterns: ['/node_modules/', '/.faas_debug_tmp/'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(ts|tsx)$'],
  transform: {
    '^.+\\.(ts|tsx)$': 'esbuild-jest',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  modulePathIgnorePatterns: ['<rootDir>/.faas_debug_tmp', '<rootDir>/run'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  coverageDirectory: '.coverage',
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = {
  preset: 'ts-jest',
  // maxWorkers: 1,
  projects: [
    {
      ...common,
      name: 'server',
      displayName: {
        name: 'SERVER',
        color: 'magenta',
      },
      testEnvironment: 'node',
      testRegex: [
        '\\.server\\.(spec|test)\\.(j|t)sx?$',
        '[\\/](apis)[\\/].*\\.(test|spec)\\.(j|t)sx?$',
      ],
      // setupFilesAfterEnv: [
      //   "<rootDir>/test/setup.ts",
      // ],
    },
  ],
}
