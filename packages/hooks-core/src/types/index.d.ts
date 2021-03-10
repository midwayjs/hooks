import { InternalConfig } from './config'

declare global {
  namespace NodeJS {
    interface Global {
      MidwayConfig: InternalConfig
    }
  }
}
