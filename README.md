# safeapi-client

## Install
```
npm i safeapi-client
```

## Usage
```javascript
import safeApi from 'safeapi-client'

async function example1 () {
  await safeApi.newKey()
  await safeApi.uploadPublicKey('https://example.com/')
  safeApi.toLocalStorage()

  // ...

  const [ response, error ] = safeApi.fetch('endpoint', options) // https://example.com/endpoint
}
```

```javascript
import safeApi from 'safeapi-client'

async function example1 () {
  safeApi.server = 'https://example.com/'
  safeApi.fromLocalStorage()

  const [ response, error ] = safeApi.fetch('endpoint', options) // https://example.com/endpoint
}
```

## API

### `new SafeApi(options)`
```
Creates a new safeApi instance

In options you can set

* `pem`: Private key in PEM format. If you set the private key this way, you must wait the promise this.wait to resolve, before use anything related with the public key.
* `uuid`: The uuid that identifies the key in the server
* `algorithm`: One of `"RS256"` `"RS384"` `"RS512"` `"PS256"` `"PS384"` `"PS512"` `"ES256"` `"ES384"` `"ES512"`
* `password`: The clientside password to save and read private key
* `expiresIn`: Seconds that last valid the signed requests
* public: in case you set manually the private key, you can



### `async fetch(url, options)`

`url` and `options` are the parameters you want to use with browser's `fetch`

returns `[response, error]`

### `async .fromFile()`
Open a openfile dialog to select a saved credentials file, and then load it.

### `async .fromLocalStorage()`
Load the credentials from `localStorage.safeApi`

### `async .fromText(text)`
Load the credentials from `text`

### `.hash(request)`
Returns the sha256 of the request, like the one that is used to sign the request.

* `method`: `DELETE`, `GET`, `POST`, `PUT`...
* `url`: the url of the request
* `body`: the body of the request

If the body is JSON, do not stringify it.

### `.memorizePassword()`
Store the hashed password at `localStorage.safeApiPassword`

### `async .newKey()`
Creates a new pair of keys, private and public

### `.setPassword(password)`
Setter that hash the password

### `.public`
Atribute with the public key in PEM format.
Readonly. Do not use it to set a public key.

### `.rememberPassword`
Recover the hashed password from `localStorage.password`

### `.sign(request)`

Return a signed jwt for the request.

* `method`: `DELETE`, `GET`, `POST`, `PUT`...
* `url`: the url of the request
* `body`: the body of the request
* `expiresIn`: Overrides this.expiresIn

If the body is JSON, do not stringify it.

### `.toFile()`
Save a file with the encrypted credentials

### `.toLocalStorage`
Store the encrypted credentials in `localStorage.safeApi`

### `.toText()`
Returns the encrypted credentials

### `uploadPublicKey(data, server?)`
Sends the public key to the safeApi-server indicated by the parameter `server` or by `this.server`

if exists `this.uuid` it performs a `PUT` to update the public key asigned to that `uuid`.
if not, it performs a `POST`, and assings the returned `uuid` to `this.uuid`

In `data` you can set more parameters to be sent in the json
