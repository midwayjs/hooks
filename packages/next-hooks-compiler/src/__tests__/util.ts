import { compileHooks, hintConfig } from '..'
import path from 'upath'

export async function compileFixture(fixture: string) {
  return compileHooks(path.resolve(__dirname, './fixtures', fixture), hintConfig)
}
