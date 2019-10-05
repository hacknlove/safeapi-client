import { conf, creation, credentials, secret } from './data'
import jose from 'node-jose'
import fetchHelper from '@hacknlove/fetchhelper'
import { set } from 'onget'

export async function createKey (data, alg) {
  const newAlgorithm = alg || conf.algorithm

  const key = await jose.JWK.createKey(...creation[newAlgorithm])
  const newPublicKey = key.toPEM(false)

  var [uuid, error] = await fetchHelper(`${conf.server}key`, {
    method: 'POST',
    json: {
      ...data,
      pem: newPublicKey
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (uuid) {
    credentials.pem = newPublicKey
    secret.pem = key.toPEM(true)
    credentials.algorithm = newAlgorithm
    credentials.uuid = uuid
    set('dotted://uuid', uuid)
  }

  return [uuid, error]
}
