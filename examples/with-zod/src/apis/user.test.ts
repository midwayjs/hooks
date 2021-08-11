import { createApp, HooksApplication } from '@midwayjs/hooks-testing-library';
import { login } from './user';

let app: HooksApplication;
beforeAll(async () => {
  app = await createApp();
});

afterAll(async () => {
  await app.close();
});

test('with zod validation', async () => {
  expect(await app.runFunction(login, {})).toMatchInlineSnapshot(`
    Object {
      "data": null,
      "message": "Invalid user",
      "success": false,
    }
  `);

  expect(
    await app.runFunction(login, {
      email: 'xxx@example.com',
      password: 'example',
    })
  ).toMatchInlineSnapshot(`
    Object {
      "data": "Login Success",
      "message": "Login Success",
      "success": true,
    }
  `);
});
