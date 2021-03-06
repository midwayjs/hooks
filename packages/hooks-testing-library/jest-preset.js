const path = require('path')
const { getConfig, getProjectRoot } = require('@midwayjs/hooks-core')
const { pathsToModuleNameMapper } = require('ts-jest/utils')

const config = getConfig()
const root = getProjectRoot()

const { compilerOptions } = require(path.join(root, 'tsconfig.json'))

const moduleNameMapper = {
  '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
    path.resolve(__dirname, './jest-preset/file-mock.js'),
}

if (compilerOptions.paths) {
  Object.assign(
    moduleNameMapper,
    pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' })
  )
}

/** @type {import('@jest/types').Config.InitialOptions} */
const common = {
  preset: 'ts-jest',
  clearMocks: true,
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(ts|tsx)$'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  modulePathIgnorePatterns: ['<rootDir>/run'],
  moduleNameMapper,
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}

module.exports = {
  preset: 'ts-jest',
  projects: [
    {
      ...common,
      maxWorkers: 1,
      name: 'server',
      displayName: {
        name: 'SERVER',
        color: 'magenta',
      },
      // ignore /src/apis/config/config.test.ts
      testPathIgnorePatterns: [
        '/node_modules/',
        '/config/config.test.ts',
        '<rootDir>/build',
        '<rootDir>/.serverless',
      ],
      testEnvironment: path.resolve(__dirname, './jest-preset/environment.js'),
      setupFilesAfterEnv: [
        path.resolve(__dirname, './jest-preset/setup-after-env.js'),
      ],
    },
  ],
}
