import { hash } from '../hash'

describe('hash', () => {
  it('not throw', () => {
    expect(() => {
      hash({})
    }).not.toThrow()
  })
})
