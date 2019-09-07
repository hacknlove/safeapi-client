const safeApi = require('../')
const fetchHelper = require('@hacknlove/fetchhelper')

const fetch = jest.fn()

fetchHelper.fetch = fetch

const ok = Promise.resolve({
  ok: true,
  json () {
    return 'uuid'
  }
})
const netError = Promise.resolve({
  ok: false
})
const badCredentials = Promise.resolve({
  ok: true,
  json () {
    return { error: true }
  }
})

beforeEach(async () => {
  jest.useFakeTimers()
  safeApi.conf.server = 'test/'
  fetch.mockImplementation((url, options) => {
    return ok
  })
  await safeApi.createKey()
  fetch.mockReset()
  jest.useFakeTimers()
})

afterEach(() => {
  safeApi.logout()
})
describe('testCredentials', () => {
  it('llama a GET /key', async () => {
    expect.assertions(1)
    fetch.mockImplementation((url, options) => {
      expect(true).toBe(true)
      assert(url === 'test/key')
      assert(options.method === 'GET')
      return ok
    })
    await safeApi.testCredentials()
    assert(setTimeout.mock.calls.length === 1)
    assert(clearTimeout.mock.calls.length === 1)
  })
  it('si se produce un error de red no desloguea', async () => {
    expect.assertions(1)
    fetch.mockImplementation(() => {
      expect(true).toBe(true)
      return netError
    })
    await safeApi.testCredentials()
    assert(safeApi.publicKey.uuid !== '')
  })
  it('si devuelve ok no desloguea', async () => {
    expect.assertions(1)
    fetch.mockImplementation(() => {
      expect(true).toBe(true)
      return ok
    })
    await safeApi.testCredentials()
    assert(safeApi.publicKey.uuid !== '')
  })
  it('si devuelve error desloguea', async () => {
    expect.assertions(1)
    fetch.mockImplementation(() => {
      expect(true).toBe(true)
      return badCredentials
    })
    await safeApi.testCredentials()
    assert(safeApi.publicKey.uuid === '')
  })
})
describe('scheduleTestCredentials', () => {
  it('limpia y reestablece el temporizador, no llama a fetch', async () => {
    expect.assertions(0)
    fetch.mockImplementation(() => {
      expect(true).toBe(true)
      assert.fail()
      return ok
    })
    await safeApi.scheduleTestCredentials()
    assert(setTimeout.mock.calls.length === 1)
    assert(clearTimeout.mock.calls.length === 1)
  })
})
