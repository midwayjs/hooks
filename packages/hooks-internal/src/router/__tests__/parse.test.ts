import { FileSystemRouter } from '../file'
import { parseApiModule } from '../'
import { Api, Delete, OperatorType } from '@midwayjs/hooks-core'

test('FileSystemRouter should load pure function as api', async () => {
  const mod = {
    get() {},
    post(name: string) {},
    del: Api(Delete(), async () => {}),
  }
  const file = '/src/lambda/index.ts'
  const router = new FileSystemRouter({
    source: '/src',
    routes: [
      {
        baseDir: 'lambda',
      },
    ],
  })
  const apis = parseApiModule(mod, file, router)

  for (const api of apis) {
    expect(Reflect.getMetadata(OperatorType.Trigger, api.fn)).toMatchSnapshot()
  }
})
