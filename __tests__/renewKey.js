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
          return 'nohacenadaconesto'
        }
      })
    })
    safeApi.publicKey.uuid = 'nuevoUUID'
    var oldPublicKey = safeApi.publicKey.pem
    const [response, error] = await safeApi.renewKey()
    assert(safeApi.publicKey.uuid === 'nuevoUUID')
    assert(response === 'nohacenadaconesto')
    assert(safeApi.publicKey.pem !== oldPublicKey)
    assert(error === undefined)
  })
  it('si el PUT devuelve error no cambia las credenciales', async () => {
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
})
