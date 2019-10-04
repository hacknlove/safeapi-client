const { encrypt, decrypt } = require('../src/symmetric')

test('encrypt devuelve un string', async () => {
  const object = {
    a: 'a',
    b: 12
  }
  assert(typeof await encrypt(object, 'password') === 'string')
})

test('decrypt descifra lo que encrypt cifra', async () => {
  const object = {
    a: 'a',
    b: 12
  }
  const enc = await encrypt(object, 'password')
  const dec = await decrypt(enc, 'password')
  assert.deepStrictEqual(dec, object)
})

test('si la contraseña no coincide lanza error', async () => {
  expect.assertions(1)
  const object = {
    a: 'a',
    b: 12
  }
  jest.spyOn(console, 'warn').mockImplementation(() => {
    expect(true).toBe(true)
  })
  const enc = await encrypt(object, 'password')
  return assert.rejects(decrypt(enc, 'passward'))
})
