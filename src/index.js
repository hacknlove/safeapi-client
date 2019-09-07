const { useState, useEffect } = require('react')
const jwt = require('jsonwebtoken')
const shajs = require('sha.js')
const jose = require('node-jose')
const saveAs = require('file-saver')
const { decrypt, encrypt } = require('./symetric')
const { passtokey } = require('./passtokey')
const fetchHelper = require('@hacknlove/fetchhelper')

var algorithm = 'ES384'

var publicKey = {
  pem: '',
  uuid: ''
}

const callbacks = {}

var conf = {
  expiresIn: 120,
  checkInterval: 300,
  server: ''
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

var password = ''

var pem = ''

var nextTestCredencials

function callCallbacks (reason) {
  Object.values(callbacks).forEach(cb => cb(publicKey.uuid, reason))
}

async function createKey (data, alg) {
  await newKey(alg)
  return keyPOST(data)
}

async function fetch (url, options = {}) {
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

  const [res, error] = await fetchHelper([
    `${conf.server}${url}`, {
      method,
      headers: {
        Authorization,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    }
  ])
  if (res && res.authError) {
    logout('Bad credentials')
  } else {
    scheduleTestCredentials()
  }
  return [res, error]
}

async function fromFile () {
  const text = await new Promise((resolve, reject) => {
    const clean = setTimeout(() => {
      reject(new Error('TimedOut'))
    }, 60000)

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
  return fromText(text)
}

async function fromText (text) {
  const credentials = await decrypt(text, password)
  pem = credentials.pem
  publicKey.pem = await jose.JWK.asKey(pem, 'pem').then(key => key.toPEM(false)).catch(e => {
    console.log(JSON.stringify({ credentials, text, password }))
    throw e
  })
  var oldUUID = publicKey.uuid
  publicKey.uuid = credentials.uuid
  algorithm = credentials.algorithm
  oldUUID !== publicKey.uuid && callCallbacks()
  return testCredentials()
}

function getHashedPassword () {
  return password
}

function hash (request) {
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

async function keyPOST (data) {
  var [uuid, error] = await fetchHelper(`${conf.server}key`, {
    method: 'POST',
    json: {
      ...data,
      pem: publicKey.pem
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (uuid && !uuid.error) {
    publicKey.uuid = uuid
    callCallbacks()
    scheduleTestCredentials()
  }
  return [uuid, error]
}

function logout (reason) {
  publicKey.uuid = ''
  publicKey.pem = ''
  pem = ''
  clearTimeout(nextTestCredencials)
  callCallbacks(reason)
}

async function newKey (alg) {
  algorithm = alg || algorithm
  const key = await jose.JWK.createKey(...creation[algorithm])
  pem = key.toPEM(true)
  publicKey.pem = key.toPEM(false)
  return publicKey.pem
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

async function renewKey (data = {}, alg) {
  const newAlgorithm = alg || algorithm
  const newkey = await jose.JWK.createKey(...creation[newAlgorithm])
  const newPublicKey = newkey.toPEM(false)

  const [res, err] = await fetch(`key/${publicKey.uuid}`, {
    method: 'PUT',
    body: {
      ...data,
      pem: newPublicKey
    }
  })

  if (res && res.ok === true) {
    pem = newkey.toPEM(true)
    publicKey.pem = newkey.toPEM(false)
    algorithm = newAlgorithm
    scheduleTestCredentials()
  }

  return [res, err]
}

function setPlainPassword (pass) {
  password = passtokey(pass || '')
  return password
}

function setHashedPassword (pass) {
  password = pass
}

async function sign (options) {
  const {
    method,
    body = {},
    url
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

async function testCredentials () {
  const [res] = await fetch('key/')
  if (res && res.error) {
    logout('Bad credentials')
    return false
  }
  return true
}

function scheduleTestCredentials () {
  clearTimeout(nextTestCredencials)
  nextTestCredencials = setTimeout(testCredentials, conf.checkInterval * 1000)
  return true
}

async function toFile () {
  const signedCredentials = await toText()

  var blob = new Blob([signedCredentials], { type: 'text/plain;charset=utf-8' })

  saveAs(blob, `${publicKey.uuid}.${(new Date()).toISOString().substr(0, 19).replace(/[^0-9]/g, '')}.key`, undefined, true)
}

async function toText () {
  return encrypt({
    uuid: publicKey.uuid,
    pem,
    algorithm: algorithm
  }, password)
}

function useUUID () {
  const [value, set] = useState(publicKey.uuid)
  useEffect(() => onUuidChange(uuid => {
    set(uuid)
  }))
  return value
}

setPlainPassword()

module.exports.createKey = createKey
module.exports.fromText = fromText
module.exports.fetch = fetch
module.exports.fromFile = fromFile
module.exports.toFile = toFile
module.exports.toText = toText
module.exports.setPlainPassword = setPlainPassword
module.exports.getHashedPassword = getHashedPassword
module.exports.setHashedPassword = setHashedPassword
module.exports.publicKey = publicKey
module.exports.onUuidChange = onUuidChange
module.exports.useUUID = useUUID
module.exports.logout = logout
module.exports.renewKey = renewKey
module.exports.conf = conf
module.exports.testCredentials = testCredentials
module.exports.scheduleTestCredentials = scheduleTestCredentials
