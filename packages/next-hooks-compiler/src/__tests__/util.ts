import { compileHooks, hintConfig } from '..'
import path from 'path'

export async function compileFixture(fixture: string) {
  return compileHooks(path.resolve(__dirname, './fixtures', fixture), hintConfig)
}
