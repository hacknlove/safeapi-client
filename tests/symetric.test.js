import test from 'ava'
import { encrypt, decrypt } from '../src/symetric'

test('encrypt devuelve un string', async t => {
  const object = {
    a: 'a',
    b: 12
  }
  t.is(typeof await encrypt(object, 'password'), 'string')
})

test('decrypt descifra lo que encrypt cifra', async t => {
  const object = {
    a: 'a',
    b: 12
  }
  const enc = await encrypt(object, 'password')
  const dec = await decrypt(enc, 'password')
  t.deepEqual(dec, object)
})

test('si la contraseña no coincide lanza error', async t => {
  t.plan(1)
  const object = {
    a: 'a',
    b: 12
  }
  const enc = await encrypt(object, 'password')
  await decrypt(enc, 'passward').then(t.fail, t.pass)
})
