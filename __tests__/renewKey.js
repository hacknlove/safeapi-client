const safeApi = require('../')
const fetchHelper = require('@hacknlove/fetchhelper')

fetchHelper.fetch = jest.fn()

beforeEach(async () => {
  fetchHelper.fetch.mockImplementation((url, options) => {
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

describe('renewKey', () => {
  it('hace un PUT con la clave publica para crear una nueva', async () => {
    expect.assertions(1)
    fetchHelper.fetch = jest.fn((url, options) => {
      assert(options.method === 'PUT')
      expect(true).toBe(true)
      return Promise.resolve({
        ok: true,
        json () {
          return { ok: true }
        }
      })
    })
    safeApi.publicKey.uuid = 'nuevoUUID'
    var oldPublicKey = safeApi.publicKey.pem
    const [response, error] = await safeApi.renewKey()
    assert(safeApi.publicKey.uuid === 'nuevoUUID')
    assert.deepStrictEqual(response, { ok: true })
    assert(safeApi.publicKey.pem !== oldPublicKey)
    assert(error === undefined)
  })
  it('si el PUT devuelve error 4xx 5xx no cambia las credenciales', async () => {
    expect.assertions(1)
    fetchHelper.fetch = jest.fn((url, options) => {
      assert(options.method === 'PUT')
      expect(true).toBe(true)
      return Promise.resolve({
        ok: false
      })
    })
    safeApi.publicKey.uuid = 'nuevoUUID'
    var oldPublicKey = safeApi.publicKey.pem
    const [response, error] = await safeApi.renewKey()
    assert(safeApi.publicKey.uuid === 'nuevoUUID')
    assert(safeApi.publicKey.pem === oldPublicKey)
    assert(response === null)
    assert.deepStrictEqual(error, { ok: false })
  })
  it('si safeapi-client devuelve error, no cambia las credenciales', async () => {
    expect.assertions(1)
    fetchHelper.fetch.mockImplementation((url, options) => {
      assert(options.method === 'PUT')
      expect(true).toBe(true)
      return Promise.resolve({
        ok: true,
        json () {
          return {
            error: 'test'
          }
        }
      })
    })

    const oldUUID = safeApi.publicKey.uuid
    var oldPem = safeApi.publicKey.pem

    const [response, error] = await safeApi.renewKey()

    assert(safeApi.publicKey.uuid === oldUUID)
    assert(safeApi.publicKey.pem === oldPem)
    assert.deepStrictEqual(response, { error: 'test' })
    assert(error === undefined)
  })
})
