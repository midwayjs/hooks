import { createApp, HooksApplication } from '@midwayjs/hooks-testing-library';
import { tryInject, tryInjectLocal } from './ioc';

describe('test new features', () => {
  let app: HooksApplication;
  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get instance form ioc container', async () => {
    expect(await app.runFunction(tryInject)).toMatchInlineSnapshot(`
      Array [
        "Miao~",
        "Miao~",
        "Miao~",
      ]
    `);
  });

  it('should load ioc instance in lambda file', async () => {
    expect(await app.runFunction(tryInjectLocal)).toMatchInlineSnapshot(`
      Object {
        "find": Array [
          "Local",
        ],
        "findAll": Array [
          "Miao~",
          "Miao~",
          "Miao~",
        ],
      }
    `);
  });
});
