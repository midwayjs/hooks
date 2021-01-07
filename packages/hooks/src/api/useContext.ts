import { FaaSContext } from '@midwayjs/faas'

export let useContext: () => FaaSContext

if ((process.env.HOOKS_RUNTIME = 'async_hooks')) {
  useContext = require('./async_hooks/useContextImpl').useContext
} else {
  useContext = require('./compiler/useContextImpl').useContext
}
