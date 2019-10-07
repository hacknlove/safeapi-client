import { passToKey } from '../passToKey'

describe('passToKey environment', () => {
  process.browser = true
  it('passToKey devuelve un string', () => {
    expect(typeof passToKey('algo')).toBe('string')
  })

  it('dos passwords diferentes devuelven dos keys diferentes', () => {
    expect(passToKey('algo')).not.toBe(passToKey('otro'))
  })
})