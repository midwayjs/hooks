import memoryfs from 'memory-fs'
import path from 'path'
import webpack from 'webpack'

export default (fixture: string | string[], root: string): Promise<webpack.Stats> => {
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
            loader: path.resolve(__dirname, '../../lib/index.js'),
          },
        },
        { test: /\.tsx?$/, loader: 'ts-loader' },
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
