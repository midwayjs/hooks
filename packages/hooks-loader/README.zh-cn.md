# @midwayjs/hooks-loader

一体化调用的 Webpack Loader，作用是将代码中对于后端 Api 的调用转为前端 SDK 调用。

## 版本要求

- Webpack 4+

## 集成方式

### Webpack Chain

```typescript
function useWebpackChain(config) {
  const MidwayHooksLoader = require.resolve('@midwayjs/hooks-loader')
  ;['jsx', 'tsx'].forEach((type) => {
    config.module.rule(type).use('midway-hooks').loader(MidwayHooksLoader)
  })
  return config
}
```

### react-app-rewired

```typescript
module.exports = {
  webpack: function (config, env) {
    config.module.rules.unshift({
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      use: [
        {
          loader: require.resolve('@midwayjs/hooks-loader'),
        },
      ],
    })

    return config
  },
}
```
