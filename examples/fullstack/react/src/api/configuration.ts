import { createConfiguration, hooks } from '@midwayjs/hooks';
import * as Koa from '@midwayjs/koa';

/**
 * setup midway server
 */
export default createConfiguration({
  imports: [Koa, hooks()],
  importConfigs: [{ default: { keys: 'session_keys' } }],
});
