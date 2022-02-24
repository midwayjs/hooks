// Runtime Api
export * from './api'
export type { ApiConfig } from '@midwayjs/hooks-core'

// User Config
export { defineConfig } from './internal'
export type { UserConfig } from './internal/config/type'

// For unit test
export type { BaseTrigger, HttpTrigger } from '@midwayjs/hooks-core'
export { getApiTrigger } from '@midwayjs/hooks-core'
