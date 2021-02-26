import type { LambdaParam } from '../types/http'
import axios from 'axios'

export const defaults = axios.defaults

export async function request(param: LambdaParam) {
  const response = await axios(param)
  return response.data
}
