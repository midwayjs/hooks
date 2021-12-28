import { createConfiguration, hooks } from '@midwayjs/hooks';
import * as Koa from '@midwayjs/koa';
import { MidwayConfig } from '@midwayjs/core';

/**
 * setup midway server
 */
export default createConfiguration({
  imports: [Koa, hooks()],
  importConfigs: [
    {
      default: {
        keys: 'session_keys',
        koa: {
          port: 7001,
        },
      } as MidwayConfig,
    },
  ],
});
