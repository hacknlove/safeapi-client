const safeApi = require('../')
const jwt = require('jsonwebtoken')
const fetchHelper = require('@hacknlove/fetchhelper')
jest.mock('file-saver')
const saveAs = require('file-saver')
jest.useFakeTimers()

describe('safeApi', () => {
  it('newKey crea un nuevo key', async () => {
    await safeApi.newKey()

    assert(safeApi.public.match(/^-----BEGIN PUBLIC KEY-----/))
  })
  it('setPlainPassword hashea, establece password y devuelve el password hasheado', () => {
    assert(safeApi.setPlainPassword('pass') !== 'pass')
    assert(safeApi.setPlainPassword('pass') !== safeApi.setPlainPassword('puss'))
  })
  it('setPlainPassword, no pasar pass es como pasar un string vacio', () => {
    assert(safeApi.setPlainPassword() === safeApi.setPlainPassword(''))
  })
  it('setPlainPassword obtiene el password hasheado', () => {
    assert(safeApi.setPlainPassword('pass') === safeApi.getHashedPassword())
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
  it('fromText importa las credenciales en texto', async () => {
    safeApi.uuid = 'o98l9kjh'
    const publicKey = safeApi.public
    const credenciales = await safeApi.toText()
    await safeApi.newKey()
    safeApi.uuid = ''

    assert(safeApi.uuid !== 'o98l9kjh')
    assert(safeApi.public !== publicKey)

    await safeApi.fromText(credenciales)

    assert(safeApi.uuid, 'o98l9kjh')
    assert(safeApi.public === publicKey)
  })
  it('fromText lanza error al importar si el password no es correcto', async () => {
    expect.assertions(1)
    await safeApi.newKey()
    safeApi.uuid = 'o98l9kjh'
    safeApi.setPlainPassword('pass')
    const credenciales = await safeApi.toText()
    jest.spyOn(console, 'warn').mockImplementation(() => {
      expect(true).toBe(true)
    })
    safeApi.setPlainPassword('puss')
    await assert.rejects(safeApi.fromText(credenciales))
  })
  it('sign firma las peticiones', async done => {
    await safeApi.newKey()

    const signed = await safeApi.sign()

    jwt.verify(signed, safeApi.public, {
      ignoreExpiration: true
    }, e => {
      assert(!e)
      done()
    })
  })
  it('fetch envia peticiones firmadas', async () => {
    await safeApi.newKey()
    safeApi.server = 'https://servidor/'
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
  it('fetch, si no se pasan opciones hace un GET', async () => {
    await safeApi.newKey()
    safeApi.server = 'https://servidor/'
    fetchHelper.fetch = jest.fn((url, options) => {
      assert(options.method === 'GET')
      return Promise.resolve({})
    })
    safeApi.fetch('enpoint')
  })
  it('fromFile carga las credenciales desde un archivo', async () => {
    expect.assertions(3)
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
    jest.spyOn(safeApi, 'fromText').mockImplementation(text => {
      expect(true).toBe(true)
      assert(text === 'Credenciales')
    })
    safeApi.fromFile()

    assert(input.onchange)

    input.onchange({
      target: {
        files: ['archivo']
      }
    })
    assert(FileReader.onload)
    FileReader.onload({
      target: {
        result: 'Credenciales'
      }
    })
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
  it('hash hashea peticiones', () => {
    assert(safeApi.hash({}))
    assert(safeApi.hash({}) !== safeApi.hash({ url: '/otra' }))
  })
  it('toFile guarda en un archivo', async () => {
    expect.assertions(1)
    saveAs.mockImplementation(() => {
      expect(true).toBe(true)
    })
    await safeApi.toFile()
  })
  it('uploadPublicKey hace un POST con la clave publica para crear una nueva', async () => {
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
    safeApi.uuid = false
    const [uuid, error] = await safeApi.uploadPublicKey()
    assert(safeApi.uuid === 'nuevoUUID')
    assert(uuid === 'nuevoUUID')
    assert(error === undefined)
  })
  it('uploadPublicKey hace un POST con la clave publica para crear una nueva, devuelve error si el fetch da error', async () => {
    expect.assertions(1)
    fetchHelper.fetch = jest.fn((url, options) => {
      assert(options.method === 'POST')
      expect(true).toBe(true)
      return Promise.resolve({
        ok: false
      })
    })
    safeApi.uuid = false
    const [uuid, error] = await safeApi.uploadPublicKey()
    assert(safeApi.uuid === false)
    assert(uuid === null)
    assert.deepStrictEqual(error, { ok: false })
  })
  it('uploadPublicKey hace un PUT con la clave publica para crear una nueva', async () => {
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
    safeApi.uuid = 'nuevoUUID'
    const [response, error] = await safeApi.uploadPublicKey()
    assert(safeApi.uuid === 'nuevoUUID')
    assert(response === 'nohacenadaconesto')
    assert(error === undefined)
  })
})
