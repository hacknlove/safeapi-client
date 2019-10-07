import jose from 'node-jose'

export async function decrypt (text, password) {
  const key = await jose.JWK.asKey({
    kty: 'oct',
    k: password
  })

  const decrypted = await jose.JWE.createDecrypt(key).decrypt(text).catch(e => console.warn(e) || {
    error: e
  })

  if (decrypted.error) {
    throw decrypted.error
  }
  return JSON.parse(decrypted.payload.toString())
}

export async function encrypt (object, password) {
  const key = await jose.JWK.asKey({
    kty: 'oct',
    k: password
  })

  return jose.JWE.createEncrypt({
    format: 'compact'
  }, key).update(JSON.stringify(object)).final()
}
