const { useState, useEffect } = require('react')
const jwt = require('jsonwebtoken')
const shajs = require('sha.js')
const jose = require('node-jose')
const saveAs = require('file-saver')
const { decrypt, encrypt } = require('./symetric')
const { passtokey } = require('./passtokey')
const fetchHelper = require('@hacknlove/fetchhelper')
require('@hacknlove/substore')

var pem = ''
var password = ''
var algorithm = 'ES384'
var conf = {
  expiresIn: 120,
  server: ''
}
var publicKey = {
  pem: '',
  uuid: ''
}

const creation = {
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

const callbacks = {}
function callCallbacks () {
  Object.values(callbacks).forEach(cb => cb(publicKey.uuid))
}
async function keyPOST (data) {
  var [uuid, error] = await fetchHelper(`${conf.server}key`, {
    method: 'POST',
    json: {
      ...data,
      publicKey: publicKey
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (uuid && !uuid.error) {
    publicKey.uuid = uuid
    callCallbacks()
  }
  return [uuid, error]
}

function useUUID () {
  const [value, set] = useState(publicKey.uuid)
  useEffect(() => onUuidChange(uuid => {
    set(uuid)
  }))
  return value
}

async function keyPUT (data) {
  return fetchHelper(`${conf.server}key/${publicKey.uuid}`, {
    method: 'PUT',
    json: {
      ...data,
      pem: publicKey.pem
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

async function fromText (text) {
  const credentials = await decrypt(text, password)
  pem = credentials.pem

  publicKey.pem = await jose.JWK.asKey(pem, 'pem').then(key => key.toPEM(false))
  var oldUUID = publicKey.uuid
  publicKey.uuid = credentials.uuid
  algorithm = credentials.algorithm
  oldUUID !== publicKey.uuid && callCallbacks()
}

async function fetch (url, options = {}) { // tested
  var {
    method = 'GET',
    body,
    headers
  } = options

  const Authorization = await sign({
    method,
    url,
    body
  })

  return fetchHelper([
    `${conf.server}${url}`, {
      method,
      headers: {
        Authorization,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers
      },
      body: options.body === undefined ? '' : JSON.stringify(options.body)
    }
  ])
}

async function fromFile () {
  const text = await new Promise((resolve, reject) => {
    const clean = setTimeout(() => {
      reject(new Error('TimedOut'))
    }, 1000)

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.key'
    input.click()
    input.onchange = e => {
      var file = e.target.files[0]
      var reader = new FileReader()
      reader.readAsText(file, 'UTF-8')
      reader.onload = readerEvent => {
        clearTimeout(clean)
        resolve(readerEvent.target.result)
      }
    }
  })
  await fromText(text)
}

async function toFile () {
  const signedCredentials = await toText()

  var blob = new Blob([signedCredentials], { type: 'text/plain;charset=utf-8' })

  saveAs(blob, `${publicKey.uuid}.${(new Date()).toISOString().substr(0, 19).replace(/[^0-9]/g, '')}.key`, undefined, true)
}

async function uploadPublicKey (data) {
  const [uuid, error] = publicKey.uuid
    ? await keyPUT(data)
    : await keyPOST(data)
  return [uuid, error]
}

async function sign (options = {}) { // tested
  const {
    method = 'GET',
    body = {},
    url = '/'
  } = options

  return jwt.sign({
    iss: publicKey.uuid,
    sub: hash({
      body,
      method,
      url
    })
  }, pem, {
    algorithm,
    expiresIn: options.expiresIn || conf.expiresIn
  })
}

async function toText () {
  return encrypt({
    uuid: publicKey.uuid,
    pem,
    algorithm: algorithm
  }, password)
}

async function newKey (alg) {
  algorithm = alg || algorithm
  const key = await jose.JWK.createKey(...creation[algorithm])
  pem = key.toPEM(true)
  publicKey.pem = await jose.JWK.asKey(pem, 'pem').then(key => key.toPEM(false))
  return publicKey.pem
}

function getHashedPassword () {
  return password
}

function setPlainPassword (pass) {
  password = passtokey(pass || '')
  return password
}

function setHashedPassword (pass) {
  password = pass
}

function onUuidChange (callback) {
  var sk
  do {
    sk = Math.random().toString(36).substr(2) + (Date.now() % 1000).toString(36)
  } while (callbacks[sk])

  callbacks[sk] = callback
  return () => {
    delete callbacks[sk]
  }
}
function removeKey () {
  publicKey.uuid = ''
  callCallbacks()
}
function hash (request) { // tested
  const {
    method,
    url,
    body
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
setPlainPassword()

module.exports.fromText = fromText
module.exports.fetch = fetch
module.exports.fromFile = fromFile
module.exports.toFile = toFile
module.exports.uploadPublicKey = uploadPublicKey
module.exports.sign = sign
module.exports.toText = toText
module.exports.newKey = newKey
module.exports.setPlainPassword = setPlainPassword
module.exports.getHashedPassword = getHashedPassword
module.exports.setHashedPassword = setHashedPassword
module.exports.publicKey = publicKey
module.exports.onUuidChange = onUuidChange
module.exports.useUUID = useUUID
module.exports.removeKey = removeKey
module.exports.conf = conf
