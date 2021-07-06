import { MidwayConfig } from './config'

declare global {
  namespace NodeJS {
    interface Global {
      MidwayConfig: MidwayConfig
    }
  }
}
