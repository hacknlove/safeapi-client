const safeApi = require('../')
const fetchHelper = require('@hacknlove/fetchhelper')
jest.mock('file-saver')
const saveAs = require('file-saver')
jest.useFakeTimers()

describe('safeApi', () => {
  var returnedUUID = 'nuevoUUID'
  beforeEach(async () => {
    fetchHelper.fetch = jest.fn((url, options) => {
      return Promise.resolve({
        ok: true,
        json () {
          return returnedUUID
        }
      })
    })
    safeApi.conf.servidor = ''
    await safeApi.createKey()
  })

  describe('createKey', () => {
    it('crea un nuevo key', async () => {
      await safeApi.createKey()
      assert(safeApi.publicKey.pem.match(/^-----BEGIN PUBLIC KEY-----/))
    })
    it('hace un POST con la clave publica para crear una nueva', async () => {
      expect.assertions(1)
      fetchHelper.fetch = jest.fn((url, options) => {
        assert(options.method === 'POST')
        expect(true).toBe(true)
        return Promise.resolve({
          ok: true,
          json () {
            return 'nuevoUUID'
          }
        })
      })
      const [uuid, error] = await safeApi.createKey()
      assert(safeApi.publicKey.uuid === 'nuevoUUID')
      assert(uuid === 'nuevoUUID')
      assert(error === undefined)
    })
    it('devuelve error si el fetch da error', async () => {
      expect.assertions(1)
      fetchHelper.fetch = jest.fn((url, options) => {
        assert(options.method === 'POST')
        expect(true).toBe(true)
        return Promise.resolve({
          ok: false
        })
      })
      safeApi.publicKey.uuid = false
      const [uuid, error] = await safeApi.createKey()
      assert(safeApi.publicKey.uuid === false)
      assert(uuid === null)
      assert.deepStrictEqual(error, { ok: false })
    })
  })
  describe('setPlainPassword', () => {
    it('hashea, establece password y devuelve el password hasheado', () => {
      assert(safeApi.setPlainPassword('pass') !== 'pass')
      assert(safeApi.setPlainPassword('pass') !== safeApi.setPlainPassword('puss'))
    })
    it('no pasar pass es como pasar un string vacio', () => {
      assert(safeApi.setPlainPassword() === safeApi.setPlainPassword(''))
    })
    it('obtiene el password hasheado', () => {
      assert(safeApi.setPlainPassword('pass') === safeApi.getHashedPassword())
    })
  })
  it('setHashedPassword establece el password hasheado', () => {
    const password = safeApi.setPlainPassword('pass')
    safeApi.setPlainPassword('puss')
    safeApi.setHashedPassword(password)
    assert(safeApi.getHashedPassword() === password)
  })
  it('toText exporta las credenciales en texto', async () => {
    assert(await safeApi.toText())
  })
  describe('fromText', () => {
    it('fromText importa las credenciales en texto', async () => {
      safeApi.publicKey.uuid = 'o98l9kjh'
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
  describe('fetch', () => {
    it('envia peticiones firmadas', async () => {
      safeApi.conf.server = 'https://servidor/'
      fetchHelper.fetch = jest.fn((url, options) => {
        assert(url === 'https://servidor/enpoint')
        return Promise.resolve({})
      })
      safeApi.fetch('enpoint', {
        method: 'POST',
        body: {
          foo: 'bar'
        }
      })
    })
    it('si no se pasan opciones hace un GET', async () => {
      await safeApi.createKey()
      safeApi.conf.server = 'https://servidor/'
      fetchHelper.fetch = jest.fn((url, options) => {
        assert(options.method === 'GET')
        return Promise.resolve({})
      })
      safeApi.fetch('enpoint')
    })
  })
  it('fromFile carga las credenciales desde un archivo', async () => {
    expect.assertions(2)

    const exported = await safeApi.toText()
    const input = {
      click () {
        expect(true).toBe(true)
      }
    }
    const FileReader = {
      readAsText (file, cot) {
        expect(true).toBe(true)
        assert(file, 'archivo')
        assert(cot, 'UTF-8')
      }
    }

    jest.spyOn(document, 'createElement').mockReturnValue(input)
    jest.spyOn(global, 'FileReader').mockImplementation(() => FileReader)

    const promise = safeApi.fromFile()

    assert(input.onchange)

    input.onchange({
      target: {
        files: ['archivo']
      }
    })
    assert(FileReader.onload)
    FileReader.onload({
      target: {
        result: exported
      }
    })
    await promise
  })
  it('fromFile rejects si pasan más de 30 segundos sin que se seleccione ningún archivo', async () => {
    const input = {
      click () {}
    }
    jest.spyOn(document, 'createElement').mockReturnValue(input)

    const promise = safeApi.fromFile()
    jest.runAllTimers()
    assert.rejects(promise, new Error('TimedOut'))
  })
  it('toFile guarda en un archivo', async () => {
    expect.assertions(1)
    saveAs.mockImplementation(() => {
      expect(true).toBe(true)
    })
    await safeApi.toFile()
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
})
