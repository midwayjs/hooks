import {
  createFunctionApp,
  HooksApplication,
} from '@midwayjs/hooks-testing-library';
import api, { post } from './index';

describe('test new features', () => {
  let app: HooksApplication;
  beforeAll(async () => {
    app = await createFunctionApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('runFunction', async () => {
    expect(await app.runFunction(api)).toMatchInlineSnapshot(`
      Object {
        "message": "Hello World",
        "method": "GET",
      }
    `);
    expect(await app.runFunction(post, 'Jake')).toMatchInlineSnapshot(`
      Object {
        "message": "Your message: Jake",
        "method": "POST",
      }
    `);
  });

  it('request', async () => {
    const response = await app.request(post, 'Jake').expect(200);
    expect(response.body).toMatchInlineSnapshot(`
      Object {
        "message": "Your message: Jake",
        "method": "POST",
      }
    `);
  });
});
