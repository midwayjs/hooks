import { FileRouter, ProjectConfig } from '../../'
import {
  createApiClientMatcher,
  K_MATCHER_CALLBACK,
  useApiClientMatcher,
  buildApiClient,
} from '../builder'

describe('api client builder', () => {
  test('create ApiClientMatcher', () => {
    const matcher = createApiClientMatcher()
    expect(matcher).toBeTruthy()
  })

  const testMeta = {
    file: '/index.test',
    functionName: 'test',
    functionId: 'test',
    route: {
      baseDir: '/',
      basePath: '/api',
    },
  }

  test('create ApiClientMatcher with route', () => {
    const matcher = createApiClientMatcher().route(
      {
        basePath: '/api',
      },
      {
        client: 'http-request',
        metadata: {
          url: '/api/test',
        },
      }
    )

    expect(matcher[K_MATCHER_CALLBACK].length).toBe(1)

    const callback = matcher[K_MATCHER_CALLBACK][0]
    expect(callback(testMeta)).toMatchSnapshot()
  })

  test('create ApiClientMatcher with match', () => {
    const matcher = createApiClientMatcher().match((meta) => {
      if (meta.functionName === 'test') {
        return {
          client: 'http-request',
          metadata: {
            url: '/api/functionName',
            method: 'get',
          },
        }
      }
    })

    expect(matcher[K_MATCHER_CALLBACK].length).toBe(1)

    const callback = matcher[K_MATCHER_CALLBACK][0]
    expect(callback(testMeta)).toMatchSnapshot()
  })

  test('use ApiClientMatcher to build api client', async () => {
    const matcher = createApiClientMatcher().route(
      {
        basePath: '/api',
      },
      {
        client: 'http-request',
        metadata: {
          url: '/api/test',
        },
      }
    )

    useApiClientMatcher(matcher)

    const projectConfig: ProjectConfig = {
      source: '/',
      routes: [{ baseDir: 'src', basePath: '/api' }],
    }

    const router = new FileRouter({
      root: '/',
      projectConfig,
      useSourceFile: true,
    })

    const apiClient = await buildApiClient(
      '/src/index.ts',
      `export default () => {}`,
      router,
      false
    )

    expect(apiClient).toMatchSnapshot()
  })

  test('use ApiClientMatcher with multi matcher', async () => {
    const projectConfig: ProjectConfig = {
      source: '/',
      routes: [
        { baseDir: 'src', basePath: '/about' },
        { baseDir: 'event', event: 'wechat-miniprogram' },
      ],
    }

    const router = new FileRouter({
      root: '/',
      projectConfig,
      useSourceFile: true,
    })

    const http = createApiClientMatcher().route(
      {
        basePath: '/about',
      },
      {
        client: 'http-request',
        metadata: {
          url: '/about',
        },
      }
    )

    const event = createApiClientMatcher().route(
      {
        event: 'wechat-miniprogram',
      },
      {
        client: 'hooks-miniprogram-client',
      }
    )

    useApiClientMatcher(http)
    useApiClientMatcher(event)

    const httpClient = await buildApiClient(
      '/src/index.ts',
      `export default () => {}`,
      router,
      false
    )

    const eventClient = await buildApiClient(
      '/event/index.ts',
      'export const getOpenId = () => return 123456',
      router,
      false
    )

    expect(httpClient).toMatchSnapshot()
    expect(eventClient).toMatchSnapshot()
  })
})
