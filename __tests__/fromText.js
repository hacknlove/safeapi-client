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
beforeEach(async () => {
  safeApi.conf.server = 'test/'
  fetch.mockImplementation((url, options) => {
    return ok
  })
  jest.useFakeTimers()
})

afterEach(() => {
  safeApi.logout()
  fetch.mockReset()
})

describe('fromText', () => {
  it('fromText importa las credenciales en texto', async () => {
    await safeApi.createKey()
    const pem = safeApi.publicKey.pem
    const credenciales = await safeApi.toText()
    await safeApi.createKey()

    assert(safeApi.publicKey.uuid !== 'o98l9kjh')
    assert(safeApi.publicKey.pem !== pem)

    await safeApi.fromText(credenciales)

    assert(safeApi.publicKey.uuid, 'o98l9kjh')
    assert(safeApi.publicKey.pem === pem)
  })
  it('fromText lanza error al importar si el password no es correcto', async () => {
    expect.assertions(1)
    safeApi.setPlainPassword('pass')
    const credenciales = await safeApi.toText()
    jest.spyOn(console, 'warn').mockImplementation(() => {
      expect(true).toBe(true)
    })
    safeApi.setPlainPassword('puss')
    await assert.rejects(safeApi.fromText(credenciales))
  })
})
