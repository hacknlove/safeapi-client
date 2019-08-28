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

class SafeApi {
  constructor (options) {
    const {
      pem,
      uuid,
      algorithm,
      password,
      expiresIn
    } = options
    this.pem = pem || ''
    this.uuid = uuid || ''
    this.algorithm = algorithm || 'ES384'
    this.password = passtokey(password)
    this.expiresIn = expiresIn || 120
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
    await this.fromText(text, this.password)
    return this
  }

  async fromLocalStorage () {
    await this.fromText(localStorage.safeApi, this.password)
    return this
  }

  async fromText (text) {
    const {
      pem,
      uuid,
      algorithm
    } = await decrypt(text, this.password)
    this.pem = pem
    this.uuid = uuid
    this.algorithm = algorithm
    return this
  }

  async fetch (url, options = {}) {
    if (!this.pem) {
      return [url, options]
    }
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

  memorizePassword () {
    localStorage.password = this.password
    return this
  }

  async newPem () {
    const key = await jose.JWK.createKey(...creation[this.algorithm])
    this.pem = key.toPEM(true)
    return this
  }

  set password (password) {
    this.password = passtokey(password || '')
    return this
  }

  get public () {
    return jose.JWK.asKey(this.pem, 'pem').then(key => key.toPEM(false))
  }

  rememberPassword () {
    this.password = localStorage.password
    return this
  }

  async sign (options = {}) {
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
    }, this.pem, {
      algorithm: this.algorithm,
      expiresIn: expiresIn || this.expiresIn
    })
  }

  async toFile () {
    const signedCredentials = await this.toText()

    var blob = new Blob([signedCredentials], { type: 'text/plain;charset=utf-8' })

    saveAs(blob, `${this.uuid}.${(new Date()).toISOString().substr(0, 19).replace(/[^0-9]/g, '')}.key`, undefined, true)
  }

  async toLocalStorage () {
    localStorage.safeApi = await this.toText()
  }

  async toText () {
    return encrypt({
      uuid: this.uuid,
      pem: this.pem,
      algorithm: this.algorithm
    }, this.password)
  }
}

module.exports = SafeApi
