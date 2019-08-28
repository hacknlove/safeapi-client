const seedrandom = require('seedrandom')

function passtokey (password) {
  const rnd = seedrandom(password)
  const buffer = new ArrayBuffer(32)
  const view = new Uint8Array(buffer)

  for (let i = 32; --i;) {
    view[i] = rnd.int32() % 256
  }
  return btoa(String.fromCharCode.apply(null, view))
}

exports.passtokey = passtokey
