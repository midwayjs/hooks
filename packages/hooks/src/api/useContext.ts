import type { FaaSContext } from '@midwayjs/faas'

export let useContext: () => FaaSContext

// define at https://github.com/midwayjs/cli/blob/9347496213c9451cdc3cb3423ee81b7bd494c521/packages/serverless-spec-builder/hooks_runtime.ejs#L12
if (process.env.HOOKS_RUNTIME === 'async_hooks') {
  useContext = require('./async_hooks/useContextImpl').useContext
} else {
  useContext = require('./compiler/useContextImpl').useContext
}
