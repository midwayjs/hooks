import { createConfiguration, hooks } from '@midwayjs/hooks';
import * as FaaS from '@midwayjs/faas';

/**
 * setup midway server
 */
export default createConfiguration({
  imports: [FaaS, hooks()],
  importConfigs: [{ default: { keys: 'session_keys' } }],
});
