const { renderHook } = require('@testing-library/react-hooks')
const safeApi = require('../')
const fetchHelper = require('@hacknlove/fetchhelper')

describe('useUUID', () => {
  var clean
  afterEach(done => {
    clean()
    setTimeout(done, 500)
  })
  it('devuelve el uuid actual y actualiza cada vez que cambia', async () => {
    fetchHelper.fetch = jest.fn((url, options) => {
      return Promise.resolve({
        ok: true,
        json () {
          return 'nuevoUUID'
        }
      })
    })

    const { result, unmount, waitForNextUpdate } = renderHook(() => safeApi.useUUID())
    clean = unmount

    assert(result.current === '')
    safeApi.createKey()
    await waitForNextUpdate()
    assert(result.current === 'nuevoUUID')
    setTimeout(() => safeApi.logout())
    await waitForNextUpdate()
    assert(result.current === '')
  })
})
