## Getting Started

React + Prisma + Midway + Koa

Docs：

- [Midway Hooks - Getting Started](https://www.yuque.com/midwayjs/midway_v2/integration_introduction?translate=en)
- [Prisma](https://www.prisma.io/)

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

#### Init Database Client

```
$ npx prisma generate
```

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
