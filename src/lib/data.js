import { set } from 'onget'

set('dotted://UUID', '')

export const creation = {
  RS256: ['RSA', 256],
  RS384: ['RSA', 384],
  RS512: ['RSA', 512],
  PS256: ['RSA', 256],
  PS384: ['RSA', 384],
  PS512: ['RSA', 512],
  ES256: ['EC', 'P-256'],
  ES384: ['EC', 'P-384'],
  ES512: ['EC', 'P-512']
}

export const conf = {
  algorithm: 'ES384',
  expiresIn: 120,
  checkInterval: 300,
  getInterval: 300,
  server: ''
}

export const credentials = {
}

export const secret = {

}
