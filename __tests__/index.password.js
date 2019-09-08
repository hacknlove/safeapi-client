const safeApi = require('../src')

describe('setPlainPassword', () => {
  it('set, and returns the hashed password', () => {
    assert(safeApi.setPlainPassword('pass') !== 'pass')
    assert(safeApi.setPlainPassword('pass') !== safeApi.setPlainPassword('puss'))
  })
  it('no pasar pass es como pasar un string vacio', () => {
    assert(safeApi.setPlainPassword() === safeApi.setPlainPassword(''))
  })
  it('obtiene el password hasheado', () => {
    assert(safeApi.setPlainPassword('pass') === safeApi.getHashedPassword())
  })
  it('setHashedPassword establece el password hasheado', () => {
    const password = safeApi.setPlainPassword('pass')
    safeApi.setPlainPassword('puss')
    safeApi.setHashedPassword(password)
    assert(safeApi.getHashedPassword() === password)
  })
})
