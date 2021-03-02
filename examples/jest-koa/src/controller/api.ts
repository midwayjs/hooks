import {
  Controller,
  Get,
  Provide,
  Inject,
  SetHeader,
  Logger,
} from '@midwayjs/decorator'
import { IMidwayKoaContext } from '@midwayjs/koa'

@Provide()
@Controller('/')
export class APIController {
  @Inject()
  ctx: IMidwayKoaContext

  @Logger()
  logger

  @Get('/set_header')
  @SetHeader('bbb', 'aaa')
  @SetHeader({
    ccc: 'ddd',
  })
  async homeSet() {
    return 'bbb'
  }
}
