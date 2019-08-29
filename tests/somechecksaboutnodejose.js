import test from 'ava'
const jose = require('node-jose')

test('Leer un es asincrono', async t => {
  const key = await jose.JWK.createKey('EC', 'P-384')
  var pem = key.toPEM(true)
  var i = 0
  jose.JWK.asKey(pem, 'pem').then(key => {
    t.is(i++, 1)
  })
  t.is(i++, 0)
})
