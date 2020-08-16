import memoryfs from 'memory-fs'
import path from 'path'
import webpack from 'webpack'

const root = path.resolve(__dirname, './fixtures')

export default (fixture: string): Promise<webpack.Stats> => {
  const compiler = webpack({
    context: root,
    entry: fixture,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: {
            loader: path.resolve(__dirname, '../../dist/index.js'),
          },
        },
      ],
    },
  })

  compiler.outputFileSystem = new memoryfs() as any

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) reject(stats)

      resolve(stats)
    })
  })
}
