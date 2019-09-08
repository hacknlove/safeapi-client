const safeApi = require('../src')
const fetchHelper = require('@hacknlove/fetchhelper')

const fetch = jest.fn()

fetchHelper.fetch = fetch

function ok () {
  return Promise.resolve({
    ok: true,
    json () {
      return 'uuid'
    }
  })
}

beforeAll(async () => {
  fetch.mockImplementation(ok)
  await safeApi.createKey()
})

describe('fetch', () => {
  beforeEach(() => {
    fetch.mockReset()
    fetch.mockImplementation(ok)
  })

  it('makes a fetch to the url', async () => {
    await safeApi.fetch('url')
    assert(fetch.mock.calls[0][0] === 'url')
  })

  it('do gets if no options', async () => {
    await safeApi.fetch()
    assert(fetch.mock.calls[0][1].method === 'GET')
  })

  it('do not add a body to GET', async () => {
    await safeApi.fetch()
    assert(fetch.mock.calls[0][1].body === undefined)
  })

  it('envia peticiones firmadas', async () => {
    await safeApi.fetch()
    assert(fetch.mock.calls[0][1].headers.Authorization)
  })
})
