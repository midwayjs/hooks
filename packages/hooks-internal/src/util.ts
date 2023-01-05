export function isDev() {
  return (
    process.env.MIDWAY_TS_MODE === 'true' ||
    /* istanbul ignore next */
    process.env.NODE_ENV === 'test' ||
    /* istanbul ignore next */
    process.env.NODE_ENV === 'development'
  )
}
