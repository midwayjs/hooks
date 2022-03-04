import './mock'
import path from 'path'
import { register } from '../index'
import { register as originRegister } from '@swc-node/register/register'

test('register', async () => {
  process.chdir(path.resolve(__dirname, 'fixtures'))
  register()

  expect(originRegister).toHaveBeenCalled()
  expect(require('./mock').isRegisterCalled).toEqual(true)
})
