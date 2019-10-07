import { renewKey } from '../renewKey'
import { sFetch } from '../sFetch'
import { credentials } from '../data'

jest.mock('../sFetch')

describe('renewKey', () => {
  it('ok', async () => {
    sFetch.mockReturnValue(['sFetchRes'])

    credentials.uuid = 'nuevoUUID'

    const [response] = await renewKey()

    expect(credentials.uuid).toBe('nuevoUUID')
    expect(response).toBe('sFetchRes')
  })
})
