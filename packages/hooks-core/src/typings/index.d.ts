import { InternalConfig } from '../types/config'

declare global {
  namespace NodeJS {
    interface Global {
      MidwayConfig: InternalConfig
    }
  }
}
