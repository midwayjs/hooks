import { ContextManager, useContext } from '@midwayjs/hooks-core'
import { useConfig, useInject, useLogger, usePlugin } from '../hooks'

const mockContext = {
  logger: jest.fn(),
  app: {
    mysql: jest.fn(),
  },
  cors: jest.fn(),
  requestContext: {
    getAsync: jest.fn(),
    get() {
      return {
        getConfiguration(key: string) {
          return key
        },
      }
    },
  },
}

test('test hooks runtime', async () => {
  await ContextManager.run({ ctx: mockContext }, async () => {
    expect(useContext()).toStrictEqual(mockContext)

    const logger = useLogger()
    logger()
    expect(mockContext.logger).toHaveBeenCalledTimes(1)

    const mysql = usePlugin('mysql')
    mysql()
    expect(mockContext.app.mysql).toHaveBeenCalledTimes(1)

    const cors = usePlugin('cors')
    cors()
    expect(mockContext.cors).toHaveBeenCalledTimes(1)

    await useInject('testService')
    expect(mockContext.requestContext.getAsync).toHaveBeenCalledTimes(1)

    const config = useConfig('test')
    expect(config).toStrictEqual('test')
  })
})

const cases = [null, 1, true, Symbol('test')]

test('usePlugin validate arguments', async () => {
  for (const cse of cases) {
    expect(() => (usePlugin as any)(cse)).toThrowErrorMatchingSnapshot()
  }
})

test('useConfig validate arguments', async () => {
  for (const cse of cases) {
    expect(() => (useConfig as any)(cse)).toThrowErrorMatchingSnapshot()
  }
})

test('useInject validate arguments', async () => {
  for (const cse of cases) {
    expect(() => (useInject as any)(cse)).rejects.toMatchSnapshot()
  }
})
