import { passToKey } from '../passToKey'

describe('passToKey node', () => {
  it('devuelve un string', () => {
    expect(typeof passToKey('algo')).toBe('string')
  })

  it('dos passwords diferentes devuelven dos keys diferentes', () => {
    expect(passToKey('algo')).not.toBe(passToKey('otro'))
  })
})
