import { createBundlerPlugin } from '@midwayjs/bundler'
import { MidwayBundlerAdapter } from './adapter'

const plugin = createBundlerPlugin(new MidwayBundlerAdapter())

export const webpack = plugin.webpack
export const vite = plugin.vite
