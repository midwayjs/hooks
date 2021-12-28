import { als as als$1 } from 'asynchronous-local-storage'
import {
  extname,
  relative,
  sep,
  resolve,
  toUnix,
  removeExt,
  basename,
  join,
} from 'upath'
import urlJoin from 'proper-url-join'
export { default as urlJoin } from 'proper-url-join'
import some from 'lodash/some'
import parseArgs from 'fn-args'
import { inspect } from 'util'
import createJITI from 'jiti'
import isFunction from 'lodash/isFunction'
import pickBy from 'lodash/pickBy'
import { run } from '@midwayjs/glob'
import 'reflect-metadata'
import kebabCase from 'lodash/kebabCase'
import last from 'lodash/last'

/**
 * @private
 * private api, may change without notice.
 * Use asynchronous-local-storage due to serverless environment does not support node.js 12.17.0
 */
const als = {
  get runtime() {
    return als$1
  },
  getStore(key) {
    return als.runtime.get(key)
  },
  run(ctx, callback) {
    return new Promise((resolve, reject) => {
      als.runtime.runWith(() => callback().then(resolve).catch(reject), ctx)
    })
  },
}

function useContext() {
  return als.getStore('ctx')
}

class AbstractRouter {
  constructor(source) {
    this.source = source
  }

  isJavaScriptFile(file) {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs']
    if (!extensions.includes(extname(file))) {
      return false
    }

    const testExt = [
      '.test.ts',
      '.test.tsx',
      '.test.js',
      '.test.jsx',
      '.test.mjs',
    ]

    return !testExt.some((ext) => file.endsWith(ext))
  }

  isPathInside(child, parent) {
    const relation = relative(parent, child)
    return Boolean(
      relation &&
        relation !== '..' &&
        !relation.startsWith(`..${sep}`) &&
        relation !== resolve(child)
    )
  }
}

let OperatorType
;(function (OperatorType) {
  OperatorType['Trigger'] = 'Trigger'
  OperatorType['Middleware'] = 'Middleware'
})(OperatorType || (OperatorType = {}))

const PRE_DEFINE_PROJECT_CONFIG = Symbol.for('PRE_DEFINE_PROJECT_CONFIG')
const EXPORT_DEFAULT_FUNCTION_ALIAS = '$default'
const USE_INPUT_METADATA = 'USE_INPUT_METADATA'
const DECORATE_BASE_PATH = '/rpc'

function isHooksMiddleware(fn) {
  return parseArgs(fn).length === 1
}

function extractMetadata(target) {
  const metadata = {}
  const metaKeys = Reflect.getMetadataKeys(target)
  for (const key of metaKeys) {
    metadata[key] = Reflect.getMetadata(key, target)
  }
  return metadata
}

class ERR_INVALID_ARG_VALUE extends Error {
  constructor(actual, name, reason = 'is invalid') {
    const message = `[ERR_INVALID_ARG_VALUE]: The argument '${name}' ${reason} ${getTypeMessage(
      actual
    )}`
    super(message)
  }
}

class ERR_INVALID_ARG_TYPE extends Error {
  constructor(name, expected, actual) {
    const message = `[ERR_INVALID_ARG_TYPE]: The '${name}' argument must be of type ${expected}${getTypeMessage(
      actual
    )}`
    super(message)
  }
}

// fork from https://github.com/nodejs/node/blob/master/lib/internal/errors.js
function getTypeMessage(actual) {
  let msg = ''
  if (actual == null) {
    msg += `. Received ${actual}`
  } else if (typeof actual === 'function' && actual.name) {
    msg += `. Received function ${actual.name}`
  } else if (typeof actual === 'object') {
    if (actual.constructor && actual.constructor.name) {
      msg += `. Received an instance of ${actual.constructor.name}`
    } else {
      const inspected = inspect(actual, { depth: -1 })
      msg += `. Received ${inspected}`
    }
  } else {
    let inspected = inspect(actual, { colors: false })
    if (inspected.length > 25) inspected = `${inspected.slice(0, 25)}...`
    msg += `. Received type ${typeof actual} (${inspected})`
  }
  return msg
}

