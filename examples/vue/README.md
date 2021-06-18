# Midway Hooks + Vue 3 + Typescript + Vite

This template should help get you started developing with Midway Hooks + Vue 3 + Typescript in Vite.

## Getting Started

Docs：[Midway Hooks - Getting Started](https://www.yuque.com/midwayjs/midway_v2/hooks_intro?translate=en)

### Directory Structure

```
.
├── bootstrap.js //
├── jest.config.js // Unit test file
├── midway.config.ts // config file for setup directory and middleware
├── src
│   ├── apis // Backend directory
│   │   ├── configuration.ts // Midway Hooks configuration
│   │   └── lambda // Api directory(Can be modified in midway.config.ts)
│   │       ├── index.test.ts // Api test file
│   │       └── index.ts // Api file
│   └── main.ts // Frontend framework file
├── tsconfig.json
└── vite.config.ts
```

### Commands

#### Start Dev Server

```bash
$ npm run dev
```

#### Build

```bash
$ npm run build
```

### Running in production mode

```bash
$ node bootstrap.js
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur). Make sure to enable `vetur.experimental.templateInterpolationService` in settings!

### If Using `<script setup>`

[`<script setup>`](https://github.com/vuejs/rfcs/pull/227) is a feature that is currently in RFC stage. To get proper IDE support for the syntax, use [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) instead of Vetur (and disable Vetur).

## Type Support For `.vue` Imports in TS

Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default. In most cases this is fine if you don't really care about component prop types outside of templates. However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can use the following:

### If Using Volar

Run `Volar: Switch TS Plugin on/off` from VSCode command palette.

### If Using Vetur

1. Install and add `@vuedx/typescript-plugin-vue` to the [plugins section](https://www.typescriptlang.org/tsconfig#plugins) in `tsconfig.json`
2. Delete `src/shims-vue.d.ts` as it is no longer needed to provide module info to Typescript
3. Open `src/main.ts` in VSCode
4. Open the VSCode command palette 5. Search and run "Select TypeScript version" -> "Use workspace version"
