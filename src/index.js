const jwt = require('jsonwebtoken')
const shajs = require('sha.js')
const jose = require('node-jose')
const saveAs = require('file-saver')
const { decrypt, encrypt } = require('./symetric')
const { passtokey } = require('./passtokey')
const fetchHelper = require('@hacknlove/fetchhelper')
const store = require('@hacknlove/reduxplus')
require('@hacknlove/substore')

function hash (request) { // tested
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

async function keyPOST (self, data, server) {
  var [uuid, error] = await fetchHelper(`${server}key`, {
    method: 'POST',
    json: {
      ...data,
      publicKey: self.public
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (uuid && !uuid.error) {
    self.uuid = uuid
  }
  return [uuid, error]
}

async function keyPUT (self, data, server) {
  return fetchHelper(`${server}key/${self.uuid}`, {
    method: 'PUT',
    json: {
      ...data,
      publicKey: self.public
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

class SafeApi {
  constructor () {
    var pem = ''
    var password = ''

    this.uuid = ''
    this.algorithm = 'ES384'
    this.expiresIn = 120
    this.server = ''
    this.storeAddress = `safeapi-client/${this.server}/${this.uuid}`
    this.store = store.subStore('')

    this.fromText = async (text) => { // tested
      const credentials = await decrypt(text, password)
      pem = credentials.pem

      this.public = await jose.JWK.asKey(pem, 'pem').then(key => key.toPEM(false))
      this.uuid = credentials.uuid
      this.algorithm = credentials.algorithm
    }

    this.sign = async (options = {}) => { // tested
      const {
        method = 'GET',
        body = {},
        url = '/',
        expiresIn
      } = options

      return jwt.sign({
        iss: this.uuid,
        sub: this.hash({
          body,
          method,
          url
        })
      }, pem, {
        algorithm: this.algorithm,
        expiresIn: expiresIn || this.expiresIn
      })
    }

    this.toText = async () => { // tested
      return encrypt({
        uuid: this.uuid,
        pem,
        algorithm: this.algorithm
      }, password)
    }

    this.newKey = async () => { // tested
      const key = await jose.JWK.createKey(...creation[this.algorithm])
      pem = key.toPEM(true)
      this.public = await jose.JWK.asKey(pem, 'pem').then(key => key.toPEM(false))
    }

    this.getHashedPassword = () => { // tested
      return password
    }

    this.setPlainPassword = (pass) => { // tested
      password = passtokey(pass || '')
      return password
    }

    this.setHashedPassword = (pass) => { // tested
      password = pass
    }
  }

  async fetch (url, options = {}) { // tested
    var {
      method = 'GET',
      body,
      headers
    } = options

    const Authorization = await this.sign({
      method,
      url,
      body
    })

    return fetchHelper([
      `${this.server}${url}`, {
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

  async fromFile () { // tested
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
    await this.fromText(text)
  }

  async toFile () { // tested
    const signedCredentials = await this.toText()

    var blob = new Blob([signedCredentials], { type: 'text/plain;charset=utf-8' })

    saveAs(blob, `${this.uuid}.${(new Date()).toISOString().substr(0, 19).replace(/[^0-9]/g, '')}.key`, undefined, true)
  }

  async uploadPublicKey (data) {
    const [uuid, error] = this.uuid
      ? await keyPUT(this, data, this.server)
      : await keyPOST(this, data, this.server)
    return [uuid, error]
  }
}

module.exports = new SafeApi()
module.exports.hash = hash
