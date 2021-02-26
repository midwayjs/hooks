import { UserConfig } from '../types/config'

declare global {
  namespace NodeJS {
    interface Global {
      MidwayConfig: UserConfig
    }
  }
}
