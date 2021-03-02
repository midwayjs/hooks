// Inspired from blitzjs
const path = require('path')
const { getConfig } = require('@midwayjs/hooks-core')

const config = getConfig()

const common = {
  preset: 'ts-jest',
  clearMocks: true,
  testPathIgnorePatterns: ['/node_modules/', '/.faas_debug_tmp/'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(ts|tsx)$'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'esbuild-jest',
      {
        sourcemap: true,
      },
    ],
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  modulePathIgnorePatterns: ['<rootDir>/.faas_debug_tmp', '<rootDir>/run'],
  moduleNameMapper: {
    // This ensures any path aliases in tsconfig also work in jest
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': path.resolve(
      __dirname,
      './jest-preset/file-mock.js'
    ),
  },
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
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
        `(/${config.source}/.*|(\\.|/)(test|spec))\\.[jt]sx?$`,
      ],
      setupFilesAfterEnv: [
        path.resolve(__dirname, './jest-preset/setup-after-env.js'),
      ],
    },
  ],
}
