import shajs from 'sha.js'
import { conf } from './data'

conf.server = 'https://example.com'

export function hash (request) {
  const {
    method,
    url,
    body
  } = request

  const parsedUrl = new URL(url, conf.server)

  return shajs('sha256').update(JSON.stringify({
    body,
    hostname: parsedUrl.hostname,
    method,
    originalUrl: parsedUrl.pathname + parsedUrl.search,
    protocol: parsedUrl.protocol.replace(/:$/, '')
  })).digest('base64')
}
