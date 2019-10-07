import saveAs from 'file-saver'
import { toText } from './toText'
import { credentials } from './data'

export async function toFile () {
  const signedCredentials = await toText()

  var blob = new Blob([signedCredentials], { type: 'text/plain;charset=utf-8' })

  saveAs(blob, `${credentials.uuid}.${(new Date()).toISOString().substr(0, 19).replace(/[^0-9]/g, '')}.key`, undefined, true)
}
