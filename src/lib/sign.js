import { hash } from './hash'
import { secret, credentials, conf } from './data'

import jwt from 'jsonwebtoken'

export async function sign (options) {
  const {
    method,
    body = {},
    url
  } = options

  return jwt.sign({
    iss: credentials.uuid,
    sub: hash({
      body,
      method,
      url
    })
  }, secret.pem, {
    algorithm: credentials.algorithm,
    expiresIn: options.expiresIn || conf.expiresIn
  })
}
