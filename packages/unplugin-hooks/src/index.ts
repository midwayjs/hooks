import { createUnplugin, UnpluginOptions } from 'unplugin'

const unplugin = createUnplugin((options) => {
  return {
    name: '@midwayjs/unplugin-hooks',
    enforce: 'pre',
    transformInclude(id) {
      return router.isApiFile(id)
    },
    async transform(code, id) {
      const client = await buildApiClient(id, code, router)
      return client
    },
    // @TODO Vite support
    // vite: {
    //   resolveId(_: string, importer: string) {
    //     if (
    //       process.env.NODE_ENV !== 'production' &&
    //       importer &&
    //       router.isApiFile(importer)
    //     ) {
    //       return 'MIDWAY_HOOKS_VIRTUAL_FILE'
    //     }

    //     return null
    //   },
    //   config: () => {
    //     return {
    //       optimizeDeps: {
    //         include: [projectConfig.request.client],
    //       },
    //       build: {
    //         manifest: true,
    //         outDir: projectConfig.build.viteOutDir,
    //       },
    //     }
    //   }
    // },
  }
})

export const HooksWebpackPlugin = unplugin.webpack
export const HooksVitePlugin = unplugin.vite
