import { FaaSContext } from '@midwayjs/faas'

export let useContext: () => FaaSContext

// HOOKS_RUNTIME = 'async_hooks' || node version < 12.17.0
if (process.env.HOOKS_RUNTIME === 'async_hooks') {
  useContext = require('./async_hooks/useContextImpl').useContext
} else {
  useContext = require('./compiler/useContextImpl').useContext
}
