const { passtokey } = require('../src/passtokey')
// global.btoa = string => Buffer.from(string).toString('base64')

describe('node environment', () => {
  it('passtokey devuelve un string', () => {
    assert(typeof passtokey('algo') === 'string')
  })

  it('dos passwords diferentes devuelven dos keys diferentes', () => {
    assert(passtokey('algo') !== passtokey('otro'))
  })
})

describe('browser environment', () => {
  process.browser = true
  it('passtokey devuelve un string', () => {
    assert(typeof passtokey('algo') === 'string')
  })

  it('dos passwords diferentes devuelven dos keys diferentes', () => {
    assert(passtokey('algo') !== passtokey('otro'))
  })
})
