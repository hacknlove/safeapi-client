# safeapi-client

## Install
```
npm i safeapi-client
```

## Usage
```javascript
import SafeApi from 'safeapi-client'

async function example1 () {
  const safeApi = new SafeApi()
  safeApi.newPem()

  const [ uuid ] = await fetchHelper('/api/newKey', {
    method: 'POST',
    body: JSON.stringify(safeApi.public),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  safeApi.fetch(url, options)
}
```

## API

### `new SafeApi(options)`
Creates a new safeApi instance

In options you can set

* `pem`: Private key in PEM format
* `uuid`: The uuid that identifies the key in the server
* `algorithm`: One of `"RS256"` `"RS384"` `"RS512"` `"PS256"` `"PS384"` `"PS512"` `"ES256"` `"ES384"` `"ES512"`
* `password`: The clientside password to save and read private key
* `expiresIn`: Seconds that last valid the signed requests

The public key needs to be attached with an UUID by the server, before it can be used.

### `fetch(url, options)`

`url` and `options` are the parameters you want to use with browser's `fetch`

returns `[response, error]`

### `.fromFile()`
Open a openfile dialog to select a saved credentials, and then load it.

return `this`

### `.fromLocalStorage()`
Load the credentials from `localStorage.safeApi`

return `this`

### `.fromText(text)`
Load the credentials from `text`

return `this`

### `.hash(request)`
Returns the sha256 of the request, like the one that is used to sign the request.

* `method`: `DELETE`, `GET`, `POST`, `PUT`...
* `url`: the url of the request
* `body`: the body of the request

If the body is JSON, do not stringify it.

### `.memorizePassword()`
Store the hashed password at `localStorage.safeApi` and returns `this`

### `.newPem()`
Creates a new pem

Returns `this`

### `.password = xxxxx`
Setter that hash the password

return this

### `.public`
Getter that returns the public pem

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

return `this`

### `.toLocalStorage`
Store the encrypted credentials in `localStorage.safeApi`

return `this`

### `.toText()`
Returns the encrypted credentials
