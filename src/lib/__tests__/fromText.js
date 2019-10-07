import { fromText } from '../fromText'
import { decrypt } from '../symmetric'
import jose from 'node-jose'
import { secret, credentials } from '../data'

jest.mock('../symmetric')
jest.mock('node-jose')

describe('fromText', () => {
  it('fromText importa las credenciales en texto', async () => {
    decrypt.mockReturnValue({
      pem: 'newPem',
      algorithm: 'newAlgorithm',
      uuid: 'newUUID'
    })

    jose.JWK.asKey.mockImplementation(() => Promise.resolve({
      toPEM () {
        return 'newPublicPem'
      }
    }))

    secret.password = 'password'
    await fromText('text')

    expect(decrypt).toHaveBeenCalledWith('text', 'password')
    expect(secret.pem).toBe('newPem')
    expect(credentials.algorithm).toBe('newAlgorithm')
    expect(credentials.uuid).toBe('newUUID')
    expect(credentials.pem).toBe('newPublicPem')
  })
})
