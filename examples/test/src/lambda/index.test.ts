import { createApp, HooksApplication } from '@midwayjs/hooks-testing-library';
import api, { get, getPath, mixedValue, post } from '.';

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
    expect(await app.runFunction(getPath)).toMatchInlineSnapshot(
      `"/api/getPath"`
    );
    expect(await app.runFunction(post, 'Jake')).toMatchInlineSnapshot(`
      Object {
        "method": "POST",
        "name": "Jake",
      }
    `);
  });

  it('request', async () => {
    const response = await app.request(get).expect(200);
    expect(response.text).toMatchInlineSnapshot(`"GET"`);

    const postResponse = await app.request(post, 'lxxyx').expect(200);
    expect(postResponse.body).toMatchInlineSnapshot(`
      Object {
        "method": "POST",
        "name": "lxxyx",
      }
    `);
  });

  it('mixed value', async () => {
    const response = await app.runFunction(mixedValue);
    expect(response).toMatchInlineSnapshot(`
      Object {
        "array": Array [
          1,
        ],
        "boolean": true,
        "date": 2021-02-21T00:00:00.000Z,
        "error": [Error: from api],
        "map": Map {
          "key" => "value",
        },
        "null": null,
        "number": 1,
        "object": Object {
          "a": 1,
        },
        "regexp": /regexp/,
        "set": Set {
          1,
          2,
          3,
        },
        "string": "",
        "undefined": undefined,
      }
    `);
  });
});
