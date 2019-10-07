import { passToKey } from './passToKey'
import { secret } from './data'
export function setPlainPassword (pass = '') {
  secret.password = passToKey(pass)
  return secret.password
}
