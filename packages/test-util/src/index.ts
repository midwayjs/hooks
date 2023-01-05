import { join } from 'path'
export * from './app'
export { createHttpRequest } from '@midwayjs/mock'
export { default as supertest } from 'supertest'
export type { IMidwayKoaApplication } from '@midwayjs/koa'

export function resolveFixture(dir: string, fixture: string) {
  return join(dir, 'fixtures', fixture)
}
