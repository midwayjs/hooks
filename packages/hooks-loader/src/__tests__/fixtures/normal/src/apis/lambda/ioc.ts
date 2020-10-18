import { useInject } from '@ali/midway-hooks'
import { Provide } from '@midwayjs/decorator'

export async function getModel() {
  const model = await useInject(Model)
  return model.name
}

@Provide()
export class Model {
  name = 'model'
}
