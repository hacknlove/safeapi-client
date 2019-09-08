const safeApi = require('../src')
const safeApiFile = require('../src/file')

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

    const promise = safeApiFile.fromFile()

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

    const promise = safeApiFile.fromFile()
    jest.runOnlyPendingTimers()
    assert.rejects(promise, new Error('TimedOut'))
  })
  it('toFile guarda en un archivo', async () => {
    expect.assertions(1)
    saveAs.mockImplementation(() => {
      expect(true).toBe(true)
    })
    await safeApiFile.toFile()
  })
})
