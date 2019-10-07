import { logout } from '../logout'

describe('logout', () => {
  it('ok', () => {
    expect(() => logout()).not.toThrow()
  })
})
