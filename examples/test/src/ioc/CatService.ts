import { Provide, Inject } from '@midwayjs/decorator';

debugger;

@Provide()
export class CatService {
  @Inject()
  catRepository: CatRepository;

  find() {
    return this.catRepository.find();
  }

  findAll() {
    return this.catRepository.findAll();
  }
}

@Provide()
export class CatRepository {
  find() {
    return 'Miao~';
  }

  findAll() {
    return ['Miao~', 'Miao~', 'Miao~'];
  }
}
