process.env.TEST = 'testCredentials'
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

function netError () {
  return Promise.resolve({
    ok: false
  })
}

function badCredentials () {
  return Promise.resolve({
    ok: true,
    json () {
      return {
        error: true,
        authError: true
      }
    }
  })
}

beforeEach(async () => {
  jest.useFakeTimers()
  fetch.mockImplementation(ok)
  await safeApi.createKey()
  fetch.mockReset()
  jest.useFakeTimers()
})

afterEach(() => {
  safeApi.logout()
})

describe('testCredentials', () => {
  it('llama a GET /key', async () => {
    fetch.mockImplementation(ok)
    await safeApi.testCredentials()
    assert(fetch.mock.calls[0][0] === 'key/')
    assert(fetch.mock.calls[0][1].method === 'GET')
    assert(setTimeout.mock.calls.length === 1)
    assert(clearTimeout.mock.calls.length === 1)
  })
  it('si se produce un error de red no desloguea', async () => {
    fetch.mockImplementation(netError)
    await safeApi.testCredentials()
    assert(safeApi.publicKey.uuid !== '')
  })
  it('si devuelve ok no desloguea', async () => {
    fetch.mockImplementation(ok)
    await safeApi.testCredentials()
    assert(safeApi.publicKey.uuid !== '')
  })
  it('si devuelve error desloguea', async () => {
    fetch.mockImplementation(badCredentials)
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
