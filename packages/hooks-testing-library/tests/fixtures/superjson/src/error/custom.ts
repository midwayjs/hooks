import { superjson } from '@midwayjs/hooks-core'

export class CustomError extends Error {}

superjson.registerClass(CustomError, 'CustomError')
