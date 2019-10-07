import { toFile } from '../toFile'
import { toText } from '../toText'
import saveAs from 'file-saver'

jest.mock('file-saver')
jest.mock('../toText')

describe('toFile', () => {
  it('ok', async () => {
    toText.mockReturnValue('credentials')
    await toFile()
    expect(toText).toHaveBeenCalled()
    expect(saveAs).toHaveBeenCalled()
  })
})
