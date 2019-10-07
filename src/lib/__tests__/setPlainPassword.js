import { setPlainPassword } from '../setPlainPassword'
import { secret } from '../data'

describe('setPlainPassword', () => {
  beforeEach(() => { secret.password = 42 })

  it('set, and returns the hashed password', () => {
    expect(setPlainPassword('pass')).not.toBe('pass')
    expect(setPlainPassword('pass')).not.toBe(setPlainPassword('puss'))
  })
  it('the parameter defaults to ""', () => {
    expect(setPlainPassword()).toBe(setPlainPassword(''))
  })
  it('store the hashed password in secret', () => {
    expect(setPlainPassword('pass')).toBe(secret.password)
  })
})