function validateArray(value, name) {
  if (!Array.isArray(value)) {
    throw new ERR_INVALID_ARG_TYPE(name, 'Array', value)
  }
}

function validateString(value, name) {
  if (typeof value !== 'string')
    throw new ERR_INVALID_ARG_TYPE(name, 'string', value)
}

function validateFunction(value, name) {
  if (typeof value !== 'function') {
    throw new ERR_INVALID_ARG_TYPE(name, 'Function', value)
  }
}

function validateOneOf(value, name, oneOf) {
  if (!oneOf.includes(value)) {
    const allowed = oneOf
      .map((v) => (typeof v === 'string' ? `'${v}'` : String(v)))
      .join(', ')
    const reason = 'must be one of: ' + allowed
    throw new ERR_INVALID_ARG_VALUE(name, value, reason)
  }
}

const jiti = createJITI()

// TODO support manual setup
class DecorateRouter extends AbstractRouter {
  constructor(config) {
    var _config$basePath
    super(config.source)
    this.config = config
    ;(_config$basePath = config.basePath) !== null &&
    _config$basePath !== void 0
      ? _config$basePath
      : (config.basePath = DECORATE_BASE_PATH)
  }

  isApiFile(file) {
    if (
      !super.isJavaScriptFile(file) ||
      !this.isPathInside(toUnix(file), toUnix(this.source))
    ) {
      return false
    }

    try {
      return this.hasExportApiRoutes(jiti(file))
    } catch (error) {
      console.log('require error', error)
      return false
    }
  }

  hasExportApiRoutes(mod) {
    return some(
      mod,
      (exp) =>
        typeof exp === 'function' &&
        !!Reflect.getMetadata(OperatorType.Trigger, exp)
    )
  }

  getFunctionId(file, functionName, exportDefault) {
    return exportDefault
      ? removeExt(basename(file), extname(file))
      : functionName
  }

  functionToHttpPath(file, functionName, exportDefault) {
    return urlJoin(
      this.config.basePath,
      this.getFunctionId(file, functionName, exportDefault),
      { trailingSlash: false }
    )
  }
}

class AbstractFrameworkAdapter {
  constructor(router) {
    this.router = router
  }
}

let framework
async function createApplication(source, frameworkAdapter) {
  framework = frameworkAdapter
  const apis = loadApiRoutes(source, framework.router)
  await framework.registerApiRoutes(apis)
}

