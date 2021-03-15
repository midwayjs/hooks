import { createApp } from '@midwayjs/hooks-testing-library'
import api from './index'

test('middleware', async () => {
  const app = await createApp()

  const response = await app.request(api).expect(200)
  // Set by middleware
  expect(response.headers.global).toBeTruthy()
  expect(response.headers.file).toBeTruthy()
  expect(response.headers.api).toBeTruthy()

  await app.close()
})
