import jose from 'node-jose'
import { credentials, secret, conf, creation } from './data'
import { sFetch } from './sFetch'

export async function renewKey (data = {}, alg) {
  const algorithm = alg || credentials.algorithm || conf.algorithm

  const key = await jose.JWK.createKey(...creation[algorithm])
  const publicKey = key.toPEM(false)

  const [res, err] = await sFetch(`key/${publicKey.uuid}`, {
    method: 'PUT',
    body: {
      ...data,
      pem: publicKey
    }
  })

  if (res) {
    secret.pem = key.toPEM(true)
    credentials.pem = key.toPEM(false)
    credentials.algorithm = algorithm
  }

  return [res, err]
}
