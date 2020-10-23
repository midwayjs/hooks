import { sync } from 'globby'
import { resolve } from 'path'

const transformers = sync(resolve(__dirname, 'plugin')).map((plugin) => ({
  name: require.resolve(plugin),
}))

export const hintConfig = {
  features: {
    tsc: {
      transformers,
    },
  },
}
