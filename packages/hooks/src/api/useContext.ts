import { FaaSContext } from '@midwayjs/faas'
import semver from 'semver'

export let useContext: () => FaaSContext

// HOOKS_RUNTIME = 'async_hooks' || node version < 12.17.0
if (process.env.HOOKS_RUNTIME !== 'async_hooks' || semver.lt(process.version, '12.17.0')) {
  useContext = require('./compiler/useContextImpl').useContext
} else {
  useContext = require('./async_hooks/useContextImpl').useContext
}
