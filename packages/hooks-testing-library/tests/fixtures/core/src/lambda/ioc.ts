import { Provide, Inject } from '@midwayjs/decorator'
import { useInject } from '@midwayjs/hooks'

import { CatService } from '../ioc/CatService'

@Provide()
export class LocalInstance {
  @Inject()
  catService: CatService

  find() {
    return ['Local']
  }

  findAll() {
    return this.catService.findAll()
  }
}

export async function tryInject() {
  const catService = await useInject(CatService)
  return catService.findAll()
}

export async function tryInjectLocal() {
  const localInstance = await useInject(LocalInstance)
  return {
    find: localInstance.find(),
    findAll: localInstance.findAll(),
  }
}
