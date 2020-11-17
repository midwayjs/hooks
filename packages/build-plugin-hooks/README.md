# @midwayjs/build-plugin-hooks

> [中文文档](./README.zh-cn.md)

Build integration plugin for [Rax](https://rax.js.org/) / [Ice](https://ice.work/) to convert references to backend Api in code to frontend SDK calls.

## Integration Method

Installation dependencies.

```bash
$ tnpm i @midwayjs/build-plugin-hooks -D
```

Modify plugins in build.json, add `@midwayjs/build-plugin-hooks` plug-in

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
