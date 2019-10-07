import { toText } from '../toText'
import { secret, credentials } from '../data'

secret.password = 'password'
secret.pem = 'pem'
credentials.algorithm = 'algorithm'
credentials.uuid = 'uuid'

describe('toText', () => {
  it('does not throw', async () => {
    const privateKey = await toText().catch(error => ({ error }))
    expect(privateKey.error).toBeUndefined()
  })
})
