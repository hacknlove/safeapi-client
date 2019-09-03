process.browser = true
const { passtokey } = require('../src/passtokey')
// global.btoa = string => Buffer.from(string).toString('base64')

test('passtokey devuelve un string', () => {
  assert(typeof passtokey('algo') === 'string')
})

test('dos passwords diferentes devuelven dos keys diferentes', () => {
  assert(passtokey('algo') !== passtokey('otro'))
})
