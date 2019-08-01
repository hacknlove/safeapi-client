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
