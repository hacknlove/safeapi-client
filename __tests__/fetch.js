const safeApi = require('../')
const fetchHelper = require('@hacknlove/fetchhelper')

beforeAll(async () => {
  fetchHelper.fetch = jest.fn((url, options) => {
    return Promise.resolve({
      ok: true,
      json () {
        return 'uuid'
      }
    })
  })
  await safeApi.createKey()
  fetchHelper.fetch.mockReset()
})

describe('fetch', () => {
  it(' GET no tiene body', async () => {
    fetchHelper.fetch.mockImplementation((url, options) => {
      assert(options.method === 'GET')
      assert(options.body === undefined)
      return Promise.resolve({
        ok: true,
        json () {
          return 'ok'
        }
      })
    })
    await safeApi.fetch('url')
  })
})
