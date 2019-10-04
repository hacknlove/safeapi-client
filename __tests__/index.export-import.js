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
  safeApi.conf.server = 'http://test/'
  fetch.mockImplementation(ok)
  await safeApi.createKey()
})

describe('import-export', () => {
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
    safeApi.setPlainPassword('pass')
    const credenciales = await safeApi.toText()
    jest.spyOn(console, 'warn').mockImplementation()
    safeApi.setPlainPassword('puss')
    await assert.rejects(safeApi.fromText(credenciales))
    assert(console.warn.mock.calls.length === 1)
  })
})
