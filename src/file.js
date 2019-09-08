const saveAs = require('file-saver')
const {
  fromText,
  publicKey,
  toText
} = require('.')

async function fromFile () {
  const text = await new Promise((resolve, reject) => {
    const clean = setTimeout(() => {
      reject(new Error('TimedOut'))
    }, 60000)

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.key'
    input.click()
    input.onchange = e => {
      var file = e.target.files[0]
      var reader = new FileReader()
      reader.readAsText(file, 'UTF-8')
      reader.onload = readerEvent => {
        clearTimeout(clean)
        resolve(readerEvent.target.result)
      }
    }
  })
  return fromText(text)
}

async function toFile () {
  const signedCredentials = await toText()

  var blob = new Blob([signedCredentials], { type: 'text/plain;charset=utf-8' })

  saveAs(blob, `${publicKey.uuid}.${(new Date()).toISOString().substr(0, 19).replace(/[^0-9]/g, '')}.key`, undefined, true)
}
 
exports.fromFile = fromFile
exports.toFile = toFile
