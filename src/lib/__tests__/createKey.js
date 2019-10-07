import { createKey } from '../createKey'
import fetchHelper from '@hacknlove/fetchhelper'
import { credentials } from '../data'

jest.mock('@hacknlove/fetchhelper')

describe('createKey', () => {
  afterEach(() => {
    Object.keys(credentials).forEach(key => delete credentials[key])
  })

  it('if ok sets the credentials', async () => {
    fetchHelper.mockReturnValue(['newUUID'])

    await createKey()
    expect(credentials.pem).toMatch(/^-----BEGIN PUBLIC KEY-----/)
    expect(credentials.uuid).toBe('newUUID')
  })

  it('send the public key by POST', async () => {
    await createKey()

    expect(fetchHelper.mock.calls[0][1].method).toBe('POST')
  })

  it('if error returns [null, error] and set no credentials', async () => {
    fetchHelper.mockReturnValue([null, 'error'])

    const [res, error] = await createKey()

    expect(res).toBeNull()
    expect(error).toBe('error')
    expect(credentials.uuid).toBeUndefined()
    expect(credentials.pem).toBeUndefined()
  })
})
