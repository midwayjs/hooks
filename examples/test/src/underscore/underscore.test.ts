import { createApp, HooksApplication } from '@midwayjs/hooks-testing-library';
import { api } from './index';

let app: HooksApplication;
beforeAll(async () => {
  app = await createApp();
});

afterAll(async () => {
  await app.close();
});

it('url should get underscore', async () => {
  const { path } = await app.runFunction(api);
  return expect(path).toEqual('/underscore/_api');
});
