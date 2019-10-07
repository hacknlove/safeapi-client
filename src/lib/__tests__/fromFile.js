import { fromFile } from '../fromFile'
import { fromText } from '../fromText'
import { Promise } from 'bluebird'
global.Promise = Promise

jest.mock('../fromText')

jest.useFakeTimers()

describe('fromFile', () => {
  it('carga las credenciales desde un archivo', async () => {

    const input = {
      click: jest.fn()
    }
    const FileReader = {
      readAsText: jest.fn()
    }
    fromText.mockReturnValue('textCredentials')
    document.createElement = jest.fn(() => input)
    global.FileReader = jest.fn(() => FileReader)

    const promise = fromFile()

    expect(input.onchange).not.toBeUndefined()

    input.onchange({
      target: {
        files: ['archivo']
      }
    })

    expect(FileReader.onload).not.toBeUndefined()
    FileReader.onload({
      target: {
        result: 'textCredentials'
      }
    })
    await promise
  })
  it('rejects si pasan más de 30 segundos sin que se seleccione ningún archivo', async () => {
    const input = {
      click () {}
    }
    jest.spyOn(document, 'createElement').mockReturnValue(input)

    const promise = fromFile()
    jest.runOnlyPendingTimers()
    await promise.catch(e => e)
    expect(promise.isRejected()).toBe(true)
  })
})
