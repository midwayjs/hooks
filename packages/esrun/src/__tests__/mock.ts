jest.mock('@swc-node/register/register', () => ({
  register: jest.fn(),
}))

export let isRegisterCalled = false
jest.mock('tsconfig-paths/register', () => {
  isRegisterCalled = true
})
