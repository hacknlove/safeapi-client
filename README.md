# safeapi-client

## Install
```
npm i safeapi-client
```

## Usage
```javascript
import safeApi from 'safeapi-client'
safeApi.server = 'https://example.com/'
async function example1 () {
  await safeApi.newKey()
  await safeApi.uploadPublicKey() // New keys must be uploaded before be used
  localStorage.keys = safeApi.toText()
  // ...

  const [ response, error ] = safeApi.fetch('endpoint', options) // https://example.com/endpoint
}
```

```javascript
import safeApi from 'safeapi-client'

async function example1 () {
  safeApi.server = 'https://example.com/'
  safeApi.fromText(localStorage.keys)

  const [ response, error ] = safeApi.fetch('endpoint', options) // https://example.com/endpoint
}
```

## API
### `uploadPublicKey(data, server?)`
Sends the public key to the safeApi-server indicated by the parameter `server` or by `this.server`

if exists `this.uuid` it performs a `PUT` to update the public key asigned to that `uuid`.
if not, it performs a `POST`, and assings the returned `uuid` to `this.uuid`

In `data` you can set more parameters to be sent in the json


### safeApi.conf.server
The prefix to the fetchs.
`safeApi.server` defaults to `''`

### safeApi.conf.expiresIn
The expiration time, in seconds, of the signatures. defaults to 120 seconds.

### safeApi.publicKey.pem
The public PEM. Or '' if not key has been created or set.

### safeApi.publicKey.uuid
The UUID that uses the server to identify the public key

### newKey(algorithm)
Set the algorithm that will be used to sign the requests, and creates a new pair of keys.

Returns a promise that will be resolved with the public PEM

After the promise is resolved, the public PEM can be find at `safeApi.publicKey.pem`

`algorithm` can be one of:

* `'RS256'`
* `'RS384'`
* `'RS512'`
* `'PS256'`
* `'PS384'`
* `'PS512'`
* `'ES256'`
* `'ES384'`
* `'ES512'`

The credentials are not completed and `safeApi.sign` neither `safeApi.fetch+` should not be called until they get an `uuid`

### uploadPublicKey([data])
Uploads the public key to the server indicated in `safeApi.conf.server` which uses `safeapi-server`

You can use data to set more members to the body that will be sent.

Returns a promise that will resolve to `[uuid, error]`

If no error has ocurred, `uuid` will be the `uuid` that you can find also at `safeApi.publicKey.uuid`, and `error` will be `undefined`

Is some error has ocurred, `uuid` will be null, and `error` will be an object with the error.

### setPlainPassword(password)
Hash the plain-password, and det the hashed-password that will be used to export and import the credentials.

Returns the hashed password.

The plain password is not kept, and there is no way to get the plain password.

If no password is set, the empty string is used.

### getHashedPassword()
Returns the hashed-password.

### setHashedPassword(hashedPassword)
Sets the hased-password

### toText()
Exports the encrypted credentials to a string.

Returns a promise that resolves to that string.

### fromText()
Imports the encrypted credentials from a string.

Returns a promise that resolves to undefined

### toFile()
Save the encrypted credentials to a file.

Returns a promise that resolves to undefined

### fromFile()
Opens a FileOpen dialog, and import the encrypted credentials from the choosen file.

Returns a promise that resolves to undefined

### fetch(url, options)
Makes a fetch to `safeApi.conf.server + url`

You can set `options` the same way you do with browser's `fetch`, but in `options.body` place no JSON but a javascript object.

Returns a promise that resolves to `[response, error]`, where `response` is the payload, JSONparsed or null if some error has happend, in which case, `error` contains the error.

### sign(request)

Return a prmise that will resolved to the signed jwt for the request.

* `method`: `'DELETE'`, `'GET'`, `'POST'`, `'PUT'`...
* `url`: the url of the request. `safeApi.conf.server` is not prefixed here. You should do it if needed.
* `body`: the body of the request. Place here no JSON, but a javascript object.
* `expiresIn`: Overrides `safeApi.conf.expiresIn`
