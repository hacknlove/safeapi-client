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
  safeApi.conf.server = 'https://example.com/api'
  await safeApi.createKey()
  safeApi.setPlainPassword('password')
  localStorage.keys = safeApi.toText()
  // ...

  const [ response, error ] = safeApi.fetch('endpoint', options) // https://example.com/endpoint
}
```

```javascript
import safeApi from 'safeapi-client'

async function example1 () {
  safeApi.server = 'https://example.com/'
  safeApi.setPlainPassword('password')
  safeApi.fromText(localStorage.keys)

  const [ response, error ] = safeApi.fetch('endpoint', options) // https://example.com/endpoint
}
```

## API

### safeApi.conf.server
The prefix to the fetchs.
`safeApi.server` defaults to `''`

### safeApi.conf.expiresIn
The expiration time, in seconds, of the signatures. defaults to 120 seconds.

### safeApi.conf.checkInterval
The interval in seconds to check, against the server, that the key is still valid. defaults to 300 seconds.
Each time, a fetch is done, the interval resets.

### safeApi.publicKey.pem
The public PEM. Or '' if not key has been created or set.

### safeApi.publicKey.uuid
The UUID that uses the server to identify the public key

### createKey([data, [algorithm]])
Creates a new pair of keys and upload the public one to the server that should include `safeapi-server`.

You can put in `data` any data you need, but you must let `data.pem` free, because it is used to upload the public key.

Returns a promise that will be resolved to `[uuid, error]`

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

### renewKey([data, [algorithm]])
Creates a new pair of keys and upload the public one to the server, to update the key assigned to the current `uuid`

You can put in `data` any data you need, but you must let `data.pem` free, because it is used to upload the public key.

Returns a promise that will be resolved to `[uuid, error]`

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

### onUuidChange(callback)
Adds a callback that will be called, with the UUID as first parameter, and a optional second parameter that could contain the reason of the UUID change, each time the uuid changes.

Returns a function to remove the callback.

### useUUID()
React hook that returns the UUID and refresh the component each time the UUID changes

### logout()
Remove locally the credentials, calls the `onUuidChange`'s callbaks and the `useUUID`'s hooks
