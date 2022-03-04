jest.mock('@swc-node/register/register', () => ({
  register: jest.fn(),
}))

jest.mock('tsconfig-paths/register', () => {
  return 'is tsconfig-paths/register mock'
})
