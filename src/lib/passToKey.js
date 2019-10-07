import seedrandom from 'seedrandom'

var mybtoa

if (process.browser) {
  mybtoa = btoa
} else {
  mybtoa = text => Buffer.from(text).toString('base64')
}

export function passToKey (password) {
  const rnd = seedrandom(password)
  const buffer = new ArrayBuffer(32)
  const view = new Uint8Array(buffer)

  for (let i = 32; --i;) {
    view[i] = rnd.int32() % 256
  }
  return mybtoa(String.fromCharCode.apply(null, view))
}
