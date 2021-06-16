import { als } from '../'
import {
  useConfig,
  useContext,
  useInject,
  useLogger,
  usePlugin,
} from '../hooks'

test('', () => {
  const mockContext = {
    logger: jest.fn(),
    app: {
      mysql: jest.fn(),
    },
    cors: jest.fn(),
    requestContext: {
      getAsync: jest.fn(),
      getConfigService() {
        return {
          getConfiguration(key) {
            return key
          },
        }
      },
    },
  }

  als.run({ ctx: mockContext }, async () => {
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
