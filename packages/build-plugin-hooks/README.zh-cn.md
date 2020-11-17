# @midwayjs/build-plugin-hooks

为 [Rax](https://rax.js.org/)/[Ice](https://ice.work/) 提供的构建集成插件，作用是将代码中对于后端 Api 的引用转为前端 SDK 调用。

## 集成方式

安装依赖：

```bash
$ tnpm i @midwayjs/build-plugin-hooks -D
```

修改 build.json 中的 plugins，新增 `@midwayjs/build-plugin-hooks` 插件

```json
{
  "plugins": [
    [
      "build-plugin-rax-app",
      {
        "targets": ["web"]
      }
    ],
    "@midwayjs/build-plugin-hooks"
  ]
}
```
