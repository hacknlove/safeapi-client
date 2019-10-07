import { fromText } from './fromText'

export async function fromFile () {
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
