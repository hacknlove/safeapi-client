import fetchHelper from '@hacknlove/fetchhelper'
import { secret, conf } from './data'
import { waitUntil } from 'onget'
import { sign } from './sign'
import { logout } from './logout'

export async function sFetch (url, options = {}) {
  if (!secret.pem) {
    await waitUntil('dotted://uuid')
  }

  var {
    method = 'GET',
    body
  } = options

  const Authorization = await sign({
    method,
    url,
    body
  })

  const headers = {
    Authorization,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...conf.headers,
    ...options.headers
  }

  const [res, error] = await fetchHelper([
    `${conf.server}${url}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    }
  ])

  if (conf.onAuthErrorLogout && error && error.authError) {
    logout()
  }
  return [res, error]
}
