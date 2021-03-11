import { createRequest } from '..'
import { mocked } from 'ts-jest/utils'
import axios from 'axios'

jest.mock('axios')

const mockedAxios = mocked(axios)

test('should call axios', () => {
  createRequest('/', 'get')()
  createRequest('/', 'post')(1, 2, 3)
  createRequest('/', 'default')()
  createRequest('/api', 'books')()

  expect(mockedAxios.mock.calls).toHaveLength(4)
  expect(mockedAxios.mock.calls).toMatchSnapshot()
})

afterAll(() => {
  jest.unmock('axios')
})
