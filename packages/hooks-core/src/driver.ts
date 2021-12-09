import noop from 'lodash/noop'
import { ResponseMetaData } from '.'

type Driver = {
  // onError (): any
  // handleRequest (): any
  handleResponseMetaData(metadata: ResponseMetaData[]): any
}

let userDriver: Driver

export function setDriver(driver: Driver) {
  userDriver = driver
}

export function getDriver() {
  return userDriver
}
