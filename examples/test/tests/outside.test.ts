import { createApp, HooksApplication } from '@midwayjs/hooks-testing-library';
import api from '../src/lambda/index';

describe('test new features', () => {
  let app: HooksApplication;
  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('runFunction', async () => {
    expect(await app.runFunction(api)).toMatchInlineSnapshot(`"Hello World"`);
  });
});
