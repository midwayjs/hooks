import { request } from '..'
import { mocked } from 'ts-jest/utils'
import axios from 'axios'

jest.mock('axios')

const mockedAxios = mocked(axios)

test('should call axios', () => {
  request({
    url: '/',
    method: 'GET',
    data: { args: [] },
    meta: {},
  })
  request({
    url: '/',
    method: 'GET',
    data: { args: [] },
    meta: {},
  })
  request({
    url: '/api/books',
    method: 'GET',
    data: { args: [] },
    meta: {},
  })

  expect(mockedAxios.mock.calls).toHaveLength(3)
  expect(mockedAxios.mock.calls).toMatchSnapshot()
})

afterAll(() => {
  jest.unmock('axios')
})
