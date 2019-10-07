import { secret, credentials } from './data'

import { encrypt } from './symmetric'

export async function toText () {
  return encrypt({
    random: Math.random(),
    algorithm: credentials.algorithm,
    uuid: credentials.uuid,
    pem: secret.pem
  }, secret.password)
}
