import consola from 'consola'

export function isProduction() {
  if (
    process.env.MIDWAY_TS_MODE === 'true' ||
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'development'
  ) {
    return false
  }

  return true
}

export { consola }