function compose(functions, helper = {}) {
  if (!Array.isArray(functions))
    throw new TypeError('Middleware stack must be an array!')
  for (const fn of functions) {
    if (typeof fn !== 'function')
      throw new TypeError('Middleware must be composed of functions!')
  }

  return function () {
    // last called middleware #
    let index = -1
    return dispatch(0)

    function dispatch(i) {
      if (i <= index)
        return Promise.reject(new Error('next() called multiple times'))

      index = i
      let fn = functions[i]
      if (!fn) return Promise.resolve()

      try {
        return Promise.resolve(
          fn({
            ...helper,
            next: dispatch.bind(null, i + 1),
          })
        )
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}

const HttpTriggerType = 'HTTP'

let HttpMetadata
;(function (HttpMetadata) {
  HttpMetadata['METHOD'] = 'Http_Method'
  HttpMetadata['QUERY'] = 'Http_Query'
  HttpMetadata['PARAM'] = 'Http_Param'
  HttpMetadata['HEADER'] = 'Http_Header'
  HttpMetadata['RESPONSE'] = 'Http_Response'
})(HttpMetadata || (HttpMetadata = {}))

let ResponseMetadata
;(function (ResponseMetadata) {
  ResponseMetadata['CODE'] = 'Http_Response_Code'
  ResponseMetadata['HEADER'] = 'Http_Response_Header'
  ResponseMetadata['CONTENT_TYPE'] = 'Http_Response_ContentType'
  ResponseMetadata['REDIRECT'] = 'Http_Response_Redirect'
})(ResponseMetadata || (ResponseMetadata = {}))

let HttpMethod
;(function (HttpMethod) {
  HttpMethod['GET'] = 'GET'
  HttpMethod['POST'] = 'POST'
  HttpMethod['PUT'] = 'PUT'
  HttpMethod['DELETE'] = 'DELETE'
  HttpMethod['PATCH'] = 'PATCH'
  HttpMethod['HEAD'] = 'HEAD'
  HttpMethod['OPTIONS'] = 'OPTIONS'
  HttpMethod['ALL'] = 'ALL'
})(HttpMethod || (HttpMethod = {}))

function createHTTPMethodOperator(method) {
  return (path) => {
    return {
      name: method,
      metadata({ setMetadata }) {
        setMetadata(OperatorType.Trigger, {
          type: HttpTriggerType,
          method,
          path,
          requestClient: {
            fetcher: 'http',
            client: '@midwayjs/rpc',
          },
        })
      },
    }
  }
}

// HTTP Method
const All = createHTTPMethodOperator(HttpMethod.ALL)
const Get = createHTTPMethodOperator(HttpMethod.GET)
const Post = createHTTPMethodOperator(HttpMethod.POST)
const Delete = createHTTPMethodOperator(HttpMethod.DELETE)
const Put = createHTTPMethodOperator(HttpMethod.PUT)
const Patch = createHTTPMethodOperator(HttpMethod.PATCH)
const Head = createHTTPMethodOperator(HttpMethod.HEAD)
const Options = createHTTPMethodOperator(HttpMethod.OPTIONS)

// HTTP Helper
function Query() {
  return {
    name: HttpMetadata.QUERY,
    input: true,
    metadata({ setMetadata }) {
      setMetadata(HttpMetadata.QUERY, true)
    },
  }
}

function Param() {
  return {
    name: HttpMetadata.PARAM,
    input: true,
    metadata({ setMetadata }) {
      setMetadata(HttpMetadata.PARAM, true)
    },
  }
}

function Header() {
  return {
    name: HttpMetadata.HEADER,
    input: true,
    metadata({ setMetadata }) {
      setMetadata(HttpMetadata.HEADER, true)
    },
  }
}

function HttpCode(code) {
  return {
    name: 'HttpCode',
    metadata(helper) {
      setResponseMetaData(helper, ResponseMetadata.CODE, { code })
    },
  }
}

function SetHeader(key, value) {
  return {
    name: 'SetHeader',
    metadata(helper) {
      setResponseMetaData(helper, ResponseMetadata.HEADER, {
        header: {
          key,
          value,
        },
      })
    },
  }
}

function Redirect(url, code) {
  return {
    name: 'Redirect',
    metadata(helper) {
      setResponseMetaData(helper, ResponseMetadata.REDIRECT, {
        url,
        code,
      })
    },
  }
}

function ContentType(contentType) {
  return {
    name: 'ContentType',
    metadata(helper) {
      setResponseMetaData(helper, ResponseMetadata.CONTENT_TYPE, {
        contentType,
      })
    },
  }
}

function setResponseMetaData(helper, type, value) {
  const responseMetaData = helper.getMetadata(HttpMetadata.RESPONSE) || []

  helper.setMetadata(HttpMetadata.RESPONSE, [
    ...responseMetaData,
    {
      type,
      ...value,
    },
  ])
}

function Decorate(...args) {
  const handler = args.pop()
  validateFunction(handler, 'DecorateHandler')

  const operators = args
  const useInputMetadata = operators.some((operator) => operator.input)

  const stack = []
  // TODO Direct call or frontend end invoke
  const executor = async function DecoratorExecutor(...args) {
    const funcArgs = useInputMetadata ? args.slice(0, -1) : args

    let result
    stack.push(async ({ next }) => {
      result = await handler(...funcArgs)
      return next()
    })

    await compose(stack, { getInputArguments: () => funcArgs })()

    // handle HttpCode/Redirect/etc.
    const responseMetadata = Reflect.getMetadata(
      HttpMetadata.RESPONSE,
      executor
    )

    if (Array.isArray(responseMetadata)) {
      await framework.handleResponseMetaData(responseMetadata)
    }
    return result
  }

  for (const operator of operators) {
    if (operator.execute) {
      validateFunction(operator.execute, 'operator.execute')
      stack.push(operator.execute)
    }
  }

  const metadataHelper = {
    getMetadata(key) {
      return Reflect.getMetadata(key, executor)
    },
    setMetadata(key, value) {
      return Reflect.defineMetadata(key, value, executor)
    },
  }

  for (const operator of operators) {
    if (operator.metadata) {
      validateFunction(operator.metadata, 'operator.metadata')
      operator.metadata(metadataHelper)
    }
  }

  Reflect.defineMetadata(USE_INPUT_METADATA, useInputMetadata, executor)
  return executor
}

function loadApiRoutes(source, router) {
  const files = run(['**/*.{ts,tsx,js,jsx,mjs}'], {
    cwd: source,
    ignore: [
      '**/*.test.{ts,tsx,js,jsx,mjs}',
      '**/*.spec.{ts,tsx,js,jsx,mjs}',
      '**/*.d.{ts,tsx}',
      '**/node_modules/**',
    ],
  }).filter((file) => router.isApiFile(file))

  const routes = []
  for (const file of files) {
    const fileRoutes = loadApiRoutesFromFile(require(file), file, router)
    routes.push(...fileRoutes)
  }

  return routes
}

function loadApiRoutesFromFile(mod, file, router) {
  const apiRoutes = []
  const funcs = pickBy(mod, isFunction)

  for (let [name, fn] of Object.entries(funcs)) {
    var _mod$config
    const exportDefault = name === 'default'
    const functionName = exportDefault ? EXPORT_DEFAULT_FUNCTION_ALIAS : name
    const functionId = router.getFunctionId(file, functionName, exportDefault)

    // default is http trigger
    let trigger = Reflect.getMetadata(OperatorType.Trigger, fn)

    if (!trigger) {
      // default is http
      const Method = parseArgs(fn).length === 0 ? Get : Post
      // wrap pure function
      fn = Decorate(Method(), fn)
      // get trigger
      trigger = Reflect.getMetadata(OperatorType.Trigger, fn)
    }

    if (trigger.type === HttpTriggerType) {
      var _trigger, _trigger$path
      ;(_trigger$path = (_trigger = trigger).path) !== null &&
      _trigger$path !== void 0
        ? _trigger$path
        : (_trigger.path = router.functionToHttpPath(
            file,
            functionName,
            exportDefault
          ))
    }

    const fnMiddleware = Reflect.getMetadata(OperatorType.Middleware, fn) || []
    const fileMiddleware =
      (mod === null || mod === void 0
        ? void 0
        : (_mod$config = mod.config) === null || _mod$config === void 0
        ? void 0
        : _mod$config.middleware) || []
    const middleware = [...fnMiddleware, ...fileMiddleware]

    apiRoutes.push({
      fn,
      file,
      functionName,
      functionId,
      trigger,
      middleware,
      useInputMetadata: Reflect.getMetadata(USE_INPUT_METADATA, fn),
    })
  }

  return apiRoutes
}

let RouteKeyword
;(function (RouteKeyword) {
  RouteKeyword['INDEX'] = 'index'
  RouteKeyword['CATCH_ALL'] = '/*'
  RouteKeyword['DYNAMIC'] = ':'
})(RouteKeyword || (RouteKeyword = {}))

class FileSystemRouter extends AbstractRouter {
  constructor(config) {
    super(join(config.root, config.source))
    this.config = config
  }

  getApiDirectory(baseDir) {
    return join(this.source, baseDir)
  }

  getFunctionId(file, functionName, isExportDefault) {
    const relativePath = relative(this.source, file)
    // src/apis/lambda/index.ts -> apis-lambda-index
    const id = kebabCase(removeExt(relativePath, extname(relativePath)))
    const name = [id, isExportDefault ? '' : `-${functionName}`].join('')
    return name.toLowerCase()
  }

  getRoute(file) {
    return this.config.routes.find((route) => {
      const apiDir = this.getApiDirectory(route.baseDir)
      return this.isPathInside(toUnix(file), toUnix(apiDir))
    })
  }

  isApiFile(file) {
    if (!super.isJavaScriptFile(file)) {
      return false
    }

    const route = this.getRoute(file)
    return !!route
  }

  functionToHttpPath(file, functionName, exportDefault) {
    const { baseDir } = this.getRoute(file)

    const filePath = removeExt(
      relative(this.getApiDirectory(baseDir), file),
      extname(file)
    )

    return urlJoin(this.buildUrl(filePath, exportDefault ? '' : functionName), {
      trailingSlash: false,
    })
  }

  buildUrl(file, functionName = '') {
    const parts = file
      .split(/\[(.+?\(.+?\)|.+?)\]/)
      .map((str, i) => {
        if (!str) return null
        const dynamic = i % 2 === 1

        const [, content, qualifier] = dynamic
          ? /([^(]+)(\(.+\))?$/.exec(str)
          : [null, str, null]

        return {
          content,
          dynamic,
          catchAll: /^\.{3}.+$/.test(content),
          qualifier,
        }
      })
      .filter(Boolean)

    const catchAllIndex = parts.findIndex((part) => part.catchAll)
    if (catchAllIndex !== -1 && catchAllIndex !== parts.length - 1) {
      throw new Error(
        `Catch all routes must be the last part of the path. Current input: ${file}`
      )
    }

    const segments = []

    for (let [idx, { content, dynamic, catchAll }] of parts.entries()) {
      if (!content) continue

      if (catchAll) {
        if (content.slice(3) !== RouteKeyword.INDEX) {
          segments.push(content.slice(3))
        }
        continue
      }

      /**
       * /[api]/id -> /:api/id
       */
      if (dynamic) {
        segments.push(`${RouteKeyword.DYNAMIC}${content}`)
        continue
      }

      if (idx === parts.length - 1) {
        const contents = content.split('/')
        if (last(contents) === RouteKeyword.INDEX) {
          contents.pop()
          segments.push(contents.join('/'))
          continue
        }
      }

      segments.push(content)
    }

    segments.push(functionName)
    if (catchAllIndex !== -1) {
      segments.push(RouteKeyword.CATCH_ALL)
    }

    return urlJoin.apply(null, [...segments, {}])
  }
}

function Middleware(...middlewares) {
  let middleware = middlewares
  if (Array.isArray(middlewares[0])) {
    middleware = middlewares[0]
  }

  return {
    name: 'Middleware',
    metadata({ setMetadata }) {
      setMetadata(OperatorType.Middleware, middleware)
    },
  }
}

let validator = (schema, input) => schema.parseAsync(input)

function setValidator(newValidator) {
  validateFunction(newValidator, 'newValidator')
  validator = newValidator
}

function Validate(...schemas) {
  return {
    name: 'Validate',
    async execute({ next, getInputArguments }) {
      const inputs = getInputArguments()

      // validate args using valdiators
      for (let i = 0; i < schemas.length; i++) {
        const schema = schemas[i]
        const input = inputs[i]

        validateFunction(validator, 'validator')
        await validator(schema, input)
      }

      return next()
    },
  }
}

export {
  AbstractFrameworkAdapter,
  AbstractRouter,
  All,
  ContentType,
  DECORATE_BASE_PATH,
  Decorate,
  DecorateRouter,
  Delete,
  ERR_INVALID_ARG_TYPE,
  ERR_INVALID_ARG_VALUE,
  EXPORT_DEFAULT_FUNCTION_ALIAS,
  FileSystemRouter,
  Get,
  Head,
  Header,
  HttpCode,
  HttpMetadata,
  HttpMethod,
  HttpTriggerType,
  Middleware,
  OperatorType,
  Options,
  PRE_DEFINE_PROJECT_CONFIG,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Redirect,
  ResponseMetadata,
  RouteKeyword,
  SetHeader,
  USE_INPUT_METADATA,
  Validate,
  als,
  compose,
  createApplication,
  extractMetadata,
  framework,
  isHooksMiddleware,
  loadApiRoutes,
  loadApiRoutesFromFile,
  setValidator,
  useContext,
  validateArray,
  validateFunction,
  validateOneOf,
  validateString,
}
