import { createApp } from '@midwayjs/hooks-testing-library';
import api from './index';

// TODO fix windows ci error: https://github.com/midwayjs/hooks/pull/66/checks?check_run_id=2109485619
const t = process.platform === 'win32' ? test.skip : test;

t('middleware', async () => {
  const app = await createApp();

  const response = await app.request(api).expect(200);
  // Set by middleware
  expect(response.headers.global).toBeTruthy();
  expect(response.headers.file).toBeTruthy();
  expect(response.headers.api).toBeTruthy();

  await app.close();
});
