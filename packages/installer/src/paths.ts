export const paths = {
  fYml() {
    return 'f.yml'
  },
  api() {
    return 'src/apis'
  },
  source() {
    return 'src'
  },
  configuration() {
    return 'src/apis/configuration.ts'
  },
  config() {
    return {
      directory() {
        return 'src/apis/config'
      },
      default() {
        return 'src/apis/config/config.default.ts'
      },
    }
  },
  packageJson() {
    return 'package.json'
  },
}
