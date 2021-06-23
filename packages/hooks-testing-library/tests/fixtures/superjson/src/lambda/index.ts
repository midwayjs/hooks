import { Context } from 'koa'

import { useContext } from '@midwayjs/hooks'

import { CustomError } from '../error/custom'

export async function get() {
  const ctx = useKoaContext()
  return ctx.method
}

export async function post(name: string) {
  const ctx = useKoaContext()

  return {
    method: ctx.method,
    name,
  }
}

export const returnString = async () => {
  return 'Hello World'
}

export const returnObject = async () => {
  return {
    message: 'Hello World!',
  }
}

export const getContext = async () => {
  const ctx = useKoaContext()
  return {
    path: ctx.path,
  }
}

const useKoaContext = () => {
  return useContext<Context>()
}

export async function returnError() {
  return {
    err: new Error('this is error'),
  }
}

export async function throwError() {
  throw new Error('this is error')
}

export async function throwCustomError() {
  throw new CustomError('this is error')
}
