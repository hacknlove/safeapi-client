import test from 'ava'
import { passtokey } from '../src/passtokey'

global.btoa = string => Buffer.from(string).toString('base64')

test('passtokey devuelve un string', t => {
  t.is(typeof passtokey('algo'), 'string')
})

test('dos passwords diferentes devuelven dos keys diferentes', t => {
  t.true(passtokey('algo') !== passtokey('otro'))
})
