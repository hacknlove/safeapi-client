const safeApi = require('../src')

describe('exports', () => {
  it('exports all the public method', () => {
    assert(safeApi.conf)
    assert(safeApi.createKey)
    assert(safeApi.fetch)
    assert(safeApi.fromText)
    assert(safeApi.hash)
    assert(safeApi.getHashedPassword)
    assert(safeApi.logout)
    assert(safeApi.publicKey)
    assert(safeApi.renewKey)
    assert(safeApi.setHashedPassword)
    assert(safeApi.toText)
  })
})
