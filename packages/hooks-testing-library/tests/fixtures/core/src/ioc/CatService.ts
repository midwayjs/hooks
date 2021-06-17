import { Provide, Inject } from '@midwayjs/decorator'

@Provide()
export class CatRepository {
  find() {
    return 'Miao~'
  }

  findAll() {
    return ['Miao~', 'Miao~', 'Miao~']
  }
}

@Provide()
export class CatService {
  @Inject()
  catRepository: CatRepository

  find() {
    return this.catRepository.find()
  }

  findAll() {
    return this.catRepository.findAll()
  }
}
