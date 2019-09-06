const safeApi = require('../')
const fetchHelper = require('@hacknlove/fetchhelper')

describe('onUuidChange', () => {
  var i = 'uno'

  var returnedUUID = 'newUUID'
  var removeCallbacks = []
  beforeEach(async () => {
    fetchHelper.fetch = jest.fn((url, options) => {
      return Promise.resolve({
        ok: true,
        json () {
          return returnedUUID
        }
      })
    })
    safeApi.conf.servidor = 'httos://servidor'
    await safeApi.createKey()
  })
  afterEach(() => {
    removeCallbacks.forEach(cb => cb())
    removeCallbacks.length = 0
  })
  it('establece callbacks y llama a todos, cambio probado con logout', () => {
    expect.assertions(3)

    removeCallbacks.push(safeApi.onUuidChange(uuid => {
      assert(uuid === '')
      assert(i === 'uno')
      expect(true).toBe(true)
      i = 'dos'
    }))
    removeCallbacks.push(safeApi.onUuidChange(uuid => {
      assert(uuid === '')
      assert(i === 'dos')
      expect(true).toBe(true)
      i = 'tres'
    }))
    removeCallbacks.push(safeApi.onUuidChange(uuid => {
      assert(uuid === '')
      assert(i === 'tres')
      expect(true).toBe(true)
      i = 'uno'
    }))
    safeApi.logout()

    assert(i === 'uno')
  })
  it('elimina un callback, probado con createKey', async () => {
    expect.assertions(5)
    var expectedUUID
    removeCallbacks.push(safeApi.onUuidChange(uuid => {
      assert(uuid === expectedUUID)
      assert(i === 'uno')
      expect(true).toBe(true)
      i = 'dos'
    }))
    removeCallbacks.push(safeApi.onUuidChange(uuid => {
      assert(uuid === expectedUUID)
      assert(i === 'dos')
      expect(true).toBe(true)
      i = 'tres'
    }))
    removeCallbacks.push(safeApi.onUuidChange(uuid => {
      assert(uuid === expectedUUID)
      assert(i === 'tres')
      expect(true).toBe(true)
      i = 'uno'
    }))
    expectedUUID = ''
    safeApi.logout()
    assert(i === 'uno')
    removeCallbacks[2]()
    expectedUUID = returnedUUID
    await safeApi.createKey()
    assert(i === 'tres')
  })

  it('fromText no lanza los callbacks si el uuid no ha cambiado', async () => {
    removeCallbacks.push(safeApi.onUuidChange(uuid => {
      assert.fail()
    }))
    const exported = await safeApi.toText()
    await safeApi.fromText(exported)
  })

  it('fromText lanza los callbacks si el uuid no ha cambiado', async () => {
    expect.assertions(1)
    removeCallbacks.push(safeApi.onUuidChange(uuid => {
      expect(true).toBe(true)
    }))
    const exported = await safeApi.toText()
    safeApi.publicKey.uuid = 'otro'
    await safeApi.fromText(exported)
  })
})
