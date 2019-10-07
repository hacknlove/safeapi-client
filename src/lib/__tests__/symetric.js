import { encrypt, decrypt } from '../symmetric'

test('encrypt devuelve un string', async () => {
  const object = {
    a: 'a',
    b: 12
  }
  expect(typeof await encrypt(object, 'password')).toBe('string')
})

test('decrypt descifra lo que encrypt cifra', async () => {
  const object = {
    a: 'a',
    b: 12
  }
  const enc = await encrypt(object, 'password')
  const dec = await decrypt(enc, 'password')
  expect(dec).toStrictEqual(object)
})

test('si la contraseña no coincide lanza error', async () => {
  const object = {
    a: 'a',
    b: 12
  }
  jest.spyOn(console, 'warn').mockImplementation()
  const enc = await encrypt(object, 'password')
  const dec = await decrypt(enc, 'passward').catch(e => ({ error: e }))

  expect(console.warn).toHaveBeenCalled()
  expect(dec.error).not.toBeUndefined()
})
