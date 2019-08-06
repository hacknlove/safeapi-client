# safeapi-client

## Install
```
npm i safeapi-client
```

## Usage
```javascript
import signFetchParameters, { createKey, setCredentials } from 'safeapi-client
import fetchHelper from '@hacknlove/fetchHelper'

async function example1 () {
  /* Create a key */
  const keys = createKey()

  /*
    Option 1.
    You upload the key, and the server gives you an uuid
    It could be some thing like:
  */
  const [ uuid ] = await fetchHelper('/api/newKey', {
    method: 'POST',
    body: JSON.stringify(keys.private),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  /*
    Option 2.
    You have yet some unique id, and you want to attach the key to it
    It could be some thing like:
  */
  setCredentialsawait fetchHelper(`/api/setKey/${uuid}`, {
    method: 'PUT',
    body: JSON.stringify(keys.private),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  /* Anyway, your credentials are the pair uuid and privatekey*/
  setCredentials({
    uuid,
    pem: keys.private
  })


  /* Now you can sign your requests */

  fetch(signFetchParameters(url, options))

}
```

## API

### `createKey()`
Creates a new key.

The public key needs to be attached with an UUID by the server, before it can be used.

### `setCredentials({pem: '...', uuid: '...', algorithm: '...'})`

It is used to set the pem, the uuid, and algorithm to be used.

### `signFetchParameters(url, options)`

`url` and `options` are the parameters you want to use with `fetch`

Returns an array [url, options] with the apropiate Authorization headers so you can do `fetch(...signFetchParameters(url, options))` or `fetchHelper(signFetchParameters(url, options))`

[@hacknlove/fetchhelper](https://github.com/hacknlove/fetchHelper)

if there is no credentials, it returns [url, options] without sign it.

### `sign(options)`

Options is a dictionary with:
* `method` defaults to `'GET'`
* `body` defaults to `{}`
* `url` defaults to `'/'`
* `expiresIn` defaults to `120`

Returns the token that sign that request

## Token

If, for some reason, you need only the token you can get it with `sign`

```javascript
import { sign } from 'safeapi-client

async function example2 () {
  /* setCredentials have been called before */


  const token = await sign(url, options)
  /* Token is the token valid for the request fetch(url, options) with the credentials uuid, key*/

}
```
