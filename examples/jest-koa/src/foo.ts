import { Provide } from '@midwayjs/decorator'

@Provide()
export class Foo {
  bar() {
    return 'bar'
  }
}
