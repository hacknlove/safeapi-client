import { passToKey } from './passToKey'
import fetchHelper from '@hacknlove/fetchhelper'
import jwt from 'jsonwebtoken'
import shajs from 'sha.js'
import { encrypt } from './lib/symmetric'
import jose from 'node-jose'


async function fetch (url, options = {}) {
  if (!pem) {
    await waitUntilUUID()
  }
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

function getHashedPassword () {
  return password
}

function hash (request) {
  const {
    method,
    url,
    body
  } = request

  const parsedUrl = new URL(url, conf.server)
  console.log({
    body,
    hostname: parsedUrl.hostname,
    method,
    originalUrl: parsedUrl.pathname + parsedUrl.search,
    protocol: parsedUrl.protocol.replace(/:$/, '')
  })
  return shajs('sha256').update(JSON.stringify({
    body,
    hostname: parsedUrl.hostname,
    method,
    originalUrl: parsedUrl.pathname + parsedUrl.search,
    protocol: parsedUrl.protocol.replace(/:$/, '')
  })).digest('base64')
}

function logout (reason) {
  publicKey.uuid = ''
  publicKey.pem = ''
  pem = ''
  clearTimeout(nextTestCredenTials)
  callCallbacks(reason)
}

function onUuidChange (callback) {
  var sk
  do {
    sk = Math.random().toString(36).substr(2) + (Date.now() % 1000).toString(36)
  } while (onUUIDCallbacks[sk])

  onUUIDCallbacks[sk] = callback
  return () => {
    delete onUUIDCallbacks[sk]
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

function scheduleTestCredentials () {
  if (!conf.checkInterval) {
    return
  }
  clearTimeout(nextTestCredenTials)
  nextTestCredenTials = setTimeout(testCredentials, conf.checkInterval * 1000)
}

function setHashedPassword (pass) {
  password = pass
}

function setPlainPassword (pass) {
  password = passToKey(pass || '')
  return password
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
  const [res, error] = await fetch('key/')
  if (res) {
    return true
  }
  if (error.authError) {
    logout('Bad credentials')
    return false
  }
  return true
}

async function toText () {
  return encrypt({
    uuid: publicKey.uuid,
    pem,
    algorithm: algorithm
  }, password)
}

function waitUntilUUID () {
  return new Promise(resolve => {
    var unSubscribe = onUuidChange(() => {
      if (pem) {
        resolve()
        unSubscribe()
      }
    })
  })
}

setPlainPassword()

exports.conf = conf
exports.createKey = createKey
exports.fetch = fetch
exports.fromText = fromText
exports.getHashedPassword = getHashedPassword
exports.logout = logout
exports.onUuidChange = onUuidChange
exports.publicKey = publicKey
exports.renewKey = renewKey
exports.setPlainPassword = setPlainPassword
exports.setHashedPassword = setHashedPassword
exports.toText = toText

if (process.env.TEST === 'testCredentials') {
  exports.testCredentials = testCredentials
  exports.scheduleTestCredentials = scheduleTestCredentials
}
