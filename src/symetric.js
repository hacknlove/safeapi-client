const jose = require('node-jose')

async function decrypt (text, password) {
  const key = await jose.JWK.asKey({
    kty: 'oct',
    k: password
  })

  const decrypted = await jose.JWE.createDecrypt(key).decrypt(text).catch(e => console.log(e) || {
    error: e
  })

  if (decrypted.error) {
    throw decrypted.error
  }

  return JSON.parse(decrypted.payload.toString())
}

async function encrypt (object, password) {
  const key = await jose.JWK.asKey({
    kty: 'oct',
    k: password
  })

  return jose.JWE.createEncrypt({
    format: 'compact'
  }, key).update(JSON.stringify(object)).final()
}

exports.encrypt = encrypt
exports.decrypt = decrypt
