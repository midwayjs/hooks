# @midwayjs/bundler

## 3.1.4

### Patch Changes

- 75014614: fix: use commonjs by default for esrun
- Updated dependencies [75014614]
  - @midwayjs/esrun@3.1.4
  - @midwayjs/hooks-core@3.1.4

## 3.1.3

### Patch Changes

- 8123743d: feat: add middleware for serverless trigger
- Updated dependencies [8123743d]
  - @midwayjs/esrun@3.1.3
  - @midwayjs/hooks-core@3.1.3

## 3.1.2

### Patch Changes

- 88e551a8: feat: add ssr trigger and refactor to use @midwayjs/core
- Updated dependencies [88e551a8]
  - @midwayjs/esrun@3.1.2
  - @midwayjs/hooks-core@3.1.2

## 3.1.1

### Patch Changes

- 22fe58b1: fix: export user config as type, https://github.com/midwayjs/hooks/pull/513
- Updated dependencies [22fe58b1]
  - @midwayjs/esrun@3.1.1
  - @midwayjs/hooks-core@3.1.1

## 3.1.0

### Minor Changes

- 615e94b2: Add @midwayjs/dev-pack / use vite 4 / drop nodejs v12 support

### Patch Changes

- 0c223958: fix: pass empty object when serverless trigger options is undefined
- 886e6041: fix: use providerId for functionName
- Updated dependencies [0c223958]
- Updated dependencies [886e6041]
- Updated dependencies [615e94b2]
  - @midwayjs/hooks-core@3.1.0
  - @midwayjs/esrun@3.1.0

## 3.1.0-beta.2

### Patch Changes

- fix: pass empty object when serverless trigger options is undefined
- Updated dependencies
  - @midwayjs/hooks-core@3.1.0-beta.2
  - @midwayjs/esrun@3.1.0-beta.2

## 3.1.0-beta.1

### Patch Changes

- 886e6041: fix: use providerId for functionName
- Updated dependencies [886e6041]
  - @midwayjs/esrun@3.1.0-beta.1
  - @midwayjs/hooks-core@3.1.0-beta.1

## 3.1.0-beta.0

### Minor Changes

- 615e94b2: Add @midwayjs/dev-pack and fix bugs

### Patch Changes

- Updated dependencies [615e94b2]
  - @midwayjs/esrun@3.1.0-beta.0
  - @midwayjs/hooks-core@3.1.0-beta.0

## 3.0.1

### Patch Changes

- 027d494: feat: add legacy mode to support midway hooks 2.0
- 374db95: fix: support all method for rpc client
- Updated dependencies [027d494]
- Updated dependencies [374db95]
  - @midwayjs/esrun@3.0.1
  - @midwayjs/hooks-core@3.0.1

## 3.0.0

### Major Changes

- 2d722ae: release 3.0

### Patch Changes

