import { credentials, secret } from './data'
import { set } from 'onget'
export function logout (reason) {
  credentials.uuid = ''
  credentials.pem = ''
  secret.pem = ''
  secret.password = ''
  set('dotted://uuid')
}
