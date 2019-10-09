import { secret, credentials } from './data'
import { decrypt } from './symmetric'
import jose from 'node-jose'
import { set } from 'onget'

export async function fromText (text) {
  const { pem, uuid, algorithm } = await decrypt(text, secret.password)
  secret.pem = pem

  credentials.pem = await jose.JWK.asKey(pem, 'pem').then(key => key.toPEM(false))

  credentials.uuid = uuid
  credentials.algorithm = algorithm
  set('dotted://uuid', uuid)
  return uuid
}
