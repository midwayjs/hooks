export function isDevelopment() {
  if (
    process.env.MIDWAY_TS_MODE === 'true' ||
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'development'
  ) {
    return true
  }

  return false
}
