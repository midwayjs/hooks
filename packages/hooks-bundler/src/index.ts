import { createBundlerPlugin } from '@midwayjs/bundler'
import { MidwayBundlerAdapter } from './adapter'

const plugin = createBundlerPlugin(new MidwayBundlerAdapter())

export const webpack = plugin.webpack
export const vite = plugin.vite
export const esbuild = plugin.esbuild
export const rollup = plugin.rollup

export const ServerlessBundlerPlugin = {
  get vite() {
    throw new Error(
      `ServerlessBundlerPlugin is deprecated, use import { vite } from '@midwayjs/hooks-bundler' directly.`
    )
  },
}