- 08e4944: fix https://github.com/midwayjs/midway/issues/1641
- e991c98: use midway.config.js for api server project, fix #195
- 56f3508: Fix bugs
- db6874a: Release 3.0.0 rc version
- f05ce94: Add support for serverless worker
- 563430f: Hooks middleware now accept any types 589853fc001751f8ca94b2e04a0b5b416cdfe83f
- f342e0a: @midwayjs/serve, fix path issue at windows, fixes #255
- 56f3508: Build
- 08e4944: fix https://github.com/midwayjs/hooks/issues/193
- e1feaea: Fix #239, use tuple to validate input args and update docs
- 29d6d05: Add midwayjs deps to @midwayjs/hooks
- 5883056: add @midwayjs/esrun to support decorator & tsconfig-paths, fix #207
- 47b7842: add @midwayjs/hcc to compile project into single file
- 468ffa4: fix: lazy load zod
- a11ce76: Fix class middleware support
- 02c1e72: feat: add @midwayjs/hooks-upload component
- 3d6e603: Fix [#241](https://github.com/midwayjs/hooks/issues/241)
- 74d16d9: Set correct version for examples
- 4a27b18: refactor: remove @midwayjs/hooks/test, import from @midwayjs/hooks directly
- 30bc2f6: Add `@midwayjs/serve` to serve static files in FaaS environments, fix [#196](https://github.com/midwayjs/hooks/issues/196)
- f3eaaa2: Add missing deps
- a7e15f4: support spa for hooks-kit Fixed #238
- 74d16d9: Build after publish
- e991c98: hooks-kit now support file-route
- 49f5113: Fix the duplicate path issue(#199)
- 711d651: feat: export HooksValidationError(#282)
- Updated dependencies [08e4944]
- Updated dependencies [e991c98]
- Updated dependencies [56f3508]
- Updated dependencies [db6874a]
- Updated dependencies [f05ce94]
- Updated dependencies [563430f]
- Updated dependencies [f342e0a]
- Updated dependencies [56f3508]
- Updated dependencies [08e4944]
- Updated dependencies [e1feaea]
- Updated dependencies [2d722ae]
- Updated dependencies [29d6d05]
- Updated dependencies [5883056]
- Updated dependencies [47b7842]
- Updated dependencies [468ffa4]
- Updated dependencies [a11ce76]
- Updated dependencies [02c1e72]
- Updated dependencies [3d6e603]
- Updated dependencies [74d16d9]
- Updated dependencies [4a27b18]
- Updated dependencies [30bc2f6]
- Updated dependencies [f3eaaa2]
- Updated dependencies [a7e15f4]
- Updated dependencies [74d16d9]
- Updated dependencies [e991c98]
- Updated dependencies [49f5113]
- Updated dependencies [711d651]
  - @midwayjs/hooks-core@3.0.0
  - @midwayjs/esrun@3.0.0

## 3.0.0-rc.17

### Patch Changes

- 468ffa4: fix: lazy load zod
- 711d651: feat: export HooksValidationError(#282)
- Updated dependencies [468ffa4]
- Updated dependencies [711d651]
  - @midwayjs/esrun@3.0.0-rc.17
  - @midwayjs/hooks-core@3.0.0-rc.17

## 3.0.0-rc.16

### Patch Changes

- 02c1e72: feat: add @midwayjs/hooks-upload component
- Updated dependencies [02c1e72]
  - @midwayjs/hooks-core@3.0.0-rc.16
  - @midwayjs/esrun@3.0.0-rc.16

## 3.0.0-rc.15

### Patch Changes

- f342e0a: @midwayjs/serve, fix path issue at windows, fixes #255
- Updated dependencies [f342e0a]
  - @midwayjs/esrun@3.0.0-rc.15
  - @midwayjs/hooks-core@3.0.0-rc.15

## 3.0.0-rc.14

### Patch Changes

- a11ce76: Fix class middleware support
- Updated dependencies [a11ce76]
  - @midwayjs/hooks-core@3.0.0-rc.14
  - @midwayjs/esrun@3.0.0-rc.14

## 3.0.0-rc.13

### Patch Changes

- 563430f: Hooks middleware now accept any types 589853fc001751f8ca94b2e04a0b5b416cdfe83f
- Updated dependencies [563430f]
  - @midwayjs/esrun@3.0.0-rc.13
  - @midwayjs/hooks-core@3.0.0-rc.13

## 3.0.0-rc.12

### Patch Changes

- e1feaea: Fix #239, use tuple to validate input args and update docs
- 3d6e603: Fix [#241](https://github.com/midwayjs/hooks/issues/241)
- a7e15f4: support spa for hooks-kit Fixed #238
- Updated dependencies [e1feaea]
- Updated dependencies [3d6e603]
- Updated dependencies [a7e15f4]
  - @midwayjs/hooks-core@3.0.0-rc.12
  - @midwayjs/esrun@3.0.0-rc.12

## 3.0.0-rc.11

### Patch Changes

- e991c98: use midway.config.js for api server project, fix #195
- 5883056: add @midwayjs/esrun to support decorator & tsconfig-paths, fix #207
- 30bc2f6: Add `@midwayjs/serve` to serve static files in FaaS environments, fix [#196](https://github.com/midwayjs/hooks/issues/196)
- e991c98: hooks-kit now support file-route
- Updated dependencies [e991c98]
- Updated dependencies [5883056]
- Updated dependencies [30bc2f6]
- Updated dependencies [e991c98]
  - @midwayjs/hooks-core@3.0.0-rc.11
  - @midwayjs/esrun@3.0.0-rc.11

## 3.0.0-rc.10

### Patch Changes

- 29d6d05: Add midwayjs deps to @midwayjs/hooks
- Updated dependencies [29d6d05]
  - @midwayjs/hooks-core@3.0.0-rc.10

## 3.0.0-rc.9

### Patch Changes

- 47b7842: add @midwayjs/hcc to compile project into single file
- 4a27b18: refactor: remove @midwayjs/hooks/test, import from @midwayjs/hooks directly
- 49f5113: Fix the duplicate path issue(#199)
- Updated dependencies [47b7842]
- Updated dependencies [4a27b18]
- Updated dependencies [49f5113]
  - @midwayjs/hooks-core@3.0.0-rc.9

## 3.0.0-rc.8

### Patch Changes

- Add support for serverless worker
- Updated dependencies
  - @midwayjs/hooks-core@3.0.0-rc.8

## 3.0.0-rc.7

### Patch Changes

- b15fda8: fix https://github.com/midwayjs/midway/issues/1641
- b15fda8: fix https://github.com/midwayjs/hooks/issues/193
- Updated dependencies [b15fda8]
- Updated dependencies [b15fda8]
  - @midwayjs/hooks-core@3.0.0-rc.7

## 3.0.0-rc.6

### Patch Changes

- Add missing deps
- Updated dependencies
  - @midwayjs/hooks-core@3.0.0-rc.6

## 3.0.0-rc.5

### Patch Changes

- Build
- Updated dependencies
  - @midwayjs/hooks-core@3.0.0-rc.5

## 3.0.0-rc.4

### Patch Changes

- Fix bugs
- Updated dependencies
  - @midwayjs/hooks-core@3.0.0-rc.4

## 3.0.0-rc.3

### Patch Changes

- Set correct version for examples
- Updated dependencies
  - @midwayjs/hooks-core@3.0.0-rc.3

## 3.0.0-rc.2

### Patch Changes

- Build after publish
- Updated dependencies
  - @midwayjs/hooks-core@3.0.0-rc.2

## 3.0.0-rc.1

### Patch Changes

- 71a3115: Release 3.0.0 rc version
- Updated dependencies [71a3115]
  - @midwayjs/hooks-core@3.0.0-rc.1
