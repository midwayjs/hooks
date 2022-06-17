// Runtime Api
export * from './api'
export type { ApiConfig } from '@midwayjs/hooks-core'

// User Config
export { defineConfig, UserConfig } from '@midwayjs/hooks-internal'

// For unit test
export type { BaseTrigger, HttpTrigger } from '@midwayjs/hooks-core'
export { getApiTrigger } from '@midwayjs/hooks-core'
