import { createConfiguration, hooks } from '@midwayjs/hooks';
import * as Koa from '@midwayjs/koa';
import * as upload from '@midwayjs/upload';

/**
 * setup midway server
 */
export default createConfiguration({
  imports: [Koa, hooks(), upload],
  importConfigs: [{ default: { keys: 'session_keys' } }],
});
