const jwt = require('jsonwebtoken')
const shajs = require('sha.js')
const jose = require('node-jose')
const saveAs = require('file-saver')
const { decrypt, encrypt } = require('./symetric')
const { passtokey } = require('./passtokey')
const fetchHelper = require('@hacknlove/fetchhelper')

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
      publicKey: this.public
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (error) {
    throw error
  }
  if (uuid.error) {
    throw uuid
  }
  self.uuid = uuid
}

async function keyPUT (self, data, server) {
  var [uuid, error] = await fetchHelper(`${server}key/${self.uuid}`, {
    method: 'PUT',
    json: {
      ...data,
      publicKey: this.public
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (error) {
    throw error
  }
  if (uuid.error) {
    throw uuid
  }
}

class SafeApi {
  constructor (options) {
    var pem = options.pem
    var password = options.password

    this.uuid = options.uuid || false
    this.algorithm = options.algorithm || 'ES384'
    this.expiresIn = options.expiresIn || 120
    this.server = options.server || ''

    if (pem) {
      this.wait = new Promise((resolve) => {
        jose.JWK.asKey(pem, 'pem').then(key => {
          this.public = key.toPEM(false)
          resolve()
        })
      })
    }

    this.fromText = async (text) => {
      const credentials = await decrypt(text, password)
      pem = credentials.pem

      this.public = await jose.JWK.asKey(pem, 'pem').then(key => key.toPEM(false))
      this.uuid = credentials.uuid
      this.algorithm = credentials.algorithm
    }

    this.sign = async (options = {}) => {
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

    this.toText = async () => {
      return encrypt({
        uuid: this.uuid,
        pem,
        algorithm: this.algorithm
      }, password)
    }

    this.newKey = async () => {
      const key = await jose.JWK.createKey(...creation[this.algorithm])
      pem = key.toPEM(true)
      this.public = await jose.JWK.asKey(pem, 'pem').then(key => key.toPEM(false))
    }

    this.memorizePassword = () => {
      localStorage.safeApiPassword = password
    }

    this.setPassword = (password) => {
      password = passtokey(password || '')
    }

    this.rememberPassword = () => {
      password = localStorage.password
    }
  }

  async fetch (url, options = {}) {
    var {
      method,
      body,
      headers
    } = options

    const Authorization = await this.sign({
      method,
      url,
      body
    })

    return fetchHelper([
      url, {
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

  async fromFile () {
    const text = await new Promise((resolve, reject) => {
      const clean = setTimeout(() => {
        reject(new Error('TimedOut'))
      }, 30000)

      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.key'
      input.click()
      input.onchange = e => {
        var file = e.target.files[0]
        var reader = new FileReader()
        reader.readAsText(file, 'UTF-8')
        reader.onload = async readerEvent => {
          clearTimeout(clean)
          resolve(readerEvent.target.result)
        }
      }
    })
    await this.fromText(text)
  }

  async fromLocalStorage () {
    await this.fromText(localStorage.safeApi)
  }

  hash (request) {
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

  async toFile () {
    const signedCredentials = await this.toText()

    var blob = new Blob([signedCredentials], { type: 'text/plain;charset=utf-8' })

    saveAs(blob, `${this.uuid}.${(new Date()).toISOString().substr(0, 19).replace(/[^0-9]/g, '')}.key`, undefined, true)
  }

  async toLocalStorage () {
    localStorage.safeApi = await this.toText()
  }

  async uploadPublicKey (data, server) {
    this.server = this.server || server
    if (!this.uuid) {
      return keyPOST(this, data, server || this.server)
    } else {
      return keyPUT(this, data, server || this.server)
    }
  }
}

module.exports = new SafeApi()

module.exports.SafeApi = SafeApi
