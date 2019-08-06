const jwt = require('jsonwebtoken')
const shajs = require('sha.js')
const jose = require('node-jose')

var pem
var uuid
var algorithm = 'ES384'

var creation = {
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

async function signedFetchParameters (url, options = {}) {
  const {
    method,
    body,
    headers
  } = options

  const Authorization = await sign({
    method,
    url,
    body
  })

  if (!Authorization) {
    return undefined
  }
  return [
    url, {
      method,
      headers: {
        Authorization,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers
      },
      body: options.body === 'undefined' ? '' : JSON.stringify(options.body)
    }
  ]
}

function setCredentials (credentials) {
  pem = credentials.pem || pem
  uuid = credentials.uuid || uuid
  algorithm = credentials.algorithm || algorithm
}

async function sign (options = {}) {
  const {
    method = 'GET',
    body = options.body = {},
    url = '/',
    expiresIn = 120
  } = options

  return jwt.sign({
    iss: uuid,
    sub: hash({
      body,
      method,
      url
    })
  }, pem, {
    algorithm: algorithm,
    expiresIn
  })
}

async function createKey () {
  const key = await jose.JWK.createKey(...creation[algorithm])
  return {
    public: key.toPEM(false),
    private: key.toPEM(true)
  }
}

function hash (request) {
  const {
    method = 'GET',
    url = '/',
    body = {}
  } = request

  const parsedUrl = new URL(url, location)

  return shajs('sha256').update(JSON.stringify({
    body,
    hostname: parsedUrl.hostname,
    method,
    originalUrl: parsedUrl.pathname + parsedUrl.search,
    protocol: parsedUrl.protocol.replace(/:$/, '')
  })).digest('base64')
}

module.exports = signedFetchParameters
module.exports.setCredentials = setCredentials
module.exports.sign = sign
module.exports.createKey = createKey
